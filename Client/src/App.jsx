import { useState, useRef, useEffect, useCallback } from "react";

const API = "http://localhost:8080";

// ─── CSS injected once ────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #0b0c10;
    --surface:   #111318;
    --surface2:  #181b22;
    --border:    #1f2230;
    --border2:   #252a38;
    --ink:       #e8eaf2;
    --ink2:      #8a8faa;
    --ink3:      #4a4f66;
    --accent:    #5b6eff;
    --accent-hi: #7c8fff;
    --accent-lo: #1a1f3a;
    --green:     #22c55e;
    --green-lo:  #052010;
    --red:       #f43f5e;
    --red-lo:    #200610;
    --amber:     #f59e0b;
    --radius:    10px;
    --radius-lg: 16px;
    --mono: 'DM Mono', monospace;
    --sans: 'DM Sans', sans-serif;
    --display: 'Syne', sans-serif;
    --transition: 160ms ease;
  }

  html { font-size: 14px; }
  body { background: var(--bg); color: var(--ink); font-family: var(--sans); line-height: 1.6; min-height: 100vh; }

  /* ── Layout ── */
  .app-shell { display: grid; grid-template-rows: 56px 1fr; min-height: 100vh; }
  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; border-bottom: 1px solid var(--border);
    background: rgba(11,12,16,0.92); backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 50;
  }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-mark {
    width: 30px; height: 30px; border-radius: 8px;
    background: var(--accent); display: grid; place-items: center;
    font-size: 15px; line-height: 1;
  }
  .logo-text { font-family: var(--display); font-weight: 800; font-size: 17px; letter-spacing: -0.5px; }
  .badge {
    font-family: var(--mono); font-size: 10px; letter-spacing: 0.04em;
    background: var(--accent-lo); color: var(--accent-hi);
    border: 1px solid var(--border2); border-radius: 4px; padding: 2px 7px;
  }
  .body-grid {
    display: grid; grid-template-columns: 300px 1fr;
    gap: 0; height: calc(100vh - 56px); overflow: hidden;
  }
  .sidebar {
    border-right: 1px solid var(--border);
    overflow-y: auto; padding: 20px 16px;
    display: flex; flex-direction: column; gap: 14px;
    scrollbar-width: thin; scrollbar-color: var(--border2) transparent;
  }
  .main { overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 0; }

  /* ── Cards ── */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-lg); overflow: hidden;
  }
  .card-head {
    padding: 12px 16px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 8px;
  }
  .card-title { font-family: var(--display); font-weight: 700; font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--ink2); }
  .card-body { padding: 14px 16px; }

  /* ── Drop zone ── */
  .drop-zone {
    border: 1.5px dashed var(--border2); border-radius: var(--radius);
    padding: 24px 16px; text-align: center; cursor: pointer;
    transition: all var(--transition); display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .drop-zone:hover, .drop-zone.over { border-color: var(--accent); background: var(--accent-lo); }
  .drop-zone.has-file { border-color: var(--green); border-style: solid; background: var(--green-lo); }
  .drop-zone.error-zone { border-color: var(--red); border-style: solid; background: var(--red-lo); }

  /* ── Buttons ── */
  button { font-family: var(--sans); cursor: pointer; border: none; transition: all var(--transition); }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--radius); font-size: 13px; font-weight: 500;
    width: 100%;
  }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-accent { background: var(--accent); color: #fff; }
  .btn-accent:hover:not(:disabled) { background: var(--accent-hi); }
  .btn-ghost { background: var(--surface2); color: var(--ink2); border: 1px solid var(--border2); }
  .btn-ghost:hover:not(:disabled) { color: var(--ink); border-color: var(--accent); }
  .btn-success { background: var(--green); color: #fff; }
  .btn-success:hover:not(:disabled) { filter: brightness(1.1); }
  .btn-danger { background: var(--red); color: #fff; }

  /* ── Tabs ── */
  .tabs { display: flex; gap: 4px; padding: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); margin-bottom: 20px; }
  .tab {
    flex: 1; padding: 8px; border-radius: 8px; font-size: 12.5px; font-weight: 600;
    font-family: var(--display); letter-spacing: 0.02em; background: none; color: var(--ink3);
    transition: all var(--transition);
  }
  .tab.active { background: var(--surface2); color: var(--ink); box-shadow: 0 1px 8px rgba(0,0,0,0.3); }
  .tab:hover:not(.active) { color: var(--ink2); }

  /* ── Chat ── */
  .chat-scroll {
    flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;
    padding: 16px; min-height: 380px; max-height: 460px;
    background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-lg);
    scrollbar-width: thin; scrollbar-color: var(--border2) transparent;
  }
  .bubble { max-width: 80%; padding: 10px 14px; border-radius: var(--radius); font-size: 13.5px; line-height: 1.6; word-break: break-word; }
  .bubble-user { align-self: flex-end; background: var(--accent); color: #fff; border-bottom-right-radius: 3px; }
  .bubble-ai { align-self: flex-start; background: var(--surface2); color: var(--ink); border: 1px solid var(--border2); border-bottom-left-radius: 3px; }
  .bubble-error { align-self: flex-start; background: var(--red-lo); color: var(--red); border: 1px solid var(--red); border-bottom-left-radius: 3px; }
  .chat-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 8px; color: var(--ink3); text-align: center; }
  .chat-empty .icon { font-size: 36px; opacity: 0.4; }
  .chat-empty p { font-size: 13px; max-width: 200px; line-height: 1.5; }
  .chat-input-row { display: flex; gap: 8px; margin-top: 10px; }
  .chat-input {
    flex: 1; background: var(--surface2); border: 1px solid var(--border2);
    border-radius: var(--radius); color: var(--ink); font-family: var(--sans); font-size: 13.5px;
    padding: 9px 14px; outline: none; transition: border-color var(--transition);
  }
  .chat-input:focus { border-color: var(--accent); }
  .chat-input::placeholder { color: var(--ink3); }
  .chat-input:disabled { opacity: 0.5; }
  .send-btn {
    width: 40px; height: 40px; border-radius: var(--radius); background: var(--accent); color: #fff; font-size: 16px;
    flex-shrink: 0; display: grid; place-items: center;
  }
  .send-btn:hover:not(:disabled) { background: var(--accent-hi); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Quiz ── */
  .quiz-controls { display: flex; gap: 10px; margin-bottom: 16px; }
  .quiz-input {
    flex: 1; background: var(--surface2); border: 1px solid var(--border2);
    border-radius: var(--radius); color: var(--ink); font-family: var(--sans); font-size: 13px;
    padding: 8px 12px; outline: none; transition: border-color var(--transition);
  }
  .quiz-input:focus { border-color: var(--accent); }
  .quiz-input::placeholder { color: var(--ink3); }
  .num-input { width: 64px; text-align: center; }

  .q-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px 20px; margin-bottom: 12px; }
  .q-header { display: flex; gap: 10px; margin-bottom: 14px; align-items: flex-start; }
  .q-num {
    flex-shrink: 0; width: 26px; height: 26px; border-radius: 6px;
    background: var(--accent-lo); color: var(--accent-hi); font-family: var(--mono);
    font-size: 11px; display: grid; place-items: center; margin-top: 2px; border: 1px solid var(--border2);
  }
  .q-text { font-size: 14px; font-weight: 500; line-height: 1.55; color: var(--ink); }
  .options { display: flex; flex-direction: column; gap: 7px; }
  .opt {
    width: 100%; text-align: left; padding: 9px 14px; border-radius: var(--radius);
    font-size: 13px; font-family: var(--sans); line-height: 1.45;
    background: var(--surface2); color: var(--ink2); border: 1px solid var(--border2);
    transition: all var(--transition); display: flex; align-items: center; gap: 10px;
  }
  .opt:hover:not(:disabled):not(.opt-locked) { border-color: var(--accent); color: var(--ink); background: var(--accent-lo); }
  .opt.selected { border-color: var(--accent); color: var(--ink); background: var(--accent-lo); }
  .opt.correct { border-color: var(--green); color: var(--green); background: var(--green-lo); }
  .opt.wrong { border-color: var(--red); color: var(--red); background: var(--red-lo); }
  .opt.dimmed { opacity: 0.4; }
  .opt:disabled { cursor: default; }
  .opt-key {
    flex-shrink: 0; width: 20px; height: 20px; border-radius: 4px;
    background: var(--border2); font-family: var(--mono); font-size: 10px;
    display: grid; place-items: center; font-weight: 600;
  }
  .opt.selected .opt-key { background: var(--accent); color: #fff; }
  .opt.correct .opt-key { background: var(--green); color: #fff; }
  .opt.wrong .opt-key { background: var(--red); color: #fff; }

  .expl-box {
    margin-top: 12px; padding: 10px 14px; border-radius: var(--radius);
    background: rgba(91,110,255,0.06); border: 1px solid rgba(91,110,255,0.18);
    font-size: 12.5px; color: var(--ink2); line-height: 1.6;
  }
  .expl-box strong { color: var(--accent-hi); }

  .score-banner {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surface); border: 1px solid var(--border2); border-radius: var(--radius-lg);
    padding: 18px 24px; margin-bottom: 16px;
  }
  .score-left .score-label { font-family: var(--display); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink3); margin-bottom: 4px; }
  .score-left .score-num { font-family: var(--display); font-weight: 800; font-size: 28px; }
  .score-pct { font-family: var(--mono); font-size: 36px; font-weight: 300; color: var(--accent-hi); }

  /* ── Status indicators ── */
  .status-row { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 12px; }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .dot-green { background: var(--green); box-shadow: 0 0 6px var(--green); }
  .dot-amber { background: var(--amber); box-shadow: 0 0 6px var(--amber); animation: pulse 1.4s infinite; }
  .dot-red { background: var(--red); }
  .dot-dim { background: var(--ink3); }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

  .active-file {
    display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: var(--radius);
    background: var(--green-lo); border: 1px solid rgba(34,197,94,0.2); font-size: 12px;
  }
  .active-file-name { color: #4ade80; font-family: var(--mono); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* ── Error banner ── */
  .err-banner {
    padding: 10px 14px; border-radius: var(--radius); font-size: 12.5px; line-height: 1.5;
    background: var(--red-lo); border: 1px solid rgba(244,63,94,0.3); color: var(--red);
    margin-top: 10px; display: flex; align-items: flex-start; gap: 8px;
  }
  .err-code { font-family: var(--mono); font-size: 10px; color: rgba(244,63,94,0.6); margin-top: 2px; white-space: nowrap; }

  /* ── Spinner ── */
  .spin {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.15); border-top-color: currentColor;
    animation: spin 0.7s linear infinite; flex-shrink: 0; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Progress bar ── */
  .progress-bar { height: 3px; background: var(--border2); border-radius: 99px; overflow: hidden; margin-top: 8px; }
  .progress-fill { height: 100%; background: var(--accent); border-radius: 99px; transition: width 0.4s ease; }

  /* ── Misc ── */
  .muted { color: var(--ink3); font-size: 12px; }
  .lbl { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--ink3); margin-bottom: 6px; font-family: var(--display); }
  .pill { font-family: var(--mono); font-size: 10px; padding: 2px 7px; border-radius: 4px; background: var(--surface2); border: 1px solid var(--border2); color: var(--ink3); }
  .divider { height: 1px; background: var(--border); margin: 12px 0; }
  .empty-state { text-align: center; padding: 48px 20px; color: var(--ink3); }
  .empty-state .ei { font-size: 40px; opacity: 0.25; margin-bottom: 10px; }
  .empty-state p { font-size: 13px; line-height: 1.6; }

  /* ── Conflict notice ── */
  .conflict-box {
    padding: 12px 14px; border-radius: var(--radius); margin-top: 10px;
    background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); font-size: 12.5px;
  }
  .conflict-box .ctitle { color: var(--amber); font-weight: 600; margin-bottom: 4px; }
  .conflict-box .cmeta { font-family: var(--mono); font-size: 11px; color: var(--ink3); }
  .conflict-box .cactions { display: flex; gap: 6px; margin-top: 10px; }

  /* scrollbar */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Spin({ color = "currentColor" }) {
  return <span className="spin" style={{ color }} />;
}

// Parse API error into human-readable message
// Backend wraps errors in ApiResponse { error: { message, httpStatus } }
async function parseError(res) {
  try {
    const body = await res.json();
    const err = body?.error;
    if (err?.message) return { msg: err.message, code: err.httpStatus || res.status };
    if (body?.message) return { msg: body.message, code: res.status };
    return { msg: `Server returned ${res.status}`, code: res.status };
  } catch {
    return { msg: `HTTP ${res.status} — ${res.statusText || "Unknown error"}`, code: res.status };
  }
}

function ErrorBox({ msg, code }) {
  if (!msg) return null;
  return (
    <div className="err-banner">
      <span>✗</span>
      <div style={{ flex: 1 }}>
        <div>{msg}</div>
        {code && <div className="err-code">STATUS {code}</div>}
      </div>
    </div>
  );
}

// ─── Video Upload ─────────────────────────────────────────────────────────────
function VideoUpload({ onReady }) {
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle|uploading|polling|done|error|conflict
  const [msg, setMsg] = useState("");
  const [error, setError] = useState(null); // { msg, code }
  const [conflict, setConflict] = useState(null); // { jobId, status }
  const [jobId, setJobId] = useState(null);
  const [fileName, setFileName] = useState("");
  const [over, setOver] = useState(false);
  const inputRef = useRef();
  const pollRef = useRef();

  function reset() {
    clearInterval(pollRef.current);
    setFile(null); setPhase("idle"); setMsg(""); setError(null);
    setConflict(null); setJobId(null); setFileName(""); onReady(null);
  }

  function pickFile(f) {
    if (!f) return;
    setFile(f); setPhase("idle"); setMsg(""); setError(null); setConflict(null);
    setJobId(null); setFileName(""); onReady(null);
  }

  async function upload() {
    if (!file) return;
    setPhase("uploading"); setMsg("Uploading…"); setError(null); setConflict(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API}/rag/ingestVideo`, { method: "POST", body: form });

      if (res.status === 409) {
        // Duplicate — ApiResponse { data: { jobId, status }, error: { message } }
        const body = await res.json();
        const data = body?.data || {};
        const errMsg = body?.error?.message || "File already exists.";
        setPhase("conflict");
        setConflict({ jobId: data.jobId, status: data.status, msg: errMsg });
        return;
      }
      if (!res.ok) {
        const e = await parseError(res);
        setPhase("error"); setError(e); return;
      }

      const body = await res.json();
      const data = body?.data || body;
      const jid = data.jobId;
      const fname = data.fileName || file.name;
      setJobId(jid); setFileName(fname);
      setPhase("polling"); setMsg("Processing…");
      poll(jid, fname);
    } catch (err) {
      setPhase("error"); setError({ msg: err.message, code: null });
    }
  }

  function poll(jid, fname) {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/rag/video/status/${jid}`);
        if (!res.ok) return;
        const body = await res.json();
        // VideoDto { jobId, fileName, status, errorMessage, createdAt }
        const data = body?.data || body;
        const s = (data.status || "").toUpperCase();
        if (s === "DONE") {
          clearInterval(pollRef.current);
          setPhase("done"); setMsg(""); onReady(fname);
        } else if (s === "FAILED") {
          clearInterval(pollRef.current);
          setPhase("error");
          setError({ msg: data.errorMessage || "Processing failed on the server.", code: "FAILED" });
        } else {
          // QUEUED or PROCESSING
          setMsg(s === "PROCESSING" ? "Transcribing audio…" : "Queued — waiting for worker…");
        }
      } catch { /* keep polling */ }
    }, 3000);
  }

  // Use existing job from conflict resolution
  function useExisting() {
    if (!conflict) return;
    const fname = file?.name || "";
    setPhase("done"); setJobId(conflict.jobId); setFileName(fname);
    setConflict(null); onReady(fname);
  }
  async function reUpload() {
    setConflict(null);
    await upload();
  }

  useEffect(() => () => clearInterval(pollRef.current), []);

  const busy = phase === "uploading" || phase === "polling";
  const isZoneError = phase === "error";
  const isDone = phase === "done";
  const isConflict = phase === "conflict";

  return (
    <div className="card">
      <div className="card-head">
        <span style={{ fontSize: 14 }}>▶</span>
        <span className="card-title">Video Source</span>
        {file && !busy && (
          <button onClick={reset} style={{ marginLeft: "auto", background: "none", color: "var(--ink3)", fontSize: 16, lineHeight: 1 }}>×</button>
        )}
      </div>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Drop zone */}
        <div
          className={`drop-zone${isDone ? " has-file" : ""}${isZoneError ? " error-zone" : ""}${over ? " over" : ""}`}
          onClick={() => !busy && inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={e => { e.preventDefault(); setOver(false); pickFile(e.dataTransfer.files[0]); }}
        >
          <input ref={inputRef} type="file" accept="video/*,.mkv" style={{ display: "none" }}
            onChange={e => pickFile(e.target.files[0])} />
          {isDone ? (
            <>
              <span style={{ fontSize: 24 }}>✓</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>{fileName || file?.name}</span>
              <span className="muted">indexed & ready</span>
            </>
          ) : file ? (
            <>
              <span style={{ fontSize: 22 }}>🎬</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{file.name}</span>
              <span className="muted">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 22, opacity: 0.4 }}>▲</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>Drop video or click to browse</span>
              <span className="muted">MP4 · MKV · AVI · MOV · WebM</span>
            </>
          )}
        </div>

        {/* Upload button */}
        <button
          className="btn btn-accent"
          disabled={!file || busy || isDone || isConflict}
          onClick={upload}
        >
          {phase === "uploading" && <><Spin /> Uploading…</>}
          {phase === "polling" && <><Spin /> {msg}</>}
          {isDone && <>✓ Ready</>}
          {(phase === "idle" || phase === "error") && <>Upload & Process</>}
          {isConflict && <>Duplicate detected</>}
        </button>

        {/* Polling progress */}
        {phase === "polling" && (
          <div>
            <div className="status-row">
              <span className="status-dot dot-amber" />
              <span className="muted">{msg}</span>
              {jobId && <span className="pill">{jobId.slice(0, 8)}…</span>}
            </div>
            <div className="progress-bar" style={{ marginTop: 6 }}>
              <div className="progress-fill" style={{ width: "60%", animation: "none" }} />
            </div>
          </div>
        )}

        {/* Done status */}
        {isDone && (
          <div className="status-row">
            <span className="status-dot dot-green" />
            <span style={{ color: "var(--green)", fontSize: 12, fontWeight: 500 }}>
              {fileName} — ingested successfully
            </span>
          </div>
        )}

        {/* Error */}
        {phase === "error" && <ErrorBox msg={error?.msg} code={error?.code} />}

        {/* Conflict / 409 */}
        {isConflict && conflict && (
          <div className="conflict-box">
            <div className="ctitle">⚠ File already exists</div>
            <div style={{ color: "var(--ink2)", fontSize: 12.5, marginBottom: 6 }}>{conflict.msg}</div>
            <div className="cmeta">Job {conflict.jobId?.slice(0, 12)}… · {conflict.status}</div>
            <div className="cactions">
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={useExisting}>
                Use existing
              </button>
              <button className="btn btn-accent" style={{ flex: 1 }} onClick={reUpload}>
                Re-process
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PDF Upload ───────────────────────────────────────────────────────────────
function PdfUpload({ onReady }) {
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle|loading|done|error
  const [result, setResult] = useState(null); // IngestResponseDto
  const [error, setError] = useState(null);
  const [over, setOver] = useState(false);
  const inputRef = useRef();

  function reset() { setFile(null); setPhase("idle"); setResult(null); setError(null); onReady(null); }
  function pickFile(f) { if (!f) return; setFile(f); setPhase("idle"); setResult(null); setError(null); onReady(null); }

  async function ingest() {
    if (!file) return;
    setPhase("loading"); setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API}/rag/ingestPdf`, { method: "POST", body: form });
      if (!res.ok) { const e = await parseError(res); setPhase("error"); setError(e); return; }
      const body = await res.json();
      // IngestResponseDto { fileName, chunkSize, docSize }
      const data = body?.data || body;
      setResult(data); setPhase("done"); onReady(data.fileName || file.name);
    } catch (err) {
      setPhase("error"); setError({ msg: err.message, code: null });
    }
  }

  const busy = phase === "loading";
  const isDone = phase === "done";

  return (
    <div className="card">
      <div className="card-head">
        <span style={{ fontSize: 14 }}>📄</span>
        <span className="card-title">PDF Source</span>
        {file && !busy && (
          <button onClick={reset} style={{ marginLeft: "auto", background: "none", color: "var(--ink3)", fontSize: 16 }}>×</button>
        )}
      </div>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          className={`drop-zone${isDone ? " has-file" : ""}${phase === "error" ? " error-zone" : ""}${over ? " over" : ""}`}
          onClick={() => !busy && inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={e => { e.preventDefault(); setOver(false); pickFile(e.dataTransfer.files[0]); }}
        >
          <input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }}
            onChange={e => pickFile(e.target.files[0])} />
          {isDone ? (
            <>
              <span style={{ fontSize: 24 }}>✓</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>{result?.fileName || file?.name}</span>
              <span className="muted">{result?.chunkSize} chunks · {result?.docSize} pages</span>
            </>
          ) : file ? (
            <>
              <span style={{ fontSize: 22 }}>📑</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{file.name}</span>
              <span className="muted">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 22, opacity: 0.4 }}>▲</span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>Drop PDF or click to browse</span>
              <span className="muted">PDF documents only</span>
            </>
          )}
        </div>

        <button className="btn btn-accent" disabled={!file || busy || isDone} onClick={ingest}>
          {busy ? <><Spin /> Ingesting…</> : isDone ? <>✓ Indexed</> : <>Ingest PDF</>}
        </button>

        {isDone && (
          <div className="status-row">
            <span className="status-dot dot-green" />
            <span style={{ color: "var(--green)", fontSize: 12, fontWeight: 500 }}>
              {result?.chunkSize} chunks stored
            </span>
          </div>
        )}
        {phase === "error" && <ErrorBox msg={error?.msg} code={error?.code} />}
      </div>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────
function ChatPanel({ fileName }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    const q = input.trim();
    if (!q || !fileName || loading) return;
    setInput("");
    setMsgs(m => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, fileName }),
      });
      if (!res.ok) {
        const e = await parseError(res);
        setMsgs(m => [...m, { role: "error", text: `${e.msg}${e.code ? ` (${e.code})` : ""}` }]);
        return;
      }
      const body = await res.json();
      // ApiResponse { data: ChatResponseDto { answer } }
      const data = body?.data || body;
      const answer = data?.answer || data?.response || JSON.stringify(data);
      setMsgs(m => [...m, { role: "ai", text: answer }]);
    } catch (err) {
      setMsgs(m => [...m, { role: "error", text: "Network error: " + err.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="chat-scroll">
        {msgs.length === 0 ? (
          <div className="chat-empty">
            <div className="icon">💬</div>
            <p>{fileName ? `Ask anything about "${fileName}"` : "Upload a document or video first, then ask questions."}</p>
          </div>
        ) : (
          msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div className={m.role === "user" ? "bubble bubble-user" : m.role === "error" ? "bubble bubble-error" : "bubble bubble-ai"}>
                {m.text}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div style={{ display: "flex" }}>
            <div className="bubble bubble-ai" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink3)" }}>
              <Spin /> Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder={fileName ? `Ask about ${fileName}…` : "No document selected…"}
          value={input}
          disabled={!fileName || loading}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
        />
        <button className="send-btn" onClick={send} disabled={!input.trim() || !fileName || loading}>
          {loading ? <Spin /> : "↑"}
        </button>
      </div>
    </div>
  );
}

// ─── Quiz Panel ───────────────────────────────────────────────────────────────
// QuestionEntity: { id, question, optionA, optionB, optionC, optionD, correctAnswer (A|B|C|D), explanation }
// QuizResponseDto: { id, createdAt, questionList: QuestionEntity[] }

function normaliseQuestion(q) {
  // Backend sends optionA/B/C/D — build an options array with labels
  return {
    id: q.id,
    question: q.question,
    options: [
      { key: "A", text: q.optionA },
      { key: "B", text: q.optionB },
      { key: "C", text: q.optionC },
      { key: "D", text: q.optionD },
    ].filter(o => o.text),
    correctAnswer: q.correctAnswer, // "A" | "B" | "C" | "D"
    explanation: q.explanation,
  };
}

function QuizPanel({ fileName }) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Quiz state
  const [quizMeta, setQuizMeta] = useState(null);    // { id, createdAt }
  const [questions, setQuestions] = useState([]);     // normalised
  const [answers, setAnswers] = useState({});         // qIdx -> "A"|"B"|"C"|"D"
  const [submitted, setSubmitted] = useState(false);

  // Quiz history (persisted in component state for the session)
  const [history, setHistory] = useState([]);
  const [viewingHistory, setViewingHistory] = useState(null); // index

  async function generate() {
    if (!fileName || loading) return;
    setLoading(true); setError(null);
    setQuizMeta(null); setQuestions([]); setAnswers({}); setSubmitted(false); setViewingHistory(null);
    try {
      const res = await fetch(`${API}/quiz/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() || "general", fileName, numberOfQuestions: count }),
      });
      if (!res.ok) { const e = await parseError(res); setError(e); return; }
      const body = await res.json();
      // ApiResponse { data: QuizResponseDto { id, createdAt, questionList } }
      const data = body?.data || body;
      const qs = (data.questionList || []).map(normaliseQuestion);
      setQuizMeta({ id: data.id, createdAt: data.createdAt });
      setQuestions(qs);
    } catch (err) {
      setError({ msg: err.message, code: null });
    } finally {
      setLoading(false);
    }
  }

  function select(qIdx, key) {
    if (submitted) return;
    setAnswers(a => ({ ...a, [qIdx]: key }));
  }

  function submit() {
    if (Object.keys(answers).length === 0) return;
    setSubmitted(true);
    // Save to history
    const score = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
    setHistory(h => [...h, {
      quizId: quizMeta?.id,
      topic: topic || "general",
      fileName,
      createdAt: quizMeta?.createdAt,
      questions,
      answers: { ...answers },
      score,
      total: questions.length,
    }]);
  }

  function newQuiz() {
    setQuizMeta(null); setQuestions([]); setAnswers({}); setSubmitted(false); setError(null);
  }

  // Determine what to render
  const active = viewingHistory !== null ? history[viewingHistory] : null;
  const displayQuestions = active ? active.questions : questions;
  const displayAnswers = active ? active.answers : answers;
  const displaySubmitted = active ? true : submitted;

  const score = displaySubmitted
    ? displayQuestions.filter((q, i) => displayAnswers[i] === q.correctAnswer).length
    : 0;
  const pct = displayQuestions.length > 0 ? Math.round((score / displayQuestions.length) * 100) : 0;
  const scoreColor = pct >= 70 ? "var(--green)" : pct >= 40 ? "var(--amber)" : "var(--red)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Controls bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        <div className="quiz-controls">
          <div style={{ flex: 1 }}>
            <div className="lbl">Topic</div>
            <input className="quiz-input" placeholder="e.g. neural networks, recursion…"
              value={topic} onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generate()} />
          </div>
          <div>
            <div className="lbl">Questions</div>
            <input className="quiz-input num-input" type="number" min={1} max={20}
              value={count} onChange={e => setCount(Math.max(1, Math.min(20, Number(e.target.value))))} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-accent" style={{ flex: 1 }} disabled={!fileName || loading} onClick={generate}>
            {loading ? <><Spin /> Generating…</> : <>⚡ Generate Quiz</>}
          </button>
          {questions.length > 0 && (
            <button className="btn btn-ghost" style={{ width: "auto", padding: "8px 14px" }} onClick={newQuiz}>
              ↺
            </button>
          )}
        </div>
        {error && <ErrorBox msg={error.msg} code={error.code} />}
      </div>

      {/* History strip */}
      {history.length > 0 && viewingHistory === null && (
        <div style={{ marginBottom: 16 }}>
          <div className="lbl" style={{ marginBottom: 8 }}>Quiz History</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {history.map((h, i) => {
              const p = Math.round((h.score / h.total) * 100);
              return (
                <button key={i} onClick={() => setViewingHistory(i)}
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--radius)",
                    padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", transition: "all var(--transition)", textAlign: "left",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border2)"}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{h.topic}</div>
                    <div style={{ fontSize: 11, color: "var(--ink3)", fontFamily: "var(--mono)" }}>ID {h.quizId} · {h.total}Q</div>
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 18, color: p >= 70 ? "var(--green)" : p >= 40 ? "var(--amber)" : "var(--red)" }}>
                    {p}%
                  </div>
                </button>
              );
            })}
          </div>
          <div className="divider" />
        </div>
      )}

      {/* Viewing history header */}
      {viewingHistory !== null && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button className="btn btn-ghost" style={{ width: "auto", padding: "6px 12px", fontSize: 12 }}
            onClick={() => setViewingHistory(null)}>
            ← Back
          </button>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Quiz #{history[viewingHistory].quizId}</span>
            <span className="muted" style={{ marginLeft: 8 }}>{history[viewingHistory].topic}</span>
          </div>
        </div>
      )}

      {/* Score banner */}
      {displaySubmitted && displayQuestions.length > 0 && (
        <div className="score-banner" style={{ marginBottom: 16 }}>
          <div className="score-left">
            <div className="score-label">Your Score</div>
            <div className="score-num" style={{ color: scoreColor }}>{score} / {displayQuestions.length}</div>
          </div>
          <div className="score-pct" style={{ color: scoreColor }}>{pct}%</div>
        </div>
      )}

      {/* Empty state */}
      {displayQuestions.length === 0 && !loading && (
        <div className="empty-state">
          <div className="ei">⚡</div>
          <p>{fileName ? "Enter a topic and click Generate Quiz to begin." : "Upload a document or video first."}</p>
        </div>
      )}

      {/* Questions */}
      {displayQuestions.map((q, qi) => {
        const chosen = displayAnswers[qi]; // "A"|"B"|"C"|"D" or undefined
        const isCorrect = (key) => key === q.correctAnswer;
        const isChosen = (key) => key === chosen;
        return (
          <div className="q-card" key={qi}>
            <div className="q-header">
              <span className="q-num">{qi + 1}</span>
              <span className="q-text">{q.question}</span>
            </div>
            <div className="options">
              {q.options.map(({ key, text }) => {
                let cls = "opt";
                if (displaySubmitted) {
                  if (isCorrect(key)) cls += " correct";
                  else if (isChosen(key) && !isCorrect(key)) cls += " wrong";
                  else cls += " dimmed";
                } else if (isChosen(key)) {
                  cls += " selected";
                }
                return (
                  <button key={key} className={cls}
                    disabled={displaySubmitted}
                    onClick={() => select(qi, key)}>
                    <span className="opt-key">{key}</span>
                    <span>{text}</span>
                    {displaySubmitted && isCorrect(key) && (
                      <span style={{ marginLeft: "auto", fontSize: 13 }}>✓</span>
                    )}
                    {displaySubmitted && isChosen(key) && !isCorrect(key) && (
                      <span style={{ marginLeft: "auto", fontSize: 13 }}>✗</span>
                    )}
                  </button>
                );
              })}
            </div>
            {displaySubmitted && q.explanation && (
              <div className="expl-box">
                <strong>Explanation: </strong>{q.explanation}
              </div>
            )}
            {/* Show "not answered" notice */}
            {displaySubmitted && !chosen && !active && (
              <div style={{ marginTop: 8, fontSize: 11, color: "var(--ink3)", fontStyle: "italic" }}>
                Not answered — correct answer was {q.correctAnswer}
              </div>
            )}
          </div>
        );
      })}

      {/* Submit button */}
      {displayQuestions.length > 0 && !displaySubmitted && (
        <button className="btn btn-success" style={{ marginTop: 4 }} onClick={submit}
          disabled={Object.keys(answers).length === 0}>
          Submit Answers ({Object.keys(answers).length}/{displayQuestions.length} answered)
        </button>
      )}

      {/* Retry button after submit */}
      {displaySubmitted && viewingHistory === null && (
        <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={newQuiz}>
          Generate another quiz
        </button>
      )}
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("chat");
  const [sourceTab, setSourceTab] = useState("video"); // video|pdf
  const [fileName, setFileName] = useState(null);
  const [videoFileName, setVideoFileName] = useState(null);
  const [pdfFileName, setPdfFileName] = useState(null);

  // whichever source was last readied wins
  function handleVideoReady(name) {
    setVideoFileName(name);
    if (name) setFileName(name);
    else if (pdfFileName) setFileName(pdfFileName);
    else setFileName(null);
  }
  function handlePdfReady(name) {
    setPdfFileName(name);
    if (name) setFileName(name);
    else if (videoFileName) setFileName(videoFileName);
    else setFileName(null);
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app-shell">
        {/* Topbar */}
        <header className="topbar">
          <div className="logo">
            <div className="logo-mark">🎓</div>
            <span className="logo-text">Learnify</span>
            <span className="badge">AI TUTOR</span>
          </div>
          {fileName && (
            <div className="active-file">
              <span className="status-dot dot-green" />
              <span className="active-file-name">{fileName}</span>
            </div>
          )}
        </header>

        {/* Body */}
        <div className="body-grid">
          {/* Sidebar */}
          <aside className="sidebar">
            {/* Source selector */}
            <div className="tabs" style={{ marginBottom: 0 }}>
              {["video", "pdf"].map(t => (
                <button key={t} className={`tab${sourceTab === t ? " active" : ""}`}
                  onClick={() => setSourceTab(t)}>
                  {t === "video" ? "▶ Video" : "📄 PDF"}
                </button>
              ))}
            </div>

            {sourceTab === "video" && <VideoUpload onReady={handleVideoReady} />}
            {sourceTab === "pdf" && <PdfUpload onReady={handlePdfReady} />}

            {/* Active file summary */}
            {fileName && (
              <div style={{ padding: "10px 12px", borderRadius: "var(--radius)", background: "var(--surface)", border: "1px solid var(--border2)" }}>
                <div className="lbl" style={{ marginBottom: 6 }}>Active Document</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent-hi)", wordBreak: "break-all" }}>{fileName}</div>
                {videoFileName && videoFileName === fileName && (
                  <div className="muted" style={{ marginTop: 4 }}>Source: video transcript</div>
                )}
                {pdfFileName && pdfFileName === fileName && (
                  <div className="muted" style={{ marginTop: 4 }}>Source: PDF document</div>
                )}
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="main">
            <div className="tabs">
              {["chat", "quiz"].map(t => (
                <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                  {t === "chat" ? "💬 Chat" : "⚡ Quiz"}
                </button>
              ))}
            </div>

            {tab === "chat" && <ChatPanel fileName={fileName} />}
            {tab === "quiz" && <QuizPanel fileName={fileName} />}
          </main>
        </div>
      </div>
    </>
  );
}