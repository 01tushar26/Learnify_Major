FROM python:3.11-slim

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Requirement.txt .
RUN pip install --no-cache-dir -r Requirement.txt

COPY Controller/controller.py .
COPY Service/transcription.py ./transcription_service.py

# Groq API key must be supplied at runtime — never bake secrets into the image
# e.g. docker run -e GROQ_API_KEY=gsk_... ...

ENV WHISPER_MODEL=whisper-large-v3

EXPOSE 8000

CMD ["uvicorn", "controller:app", "--host", "0.0.0.0", "--port", "8000"]