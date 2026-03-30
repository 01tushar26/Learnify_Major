import { useState, useRef, useEffect, useCallback } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body { font-family: 'Geist', system-ui, sans-serif; }

  .app { min-height: 100vh; display: flex; flex-direction: column; transition: background 0.2s, color 0.2s; }
  .dark  { background: #07070f; color: #e2e2f0; }
  .light { background: #f2f2f8; color: #111118; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  .dark  ::-webkit-scrollbar-thumb { background: #22223a; border-radius: 99px; }
  .light ::-webkit-scrollbar-thumb { background: #d4d4e8; border-radius: 99px; }

  /* ── Card ── */
  .card { border-radius: 18px; border: 1px solid; transition: border-color 0.2s, background 0.2s; }
  .dark  .card { background: #0d0d1a; border-color: #1a1a2e; }
  .light .card { background: #fff;    border-color: #e2e2ef; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }

  /* ── Input ── */
  .input {
    width: 100%; border-radius: 10px; border: 1px solid; padding: 11px 15px;
    font-family: 'Geist Mono', monospace; font-size: 13px; outline: none;
    transition: border-color 0.15s, background 0.15s;
  }
  .dark  .input { background: #080810; border-color: #1c1c2c; color: #e2e2f0; }
  .dark  .input::placeholder { color: #30304a; }
  .dark  .input:focus { border-color: #4f46e5; }
  .light .input { background: #f7f7fc; border-color: #dedeed; color: #111118; }
  .light .input::placeholder { color: #aaaabb; }
  .light .input:focus { border-color: #6366f1; }

  /* ── Buttons ── */
  .btn-primary {
    width: 100%; padding: 12px 20px; border-radius: 10px;
    font-family: 'Geist', sans-serif; font-size: 13.5px; font-weight: 600;
    cursor: pointer; border: none; background: #4f46e5; color: #fff;
    transition: opacity 0.15s, transform 0.1s; letter-spacing: -0.1px;
  }
  .btn-primary:hover:not(:disabled) { opacity: 0.88; }
  .btn-primary:active:not(:disabled) { transform: scale(0.99); }
  .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }

  .btn-success {
    width: 100%; padding: 12px 20px; border-radius: 10px;
    font-family: 'Geist', sans-serif; font-size: 13.5px; font-weight: 600;
    cursor: pointer; border: none; background: #059669; color: #fff;
    transition: opacity 0.15s;
  }
  .btn-success:hover { opacity: 0.9; }

  /* ── Tabs ── */
  .tab-btn {
    flex: 1; padding: 9px; border: none; cursor: pointer;
    font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 500;
    border-radius: 8px; transition: background 0.15s, color 0.15s; background: transparent;
  }
  .dark  .tab-btn       { color: #3e3e5a; }
  .dark  .tab-btn.active { background: #16163a; color: #a5b4fc; }
  .dark  .tab-btn:hover:not(.active) { color: #6666a0; }
  .light .tab-btn       { color: #9999bb; }
  .light .tab-btn.active { background: #eef0ff; color: #4338ca; }
  .light .tab-btn:hover:not(.active) { color: #6666aa; }

  /* ── Labels & misc ── */
  .lbl { font-size: 11px; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; margin-bottom: 7px; }
  .dark  .lbl { color: #30304a; }
  .light .lbl { color: #aaaacc; }

  .muted { font-size: 12px; }
  .dark  .muted { color: #3a3a56; }
  .light .muted { color: #aaaacc; }

  /* ── Drop zone ── */
  .drop-zone {
    border-radius: 14px; border: 1.5px dashed; padding: 40px 24px;
    text-align: center; cursor: pointer; transition: all 0.15s;
  }
  .dark  .drop-zone { border-color: #1e1e36; }
  .dark  .drop-zone:hover, .dark  .drop-zone.has-file { border-color: #4f46e5; background: #0b0b20; }
  .light .drop-zone { border-color: #cccce0; }
  .light .drop-zone:hover, .light .drop-zone.has-file { border-color: #818cf8; background: #f4f4ff; }

  /* ── Bubbles ── */
  .bubble-user {
    max-width: 78%; padding: 11px 15px; border-radius: 16px 16px 4px 16px;
    font-size: 13.5px; line-height: 1.65; background: #4f46e5; color: #fff;
  }
  .bubble-ai {
    max-width: 84%; padding: 11px 15px; border-radius: 16px 16px 16px 4px;
    font-size: 13.5px; line-height: 1.65;
  }
  .dark  .bubble-ai { background: #0f0f1e; border: 1px solid #1c1c2e; color: #c8c8ee; }
  .light .bubble-ai { background: #eeeeff; border: 1px solid #ddddf5; color: #333348; }

  /* ── Quiz options ── */
  .opt-btn {
    width: 100%; text-align: left; padding: 11px 14px; border-radius: 10px;
    cursor: pointer; font-family: 'Geist', sans-serif; font-size: 13px; border: 1px solid;
    transition: all 0.15s;
  }
  .dark  .opt-btn           { background: #090914; border-color: #1a1a2c; color: #7777a0; }
  .dark  .opt-btn:hover:not(:disabled) { border-color: #4f46e5; color: #b0b0f0; }
  .dark  .opt-btn.sel       { background: #12123c; border-color: #4f46e5; color: #a5b4fc; }
  .dark  .opt-btn.ok        { background: #041a10; border-color: #059669; color: #6ee7b7; }
  .dark  .opt-btn.bad       { background: #1e0808; border-color: #dc2626; color: #fca5a5; }
  .light .opt-btn           { background: #f8f8fc; border-color: #e0e0ef; color: #7777aa; }
  .light .opt-btn:hover:not(:disabled) { border-color: #818cf8; color: #4338ca; }
  .light .opt-btn.sel       { background: #eef0ff; border-color: #6366f1; color: #4338ca; }
  .light .opt-btn.ok        { background: #ecfdf5; border-color: #059669; color: #065f46; }
  .light .opt-btn.bad       { background: #fef2f2; border-color: #dc2626; color: #991b1b; }

  /* ── Stats ── */
  .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .stat-box  { border-radius: 12px; padding: 16px; text-align: center; }
  .dark  .stat-box { background: #090914; border: 1px solid #181828; }
  .light .stat-box { background: #f4f4fc; border: 1px solid #e4e4f5; }
  .stat-n { font-size: 24px; font-weight: 600; font-family: 'Geist Mono', monospace; }
  .dark  .stat-n { color: #a5b4fc; }
  .light .stat-n { color: #4338ca; }

  /* ── Pill ── */
  .pill {
    display: inline-flex; align-items: center; padding: 3px 10px;
    border-radius: 99px; font-size: 11px; font-weight: 500; font-family: 'Geist Mono', monospace;
  }
  .dark  .pill { background: #131330; color: #6666cc; border: 1px solid #1e1e38; }
  .light .pill { background: #eef0ff; color: #4338ca; border: 1px solid #c7d2fe; }

  /* ── Divider ── */
  .hr { border: none; border-top: 1px solid; }
  .dark  .hr { border-color: #121222; }
  .light .hr { border-color: #ebebf5; }

  /* ── Q badge ── */
  .q-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 6px; font-size: 11px; font-weight: 600; flex-shrink: 0;
  }
  .dark  .q-badge { background: #141430; color: #7777cc; }
  .light .q-badge { background: #eef0ff; color: #4338ca; }

  /* ── Explanation ── */
  .expl {
    border-radius: 8px; padding: 11px 14px; font-size: 12.5px;
    line-height: 1.65; font-family: 'Geist Mono', monospace;
  }
  .dark  .expl { background: #07070f; border: 1px solid #121222; color: #44446a; }
  .light .expl { background: #f8f8ff; border: 1px solid #ddddf5; color: #8888aa; }

  /* ── Score card ── */
  .score-card {
    border-radius: 14px; padding: 18px 22px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .dark  .score-card { background: #041a0e; border: 1px solid #0d3320; }
  .light .score-card { background: #ecfdf5; border: 1px solid #a7f3d0; }

  /* ── Spinner ── */
  .spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid transparent; border-top-color: currentColor;
    animation: sp 0.7s linear infinite; display: inline-block;
  }
  @keyframes sp { to { transform: rotate(360deg); } }

  /* ── Toast ── */
  .toast-in { animation: tin 0.2s ease forwards; }
  @keyframes tin { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: none; } }

  /* ── RESPONSIVE LAYOUT ── */
  .page-wrapper {
    flex: 1;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px 80px;
  }

  .two-col {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 28px;
    align-items: start;
  }

  .sidebar {
    position: sticky;
    top: 32px;
  }

  .main-content {
    min-width: 0;
  }

  @media (max-width: 820px) {
    .page-wrapper { padding: 0 20px 60px; }
    .two-col { grid-template-columns: 1fr; }
    .sidebar { position: static; }
  }

  /* ── Send button ── */
  .send-btn {
    padding: 11px 20px; border-radius: 10px; border: none; cursor: pointer;
    background: #4f46e5; color: #fff; font-size: 13px; font-weight: 600;
    opacity: 1; transition: opacity 0.15s; white-space: nowrap; flex-shrink: 0;
  }
  .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .send-btn:hover:not(:disabled) { opacity: 0.88; }

  /* ── Chat area ── */
  .chat-area {
    border-radius: 14px; border: 1px solid;
    padding: 18px; overflow-y: auto;
    display: flex; flex-direction: column; gap: 14px;
  }
  .dark  .chat-area { background: #060610; border-color: #121222; }
  .light .chat-area { background: #f5f5fc; border-color: #e4e4f5; }

  /* ── Welcome banner ── */
  .welcome-banner {
    border-radius: 14px; padding: 22px 24px;
    display: flex; align-items: center; gap: 16px;
  }
  .dark  .welcome-banner { background: #0a0a1c; border: 1px solid #181830; }
  .light .welcome-banner { background: #f0f0ff; border: 1px solid #ddddf8; }
`;

// ── Backend base URL ──────────────────────────────────────────────────────────
const API = "http://localhost:8080";

// ── Toast ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "info", title = "") => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type, title }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 5000);
  }, []);
  const remove = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, addToast: add, removeToast: remove };
}

function Toasts({ toasts, remove }) {
  const S = {
    error:   { bg: "#160808", bd: "#2e1010", tx: "#fca5a5", ic: "✕" },
    success: { bg: "#051408", bd: "#0a2e18", tx: "#6ee7b7", ic: "✓" },
    info:    { bg: "#08091e", bd: "#14183a", tx: "#a5b4fc", ic: "·" },
  };
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, maxWidth: 320, pointerEvents: "none" }}>
      {toasts.map(t => {
        const s = S[t.type] || S.info;
        return (
          <div key={t.id} className="toast-in" style={{
            pointerEvents: "auto", display: "flex", gap: 10, alignItems: "flex-start",
            background: s.bg, border: `1px solid ${s.bd}`, borderRadius: 12,
            padding: "12px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}>
            <span style={{ color: s.tx, fontSize: 12, marginTop: 1, flexShrink: 0, fontFamily: "monospace" }}>{s.ic}</span>
            <div style={{ flex: 1 }}>
              {t.title && <div style={{ fontSize: 12, fontWeight: 600, color: s.tx, marginBottom: 2 }}>{t.title}</div>}
              <div style={{ fontSize: 12.5, color: "#55556a", lineHeight: 1.5 }}>{t.message}</div>
            </div>
            <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", color: "#33334a", cursor: "pointer", fontSize: 12, padding: 0 }}>✕</button>
          </div>
        );
      })}
    </div>
  );
}

// ── API helper ────────────────────────────────────────────────────────────────
async function call(path, opts, addToast) {
  try {
    const res  = await fetch(`${API}${path}`, opts);
    const json = await res.json();
    if (!res.ok || json?.error) {
      const msg = json?.error?.message || json?.message || `HTTP ${res.status}`;
      addToast(msg, "error", `Error · ${res.status}`);
      return null;
    }
    return json?.data !== undefined ? json.data : json;
  } catch (e) {
    addToast(e.message || "Network error", "error", "Request failed");
    return null;
  }
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ dark, tab, setTab, activeFile, onIngest }) {
  const TABS = [
    { id: "ingest", icon: "↑", label: "Ingest", desc: "Upload PDF" },
    { id: "chat",   icon: "💬", label: "Chat",   desc: "Ask your doc" },
    { id: "quiz",   icon: "✦",  label: "Quiz",   desc: "Test yourself" },
  ];
  return (
    <div className="sidebar" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, background: "#4f46e5",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 700, color: "#fff",
        }}>L</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px" }}>Learnify</div>
          <div className="muted" style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10 }}>RAG-powered</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
            borderRadius: 11, border: "1px solid", cursor: "pointer", textAlign: "left",
            transition: "all 0.15s",
            background: tab === t.id ? (dark ? "#14143a" : "#eef0ff") : "transparent",
            borderColor: tab === t.id ? (dark ? "#4f46e5" : "#818cf8") : (dark ? "#141424" : "#e8e8f5"),
          }}>
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{t.icon}</span>
            <div>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: tab === t.id ? (dark ? "#a5b4fc" : "#4338ca") : (dark ? "#55556a" : "#888899"),
              }}>{t.label}</div>
              <div style={{ fontSize: 11, color: dark ? "#2e2e48" : "#aaaacc", fontFamily: "'Geist Mono', monospace" }}>{t.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Active file badge */}
      {activeFile && (
        <div style={{
          borderRadius: 10, padding: "12px 14px", marginTop: 4,
          background: dark ? "#090914" : "#f4f4fc",
          border: `1px solid ${dark ? "#151528" : "#e0e0f0"}`,
        }}>
          <div className="lbl" style={{ marginBottom: 5 }}>Active file</div>
          <div style={{
            fontFamily: "'Geist Mono', monospace", fontSize: 12,
            color: dark ? "#6060a0" : "#6666aa",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{activeFile}</div>
        </div>
      )}
    </div>
  );
}

// ── Ingest Panel ──────────────────────────────────────────────────────────────
function IngestPanel({ dark, addToast, onSuccess }) {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const ref = useRef();

  const go = async () => {
    if (!file) return addToast("Select a PDF first", "error");
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    const data = await call("/rag/ingest", { method: "POST", body: form }, addToast);
    setLoading(false);
    if (data) {
      setResult(data);
      onSuccess(data.fileName);
      addToast("Document ingested successfully", "success", "Done");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div className="welcome-banner">
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: "#4f46e5",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
        }}>📄</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Upload your PDF</div>
          <div className="muted" style={{ fontSize: 12.5 }}>We'll chunk and embed it so you can chat and quiz yourself.</div>
        </div>
      </div>

      <div>
        <div className="lbl">Document</div>
        <div className={`drop-zone${file ? " has-file" : ""}`} onClick={() => ref.current.click()}>
          <input ref={ref} type="file" accept=".pdf" style={{ display: "none" }}
            onChange={e => { setFile(e.target.files[0]); setResult(null); }} />
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>↑</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            {file ? file.name : "Click to upload a PDF"}
          </div>
          <div className="muted" style={{ fontFamily: "'Geist Mono', monospace" }}>
            {file ? `${(file.size / 1024).toFixed(0)} KB` : "PDF · max 10 MB"}
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={go} disabled={loading || !file}>
        {loading
          ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span className="spinner" />Processing…</span>
          : "Ingest document →"}
      </button>

      {result && (
        <>
          <hr className="hr" />
          <div className="stat-grid">
            {[["Pages", result.docSize], ["Chunks", result.chunkSize], ["Status", "✓"]].map(([l, v]) => (
              <div className="stat-box" key={l}>
                <div className="stat-n" style={l === "Status" ? { color: "#059669", fontSize: 20 } : {}}>{v}</div>
                <div className="muted" style={{ fontFamily: "'Geist Mono', monospace", marginTop: 5 }}>{l.toLowerCase()}</div>
              </div>
            ))}
          </div>
          <div className="muted" style={{ fontFamily: "'Geist Mono', monospace", textAlign: "center", fontSize: 11 }}>
            {result.fileName}
          </div>
        </>
      )}
    </div>
  );
}

// ── Chat Panel ────────────────────────────────────────────────────────────────
function ChatPanel({ dark, addToast, activeFile }) {
  const [fileName, setFileName] = useState(activeFile || "");
  const [q, setQ]               = useState("");
  const [msgs, setMsgs]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const btm = useRef();

  useEffect(() => { if (activeFile) setFileName(activeFile); }, [activeFile]);
  useEffect(() => { btm.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const send = async () => {
    const question = q.trim();
    if (!question) return;
    if (!fileName.trim()) return addToast("Enter a file name", "error");
    setMsgs(m => [...m, { role: "user", text: question }]);
    setQ("");
    setLoading(true);
    const data = await call("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, fileName: fileName.trim() }),
    }, addToast);
    setLoading(false);
    if (data) setMsgs(m => [...m, { role: "ai", text: data.answer }]);
  };

  const AIIcon = () => (
    <div style={{
      width: 26, height: 26, borderRadius: 7, flexShrink: 0, marginRight: 9, marginTop: 2,
      background: dark ? "#141430" : "#eef0ff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, fontWeight: 700, color: dark ? "#a5b4fc" : "#4338ca",
    }}>L</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div className="lbl">File name</div>
        <input className="input" placeholder="notes.pdf" value={fileName} onChange={e => setFileName(e.target.value)} />
      </div>

      <div className="chat-area" style={{ minHeight: 320, maxHeight: "calc(100vh - 380px)" }}>
        {msgs.length === 0 && (
          <div className="muted" style={{ textAlign: "center", margin: "auto", fontFamily: "'Geist Mono', monospace", lineHeight: 1.8 }}>
            Ask anything about your document ↓
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start" }}>
            {m.role === "ai" && <AIIcon />}
            <div className={m.role === "user" ? "bubble-user" : "bubble-ai"}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <AIIcon />
            <div className="bubble-ai" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5, color: dark ? "#44446a" : "#aaaacc" }} />
              <span className="muted">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={btm} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="input" style={{ flex: 1 }} placeholder="Ask a question…"
          value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
        />
        <button className="send-btn" onClick={send} disabled={loading || !q.trim()}>Send ↵</button>
      </div>
    </div>
  );
}

// ── Quiz Panel ────────────────────────────────────────────────────────────────
function QuizPanel({ dark, addToast, activeFile }) {
  const [fileName, setFileName] = useState(activeFile || "");
  const [topic, setTopic]       = useState("");
  const [numQ, setNumQ]         = useState(5);
  const [loading, setLoading]   = useState(false);
  const [quiz, setQuiz]         = useState(null);
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore]       = useState(null);

  useEffect(() => { if (activeFile) setFileName(activeFile); }, [activeFile]);

  const generate = async () => {
    if (!topic.trim())    return addToast("Enter a topic", "error");
    if (!fileName.trim()) return addToast("Enter a file name", "error");
    setLoading(true); setQuiz(null); setSelected({}); setSubmitted(false); setScore(null);
    const data = await call("/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, fileName: fileName.trim(), numberOfQuestions: numQ }),
    }, addToast);
    setLoading(false);
    if (data) {
      setQuiz(data);
      addToast(`${data.questionList?.length} questions generated`, "success");
    }
  };

  const submit = () => {
    const qs = quiz?.questionList || [];
    const c  = qs.filter(q => selected[q.id] === q.correctAnswer).length;
    setScore(c); setSubmitted(true);
    addToast(`${c} / ${qs.length} correct`, c === qs.length ? "success" : "info", "Submitted");
  };

  const OPTS = ["A", "B", "C", "D"];
  const KEY  = { A: "optionA", B: "optionB", C: "optionC", D: "optionD" };
  const pct  = quiz ? Math.round(((score || 0) / (quiz.questionList?.length || 1)) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Config row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px", gap: 10, alignItems: "end" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <div className="lbl">File name</div>
          <input className="input" placeholder="notes.pdf" value={fileName} onChange={e => setFileName(e.target.value)} />
        </div>
        <div>
          <div className="lbl">Topic</div>
          <input className="input" placeholder="React Hooks" value={topic}
            onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()} />
        </div>
        <div>
          <div className="lbl">Questions</div>
          <input className="input" type="number" min={1} max={20} value={numQ}
            onChange={e => setNumQ(Number(e.target.value))} />
        </div>
        <button className="btn-primary" onClick={generate} disabled={loading} style={{ alignSelf: "end" }}>
          {loading
            ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span className="spinner" />Generating…</span>
            : "Generate →"}
        </button>
      </div>

      {/* Score */}
      {submitted && score !== null && (
        <div className="score-card">
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#059669", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 4 }}>Score</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: "#6ee7b7" }}>
              {score} <span style={{ fontSize: 15, color: "#2d6e50" }}>/ {quiz.questionList.length}</span>
            </div>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, fontFamily: "'Geist Mono', monospace", color: pct >= 70 ? "#34d399" : "#f59e0b" }}>
            {pct}%
          </div>
        </div>
      )}

      {/* Questions */}
      {quiz && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxHeight: "calc(100vh - 420px)", overflowY: "auto", paddingRight: 4 }}>
          {(quiz.questionList || []).map((q, qi) => {
            const ans = selected[q.id];
            return (
              <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span className="q-badge">{qi + 1}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.65, flex: 1 }}>{q.question}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 32 }}>
                  {OPTS.map(lt => {
                    let cls = "opt-btn";
                    if (submitted) {
                      if (lt === q.correctAnswer) cls += " ok";
                      else if (ans === lt)        cls += " bad";
                    } else if (ans === lt) cls += " sel";
                    return (
                      <button key={lt} className={cls} disabled={submitted}
                        onClick={() => setSelected(s => ({ ...s, [q.id]: lt }))}>
                        <span style={{ fontWeight: 600, marginRight: 8, fontFamily: "'Geist Mono', monospace" }}>{lt}.</span>
                        {q[KEY[lt]]}
                      </button>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <div className="expl" style={{ marginLeft: 32 }}>{q.explanation}</div>
                )}
                {qi < quiz.questionList.length - 1 && <hr className="hr" style={{ marginTop: 4 }} />}
              </div>
            );
          })}
          {!submitted && quiz.questionList?.length > 0 && (
            <button className="btn-success" onClick={submit}>Submit answers ✓</button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page titles ───────────────────────────────────────────────────────────────
const TITLES = {
  ingest: { title: "Upload document",    sub: "Ingest a PDF to start chatting or generating quizzes." },
  chat:   { title: "Ask your document",  sub: "Answers are grounded in your document via RAG." },
  quiz:   { title: "Quiz yourself",      sub: "Generate MCQ questions from your document on any topic." },
};

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark]           = useState(true);
  const [tab, setTab]             = useState("ingest");
  const [activeFile, setActiveFile] = useState("");
  const { toasts, addToast, removeToast } = useToast();

  return (
    <>
      <style>{CSS}</style>
      <div className={`app ${dark ? "dark" : "light"}`}>
        <Toasts toasts={toasts} remove={removeToast} />

        <div className="page-wrapper">

          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "24px 0 28px" }}>
            <button onClick={() => setDark(d => !d)} style={{
              width: 34, height: 34, borderRadius: 8,
              border: `1px solid ${dark ? "#1c1c2e" : "#ddddf0"}`,
              background: "transparent", cursor: "pointer", fontSize: 15,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: dark ? "#44446a" : "#9999bb", transition: "border-color 0.15s",
            }}>
              {dark ? "○" : "●"}
            </button>
          </div>

          {/* Two-column layout */}
          <div className="two-col">

            {/* Left: Sidebar */}
            <Sidebar dark={dark} tab={tab} setTab={setTab} activeFile={activeFile} />

            {/* Right: Main content */}
            <div className="main-content">
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 6 }}>
                  {TITLES[tab].title}
                </h1>
                <p className="muted" style={{ fontSize: 13.5 }}>{TITLES[tab].sub}</p>
              </div>

              <div className="card" style={{ padding: 28 }}>
                {tab === "ingest" && (
                  <IngestPanel dark={dark} addToast={addToast}
                    onSuccess={f => { setActiveFile(f); setTimeout(() => setTab("chat"), 400); }} />
                )}
                {tab === "chat" && (
                  <ChatPanel dark={dark} addToast={addToast} activeFile={activeFile} />
                )}
                {tab === "quiz" && (
                  <QuizPanel dark={dark} addToast={addToast} activeFile={activeFile} />
                )}
              </div>

              <div className="muted" style={{ textAlign: "right", marginTop: 20, fontFamily: "'Geist Mono', monospace", fontSize: 11 }}>
                Learnify · RAG-powered learning · backend :8080
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}