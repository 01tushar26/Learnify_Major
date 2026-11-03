# Learnify - Turn any video or PDF into a tutor

Learnify is a distributed learning platform that ingests lecture videos and PDFs, transcribes and indexes them into a vector store, and turns them into a full study workspace: chat with your material, generate quizzes, and get auto-generated **notes and flashcards**. It runs on an async, queue-driven microservice architecture with a two-stage retrieval pipeline (bi-encoder recall + Cohere cross-encoder reranking).

**Live Demo:** _coming soon_

<p align="center">
  <a href="assets/intro.mp4">
    <img src="assets/intro.gif" alt="Learnify intro – click to watch with sound" width="800"/>
  </a>
</p>

---

# Architecture

<p align="center">
  <img src="assets/learnify architecture.png" alt="Client" width="1313"/>
</p>

---

## Features

### Study tools

- **Auto-Generated Notes** — structured notes (title, summary, ordered sections with bullet points) generated from the whole material. Long materials are condensed piece by piece first, so nothing from the middle or end is dropped
- **Swipeable Flashcards** — a card stack styled like the app's material cards. Tap to flip in 3D, swipe up if you know it, swipe down to review again (or use the buttons / arrow keys and space). Sound effects are generated in the browser with the Web Audio API and can be muted; the choice is remembered
- **Spaced-Review Loop** — finish a deck, see your score, and re-run only the cards you missed
- **Downloads** — notes export as Markdown or PDF (clean print view, "Save as PDF"); flashcards export as a tab-separated `.txt` named after the material, which can be imported into Anki (File > Import)
- **One Pack per Material** — enforced by a unique database constraint plus an atomic retry claim, so double-clicks, two tabs, or a race never create a second pack or a second LLM job. Re-opening a finished pack costs no LLM call
- **Durable Generation Jobs** — generation runs through RabbitMQ with one job per consumer at a time, so jobs survive an API restart and LLM concurrency stays bounded
- **Output Validation and Retry** — LLM output is cleaned, parsed, validated, and retried once; unknown fields are ignored and failures surface as a clear toast instead of a broken screen
- **Prompt-Injection Guard** — the material text is treated as untrusted input in every prompt

### Chat and quiz

- **Document Chat** — ask any natural-language question about an ingested material; runs a two-stage retrieval (cosine similarity search over the vector store filtered by `materialId`, then Cohere `rerank-v3.5` reranking), injects the top-4 reranked chunks into the prompt, and returns an answer grounded strictly in that document
- **Two-Stage Retrieval with Cross-Encoder Reranking** — first-stage recall uses the **Ollama** `nomic-embed-text` bi-encoder to fetch a wide candidate set (top-20); second-stage precision uses the **Cohere** `rerank-v3.5` cross-encoder to rescore each query–chunk pair and keep only the best
- **MCQ Quiz Generation** — retrieves a wide candidate set via the bi-encoder, reranks it with Cohere `rerank-v3.5`, keeps up to 8 of the top-scoring chunks, and instructs the LLM to produce a structured JSON array of questions, each with four options (A–D), a correct answer label, and an explanation
- **Interactive Quiz Taking** — optional topic and 5 / 7 / 10 questions; each answer is checked by the backend as you pick it, the correct option highlights green, a wrong pick red, with a per-question explanation and a final score. Correct answers are never sent to the client before you answer
- **Quiz History** — generated quizzes are persisted and retrievable later via `GET /quiz/{id}`

### Ingestion

- **Multilingual Video Lecture Ingestion** — upload `.mp4`, `.mkv`, `.avi`, or `.mov` (up to 500 MB); a dedicated Python microservice extracts audio with FFmpeg and transcribes it via **Groq Whisper** (`whisper-large-v3`), supporting 99 languages with automatic translation to English before ingestion
- **Chunked Transcription for Long Videos** — large videos are split into 10-minute chunks to stay within Groq's API limits, with timestamps preserved and stitched across chunks
- **PDF Ingestion** — parsed page-by-page, cleaned of encoding artifacts and whitespace noise, then chunked into 800-token segments tagged with `materialId`, source file, page number, and timestamp
- **Full-Text Retention** — the complete extracted text is saved alongside the vector chunks (used by notes and flashcards), and removed when the material is deleted
- **Local Embeddings via Ollama** — all chunks are embedded using **Ollama** (`nomic-embed-text`) and stored in PostgreSQL with the pgvector extension
- **Asynchronous Processing with Job Tracking** — uploads are published to a **RabbitMQ** queue and processed in the background; each material has a unique `jobId` and transitions through `QUEUED → PROCESSING → DONE / FAILED`, pollable via `GET /materials/{id}/status`
- **Duplicate Upload Detection** — re-uploading the same filename for the same user returns `409 Conflict` with the existing job's details
- **Clean Deletion** — deleting a material removes its quizzes and study pack (cascade) and publishes an event so `rag-worker` deletes the vector chunks and stored full text

### Platform

