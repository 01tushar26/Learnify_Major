import "./App.css";
import { useState, useRef, useEffect, useCallback } from "react";



  

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

              
            </div>
          </div>
        </div>
        <div className="muted flex justify-center items-center" style={{  fontFamily: "'Geist Mono', monospace", fontSize: 11 }}>
                Learnify · RAG-powered learning 
              </div>
      </div>
    </>
  );
}