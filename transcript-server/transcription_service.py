import os
import uuid
import subprocess
import tempfile
import logging
from pathlib import Path

from openai import OpenAI

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY environment variable is not set")

MODEL_NAME = os.getenv("WHISPER_MODEL", "whisper-large-v3")
logger.info(f"Using Groq Whisper model: {MODEL_NAME}")

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

TEMP_DIR = Path(tempfile.gettempdir()) / "transcription_service"
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# Stay safely under Groq's 25MB audio limit
GROQ_MAX_BYTES = 20 * 1024 * 1024  # 20MB

# Each chunk is 10 minutes — at 16kHz mono WAV (~2MB/min) this is ~20MB per chunk
CHUNK_DURATION_SECONDS = 600


def extract_audio(video_path: Path, audio_path: Path) -> None:
    cmd = [
        "ffmpeg", "-y", "-i", str(video_path),
        "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
        str(audio_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg failed: {result.stderr}")


def split_audio(audio_path: Path, request_id: str) -> list[Path]:
    """
    If the audio file is under GROQ_MAX_BYTES, return it as-is.
    Otherwise split into CHUNK_DURATION_SECONDS chunks using FFmpeg
    and return the list of chunk paths.
    """
    size = audio_path.stat().st_size
    if size <= GROQ_MAX_BYTES:
        logger.info(f"[{request_id}] Audio size {size / 1024 / 1024:.1f}MB — no chunking needed.")
        return [audio_path]

    logger.info(
        f"[{request_id}] Audio size {size / 1024 / 1024:.1f}MB exceeds "
        f"{GROQ_MAX_BYTES / 1024 / 1024:.0f}MB limit — splitting into "
        f"{CHUNK_DURATION_SECONDS}s chunks..."
    )

    chunks = []
    i = 0
    while True:
        chunk_path = TEMP_DIR / f"{request_id}_chunk{i}.wav"
        cmd = [
            "ffmpeg", "-y",
            "-i", str(audio_path),
            "-ss", str(i * CHUNK_DURATION_SECONDS),
            "-t", str(CHUNK_DURATION_SECONDS),
            "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
            str(chunk_path),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)

        # Stop if ffmpeg failed or produced an empty/tiny file (end of audio)
        if result.returncode != 0 or not chunk_path.exists() or chunk_path.stat().st_size < 1000:
            chunk_path.unlink(missing_ok=True)
            break

        chunks.append(chunk_path)
        logger.info(
            f"[{request_id}] Chunk {i}: {chunk_path.stat().st_size / 1024 / 1024:.1f}MB"
        )
        i += 1

    logger.info(f"[{request_id}] Split into {len(chunks)} chunk(s).")
    return chunks


def transcribe_video(
    filename: str,
    content: bytes,
    language: str | None = None,
    translate: bool = True,
) -> dict:
    """
    Transcribe (or translate) the audio track of a video file.

    Args:
        filename:  Original filename; used to preserve the file extension.
        content:   Raw bytes of the uploaded video.
        language:  Optional BCP-47 language code hint (e.g. "fr", "hi", "ja").
                   Providing the correct code improves Whisper accuracy and
                   avoids mis-detection on short or noisy audio.
                   When None, Whisper auto-detects the language.
        translate: When True (default), Groq's translation endpoint is used
                   and the transcript is always returned in English.
                   When False, Groq's transcription endpoint is used and the
                   transcript is returned in the source language.

    Returns:
        A dict with keys: request_id, filename, language, translated,
        transcript, segments.
    """
    request_id = uuid.uuid4().hex[:8]
    video_path = TEMP_DIR / f"{request_id}_input{Path(filename).suffix or '.mp4'}"
    audio_path = TEMP_DIR / f"{request_id}_audio.wav"

    try:
        video_path.write_bytes(content)
        extract_audio(video_path, audio_path)

        chunks = split_audio(audio_path, request_id)

        endpoint = "translations" if translate else "transcriptions"
        log_lang = f"language={language!r}" if language else "language=auto-detect"
        logger.info(
            f"[{request_id}] Sending {len(chunks)} chunk(s) to Groq Whisper "
            f"({MODEL_NAME}, endpoint={endpoint}, {log_lang})..."
        )

        api_kwargs: dict = {
            "model": MODEL_NAME,
            "response_format": "verbose_json",
        }
        if language:
            api_kwargs["language"] = language

        all_segments = []
        all_text = []
        detected_language = "unknown"
        seg_time_offset = 0.0
        last_resp = None

        for chunk_index, chunk_path in enumerate(chunks):
            logger.info(f"[{request_id}] Processing chunk {chunk_index + 1}/{len(chunks)}...")

            with open(chunk_path, "rb") as audio_file:
                if translate:
                    resp = client.audio.translations.create(
                        file=audio_file,
                        **api_kwargs,
                    )
                else:
                    resp = client.audio.transcriptions.create(
                        file=audio_file,
                        **api_kwargs,
                    )

            last_resp = resp
            detected_language = getattr(resp, "language", detected_language)
            raw_segments = getattr(resp, "segments", []) or []
            chunk_end_time = 0.0

            for seg in raw_segments:
                seg_start = round(getattr(seg, "start", 0.0) + seg_time_offset, 2)
                seg_end = round(getattr(seg, "end", 0.0) + seg_time_offset, 2)
                all_segments.append({
                    "id": len(all_segments),
                    "start": seg_start,
                    "end": seg_end,
                    "text": (getattr(seg, "text", "") or "").strip(),
                })
                chunk_end_time = max(chunk_end_time, getattr(seg, "end", 0.0))

            chunk_text = (resp.text or "").strip()
            if not chunk_text:
                chunk_text = " ".join(s["text"] for s in all_segments)
            all_text.append(chunk_text)

            # Advance time offset for the next chunk
            seg_time_offset += chunk_end_time if chunk_end_time > 0 else CHUNK_DURATION_SECONDS

            # Clean up chunk file (but not the original audio file)
            if chunk_path != audio_path:
                chunk_path.unlink(missing_ok=True)

        transcript = " ".join(all_text).strip()

        # Fallback if transcript is still empty
        if not transcript:
            transcript = " ".join(s["text"] for s in all_segments).strip()

        return {
            "request_id": request_id,
            "filename": filename,
            "language": detected_language,
            "translated": translate,
            "transcript": transcript,
            "segments": all_segments,
        }

    finally:
        for p in (video_path, audio_path):
            if p.exists():
                p.unlink()