- **Google OAuth2 Authentication** — no passwords; sign-in via Google, with short-lived access tokens and long-lived (6-month) refresh tokens rotated on every use, stored in an HttpOnly cookie
- **Per-User Data Isolation** — every material, quiz, study pack, and vector chunk is scoped to the owning user; ownership is enforced at the service layer before any cross-service call
- **Semantic Search and Text Microservice** — `rag-worker` exposes internal-only endpoints (`/internal/search`, `/internal/materials/{id}/text`) that keep all retrieval and stored-text access in one place, never exposed publicly
- **Decoupled Status Reporting** — worker services have no direct access to the `material` table; they report status changes back to `learnify-api` over a dedicated RabbitMQ queue
- **Database-per-Service** — `learnify-api`'s relational data (materials, quizzes, study packs) and `rag-worker`'s data (vector store, full text) live in separate Postgres databases, so no service can accidentally query another's tables
- **RabbitMQ Topology Ownership** — each service only declares the queues/bindings it consumes, and only the bare exchange for anything it merely publishes to, avoiding first-boot race conditions
- **Consistent Error Handling** — custom exceptions (`ResourceNotFoundException` as 404, `AccessDeniedException`, `DuplicateResourceException`) mapped to a uniform `ApiError` response; unexpected errors return a generic message and are logged server-side instead of leaking internals
- **Resilient Frontend** — toast notifications for failures, and an automatic redirect to the home page when the server is unreachable
- **Fully Containerized Stack** — Docker Compose orchestrates the API gateway, both worker services, the transcription service, PostgreSQL, RabbitMQ, and the frontend as isolated, restart-safe services for one-command local setup

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| API Gateway | Spring Boot (`learnify-api`) |
| Video Worker | Spring Boot (`video-worker`) |
| RAG Worker | Spring Boot (`rag-worker`) |
| Transcription Service | Python (Groq Whisper, FFmpeg) |
| Messaging | RabbitMQ (ingestion, status updates, study pack jobs, deletion events) |
| Database | PostgreSQL (Spring Data JPA) |
| Vector Database | PostgreSQL + pgvector (Spring AI Vector Store) |
| Embeddings (Stage 1 bi-encoder) | `nomic-embed-text` |
| Reranker (Stage 2 cross-encoder) | Cohere (`rerank-v3.5`) |
| LLM (Chat / Quiz / Notes / Flashcards) | OpenAI-compatible API via Spring AI |
| Auth | Google OAuth2 + JWT (access + HttpOnly refresh cookie) |
| Containerization | Docker, Docker Compose |

---

## API Reference

### Auth — `/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/oauth2/authorization/google` | Start Google OAuth2 login |
| `POST` | `/auth/refresh` | Rotate access + refresh token (refresh token read from cookie) |
| `POST` | `/auth/logout` | Revoke refresh token + clear cookie |

### Materials — `/materials`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/materials/video` | Upload a video; queues transcription + indexing |
| `POST` | `/materials/pdf` | Upload a PDF; queues parsing + indexing |
| `GET` | `/materials/{id}/status` | Poll ingestion status for a material |
| `GET` | `/materials` | List all materials owned by the current user |
| `DELETE` | `/materials/{id}` | Delete a finished material, its study pack, vectors and stored text |

### Study pack (notes + flashcards) — `/materials/{id}/study`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/materials/{id}/study` | Start generation (idempotent: returns the existing pack if one exists; only a failed or stuck pack is retried) |
| `GET` | `/materials/{id}/study` | Status only: `PROCESSING` / `DONE` / `FAILED` (`404` if no pack yet) |
| `GET` | `/materials/{id}/study/notes` | Notes: `{ title, summary, sections: [{ heading, points }] }` |
| `GET` | `/materials/{id}/study/flashcards` | Flashcards: `[{ front, back }]` |

### Chat — `/chat`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/chat` | Ask a question about a specific material (`{ question, materialId }`) |

### Quiz — `/quiz`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/quiz/generate` | Generate a quiz from a material (`{ topic, materialId, numberOfQuestions }`) |
| `GET` | `/quiz/{id}` | Fetch a previously generated quiz |
| `POST` | `/quiz/submit` | Check answers (`{ quizId, answers }`); returns correct answers and explanations for answered questions only |

### Internal — service-to-service only, not publicly exposed

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/internal/search` | `rag-worker`'s semantic search endpoint, called only by `learnify-api` |
| `GET` | `/internal/materials/{id}/text` | Full stored text of a material, called only by `learnify-api` for study pack generation |

> Keep `/internal/**` on the private Docker network. It has no authentication of its own.

---

## Running Locally

> Requires **Docker** and **Docker Compose** to be installed.

1. **Create the `.env` file**

   ```bash
   cp example.env .env
   ```

   Fill in the following variables:

   | Variable | Description |
      |---|---|
   | `DB_PASSWORD` | PostgreSQL password |
   | `RABBITMQ_PASSWORD` | RabbitMQ password |
   | `JWT_SECRETKEY` | Secret key used to sign JWT tokens |
   | `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
   | `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
   | `GROQ_API_KEY` | Groq API key (transcription, and LLM if you use Groq) |
   | `COHERE_API_KEY` | Cohere API key (reranking) |
   | `TRANSCRIPTION_WORKER_URL` | Transcription service URL (use the Compose service name, e.g. `http://transcript-server:8000`) |
   | `FRONTEND_URL` | Frontend origin for OAuth redirect and CORS |

2. **Build each service image**

   ```bash
   cd learnify-api && docker build -t learnifyapi-service:latest . && cd ..
   cd video-worker && docker build -t video-worker:latest . && cd ..
   cd rag-worker && docker build -t rag-worker:latest . && cd ..
   ```

3. **Run the stack**

   ```bash
   docker-compose -f docker-compose.yml up -d --build
   ```

4. **Access the app**

   - Frontend: http://localhost:5173
   - Backend: http://localhost:8080/api/v1
   - RabbitMQ Management UI: http://localhost:15672

Stop everything with:

```bash
docker-compose -f docker-compose.yml down
```

