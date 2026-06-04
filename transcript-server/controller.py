import logging

from fastapi import FastAPI, File, UploadFile, HTTPException
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
async def transcribe(file: UploadFile = File(...)):
    """
    Accepts a video file upload, extracts audio with FFmpeg,
    transcribes it with OpenAI Whisper, and returns the transcript.

    Spring Boot should POST to this endpoint as multipart/form-data
    with the video under the field name `file`.
    """
    try:
        content = await file.read()
        result = transcribe_video(file.filename, content)
        return JSONResponse(result)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected error during transcription")
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")


@app.get("/health", summary="Health check")
def health():
    return {"status": "ok", "model": MODEL_NAME}