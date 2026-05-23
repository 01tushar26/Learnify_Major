FROM python:3.11-slim

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Requirement.txt .
RUN pip install --no-cache-dir -r Requirement.txt

COPY Controller/controller.py .
COPY Service/transcription.py ./transcription_service.py

ARG WHISPER_MODEL=base
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('${WHISPER_MODEL}', device='cpu', compute_type='int8')"

ENV WHISPER_MODEL=${WHISPER_MODEL}

EXPOSE 8000

CMD ["uvicorn", "controller:app", "--host", "0.0.0.0", "--port", "8000"]