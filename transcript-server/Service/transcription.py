import os
import uuid
import subprocess
import tempfile
import logging
from pathlib import Path

from faster_whisper import WhisperModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

MODEL_NAME = os.getenv("WHISPER_MODEL", "base")
logger.info(f"Loading Whisper model: {MODEL_NAME}")
model = WhisperModel(MODEL_NAME, device="cpu", compute_type="int8")
logger.info("Whisper model loaded ✓")

TEMP_DIR = Path(tempfile.gettempdir()) / "transcription_service"
TEMP_DIR.mkdir(parents=True, exist_ok=True)


def extract_audio(video_path: Path, audio_path: Path) -> None:
    cmd = ["ffmpeg", "-y", "-i", str(video_path),
           "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", str(audio_path)]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg failed: {result.stderr}")


def transcribe_video(filename: str, content: bytes) -> dict:
    request_id = uuid.uuid4().hex[:8]
    video_path = TEMP_DIR / f"{request_id}_input{Path(filename).suffix or '.mp4'}"
    audio_path = TEMP_DIR / f"{request_id}_audio.wav"

    try:
        video_path.write_bytes(content)
        extract_audio(video_path, audio_path)

        segments, info = model.transcribe(str(audio_path))
        detected_language = info.language
        result_segments = []
        transcript_parts = []

        for seg in segments:
            transcript_parts.append(seg.text.strip())
            result_segments.append({
                "id": seg.id,
                "start": round(seg.start, 2),
                "end": round(seg.end, 2),
                "text": seg.text.strip(),
            })

        return {
            "request_id": request_id,
            "filename": filename,
            "language": detected_language,
            "transcript": " ".join(transcript_parts),
            "segments": result_segments,
        }
    finally:
        for p in (video_path, audio_path):
            if p.exists():
                p.unlink()