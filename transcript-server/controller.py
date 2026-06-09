import logging

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from transcription_service import transcribe_video, MODEL_NAME

# ── Logging ───────────────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Video Transcription Service",
    description="Accepts a video file, extracts audio via FFmpeg, transcribes with Whisper.",
    version="1.0.0",
)


@app.post("/transcribe", summary="Transcribe a video file")
async def transcribe(
    file: UploadFile = File(...),
    language: str | None = Form(
        default=None,
        description=(
            "Optional BCP-47 language code of the spoken audio "
            "(e.g. 'fr', 'hi', 'ja', 'ar'). "
            "When omitted, Whisper auto-detects the language. "
            "Providing the correct code improves accuracy and speed."
        ),
    ),
    translate: bool = Form(
        default=True,
        description=(
            "When True (default), Groq's translation endpoint is used and "
            "the transcript is always returned in English. "
            "When False, the transcript is returned in the source language."
        ),
    ),
):
    """
    Accepts a video file upload, extracts audio with FFmpeg,
    transcribes it with OpenAI Whisper via Groq, and returns the transcript.

    Spring Boot should POST to this endpoint as multipart/form-data
    with the video under the field name `file`.

    Optional form fields:
    - `language`: BCP-47 language code hint (e.g. "fr", "hi", "ja")
    - `translate`: boolean — True (default) returns English output,
                             False returns transcript in source language
    """
    try:
        content = await file.read()
        result = transcribe_video(
            file.filename,
            content,
            language=language,
            translate=translate,
        )
        return JSONResponse(result)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected error during transcription")
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")


@app.get("/health", summary="Health check")
def health():
    return {"status": "ok", "model": MODEL_NAME}