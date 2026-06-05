import { useState, useRef, useEffect } from 'react';
import './App.css';

const API = 'http://localhost:8080';

// ── Helpers ──────────────────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(true);
  return { dark, toggle: () => setDark(d => !d) };
}

function Spinner() {
  return <span className="spinner" />;
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="toast-in" style={{
      position: 'fixed', bottom: 28, right: 24, zIndex: 99,
      padding: '10px 16px', borderRadius: 10, fontSize: 13,
      background: '#4f46e5', color: '#fff', boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
    }}>
      {msg}
    </div>
  );
}

// ── Video Upload Panel ────────────────────────────────────────────────────────
function VideoUpload({ onReady, dark }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | polling | done | error
  const [jobId, setJobId] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();
  const pollRef = useRef();

  // Accepted video types
  const ACCEPT = 'video/mp4,video/webm,video/mkv,video/avi,video/mov,video/x-matroska';

  function pickFile(f) {
    if (!f) return;
    setFile(f);
    setStatus('idle');
    setStatusMsg('');
    setFileName('');
    setJobId(null);
    onReady(null);
  }

  async function handleUpload() {
    if (!file) return;
    setStatus('uploading');
    setStatusMsg('Uploading video…');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API}/rag/ingestVideo`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const wrapper = await res.json(); // VideoDto { jobId, status, fileName, ... }
      
const data = wrapper.data;
      setJobId(data.jobId);
      setFileName(data.fileName || file.name);
      setStatus('polling');
      setStatusMsg('Processing video…');
      startPolling(data.jobId, data.fileName || file.name);
    } catch (err) {
      setStatus('error');
      setStatusMsg('Upload failed: ' + err.message);
    }
  }

  function startPolling(id, name) {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/rag/video/status/${id}`);
        if (!res.ok) return;
        const wrapper = await res.json();
const data = wrapper.data;
        // VideoDto { status: "COMPLETED" | "PROCESSING" | "FAILED" }
        const s = (data.status || '').toUpperCase();
        if (s === 'DONE') {
          clearInterval(pollRef.current);
          setStatus('done');
          setStatusMsg('Video ready!');
          onReady(name);
        } else if (s === 'FAILED') {
          clearInterval(pollRef.current);
          setStatus('error');
          setStatusMsg('Processing failed.');
        } else {
          setStatusMsg('Processing video… (' + (data.status || 'in progress') + ')');
        }
      } catch { /* keep polling */ }
    }, 3000);
  }

  useEffect(() => () => clearInterval(pollRef.current), []);

  const hasFile = !!file;
  const busy = status === 'uploading' || status === 'polling';

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div className="lbl" style={{ marginBottom: 12 }}>📹 Video Source</div>

      {/* Drop zone */}
      <div
        className={`drop-zone${hasFile ? ' has-file' : ''}${dragOver ? ' has-file' : ''}`}
        style={{ marginBottom: 14 }}
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files[0]); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          style={{ display: 'none' }}
          onChange={e => pickFile(e.target.files[0])}
        />
        {hasFile ? (
          <>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🎬</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{file.name}</div>
            <div className="muted" style={{ marginTop: 4 }}>
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🎥</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Drop a video or click to browse</div>
            <div className="muted" style={{ marginTop: 4 }}>MP4, WebM, MKV, AVI, MOV</div>
          </>
        )}
      </div>

      {/* Upload button */}
      <button
        className="btn-primary"
        disabled={!hasFile || busy || status === 'done'}
        onClick={handleUpload}
      >
        {busy ? <><Spinner /> &nbsp;{statusMsg}</> : status === 'done' ? '✓ Ready' : 'Upload & Process'}
      </button>

      {/* Status row */}
      {(status === 'polling' || status === 'done' || status === 'error') && (
        <div style={{ marginTop: 12 }}>
          {status === 'polling' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <Spinner />
              <span className="muted">{statusMsg}</span>
              {jobId && <span className="pill">job: {jobId.slice(0, 8)}…</span>}
            </div>
          )}
          {status === 'done' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ color: '#059669', fontWeight: 600 }}>✓</span>
              <span style={{ color: '#059669', fontWeight: 500 }}>
                {fileName || file?.name} — indexed &amp; ready
              </span>
            </div>
          )}
          {status === 'error' && (
            <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 500 }}>
              ✗ {statusMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Chat Panel ────────────────────────────────────────────────────────────────
function ChatPanel({ fileName, dark }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    if (!input.trim() || !fileName || loading) return;
    const q = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, fileName }),
      });
      
      const wrapper = await res.json();
const data = wrapper.data;
      setMessages(m => [...m, { role: 'ai', text: data.answer || data.response || JSON.stringify(data) }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'ai', text: '⚠ Error: ' + err.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Chat area */}
      <div className="chat-area" style={{ height: 420 }}>
        {messages.length === 0 ? (
          <div className="welcome-banner">
            <div style={{ fontSize: 32 }}>💬</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Ask about your video</div>
              <div className="muted">Upload and process a video first, then ask anything about its content.</div>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div className={m.role === 'user' ? 'bubble-user' : 'bubble-ai'}>{m.text}</div>
            </div>
          ))
        )}
        {loading && (
          <div style={{ display: 'flex' }}>
            <div className="bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Spinner /> <span className="muted">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          className="input"
          placeholder={fileName ? 'Ask a question about the video…' : 'Upload a video first…'}
          value={input}
          disabled={!fileName || loading}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button className="send-btn" onClick={send} disabled={!input.trim() || !fileName || loading}>
          {loading ? <Spinner /> : '↑'}
        </button>
      </div>
    </div>
  );
}

// ── Quiz Panel ────────────────────────────────────────────────────────────────
function QuizPanel({ fileName, dark }) {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);      // QuizResponseDto
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [submitted, setSubmitted] = useState(false);

  async function generate() {
    if (!fileName || loading) return;
    setLoading(true);
    setQuiz(null);
    setAnswers({});
    setRevealed({});
    setSubmitted(false);
    try {
      const res = await fetch(`${API}/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic || 'general', fileName, numberOfQuestions: count }),
      });
      const wrapper = await res.json();
const data = wrapper.data;
      setQuiz(data);
    } catch (err) {
      alert('Quiz generation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function select(qIdx, opt) {
    if (submitted) return;
    setAnswers(a => ({ ...a, [qIdx]: opt }));
  }

  function submit() {
    setSubmitted(true);
    const rev = {};
    (quiz?.questions || []).forEach((_, i) => { rev[i] = true; });
    setRevealed(rev);
  }

  const questions = quiz?.questions || [];
  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correctAnswer).length
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 12 }}>
          <div>
            <div className="lbl">Topic (optional)</div>
            <input
              className="input"
              placeholder="e.g. key concepts, summary…"
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
          </div>
          <div>
            <div className="lbl">Questions</div>
            <input
              className="input"
              type="number"
              min={1} max={20}
              value={count}
              style={{ width: 72 }}
              onChange={e => setCount(Number(e.target.value))}
            />
          </div>
        </div>
        <button className="btn-primary" disabled={!fileName || loading} onClick={generate}>
          {loading ? <><Spinner /> &nbsp;Generating…</> : '⚡ Generate Quiz'}
        </button>
      </div>

      {/* Questions */}
      {questions.map((q, qi) => (
        <div key={qi} className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <span className="q-badge">{qi + 1}</span>
            <span style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.5 }}>{q.question}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {(q.options || []).map((opt, oi) => {
              const sel = answers[qi] === opt;
              const show = revealed[qi];
              const correct = opt === q.correctAnswer;
              let cls = 'opt-btn';
              if (show) cls += correct ? ' ok' : sel ? ' bad' : '';
              else if (sel) cls += ' sel';
              return (
                <button
                  key={oi}
                  className={cls}
                  disabled={submitted}
                  onClick={() => select(qi, opt)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {revealed[qi] && q.explanation && (
            <div className="expl" style={{ marginTop: 12 }}>{q.explanation}</div>
          )}
        </div>
      ))}

      {/* Submit / Score */}
      {questions.length > 0 && !submitted && (
        <button className="btn-success" onClick={submit}>Submit Answers</button>
      )}
      {submitted && (
        <div className="score-card">
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Quiz Complete</div>
            <div className="muted">
              {score} / {questions.length} correct
            </div>
          </div>
          <div className="stat-n" style={{ fontSize: 32 }}>
            {Math.round((score / questions.length) * 100)}%
          </div>
        </div>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { dark, toggle } = useTheme();
  const [tab, setTab] = useState('chat');
  const [fileName, setFileName] = useState(null); // set once video is ready
  const [toast, setToast] = useState(null);

  function handleVideoReady(name) {
    setFileName(name);
    if (name) setToast('Video processed — ready to use!');
  }

  return (
    <div className={`app ${dark ? 'dark' : 'light'}`}>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <header style={{
        padding: '20px 0 18px',
        borderBottom: `1px solid ${dark ? '#111120' : '#ebebf5'}`,
        marginBottom: 28,
      }}>
        <div className="page-wrapper" style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>🎓</span>
              <div>
                <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>Learnify</span>
                <span className="pill" style={{ marginLeft: 8 }}>AI Tutor</span>
              </div>
            </div>
            <button
              onClick={toggle}
              style={{
                background: 'none', border: `1px solid ${dark ? '#1e1e30' : '#dddded'}`,
                borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                fontSize: 12, color: dark ? '#44446a' : '#8888aa',
              }}
            >
              {dark ? '☀ Light' : '☾ Dark'}
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="page-wrapper">
        <div className="two-col">

          {/* Sidebar — Video Upload */}
          <div className="sidebar">
            <VideoUpload onReady={handleVideoReady} dark={dark} />

            {fileName && (
              <div style={{
                marginTop: 14, borderRadius: 10, padding: '10px 14px',
                background: dark ? '#041a0e' : '#ecfdf5',
                border: `1px solid ${dark ? '#0d3320' : '#a7f3d0'}`,
                fontSize: 12,
              }}>
                <span style={{ color: '#059669', fontWeight: 600 }}>Active: </span>
                <span style={{ color: dark ? '#6ee7b7' : '#065f46' }}>{fileName}</span>
              </div>
            )}
          </div>

          {/* Main content — Chat / Quiz tabs */}
          <div className="main-content">
            {/* Tabs */}
            <div className="card" style={{ padding: 6, display: 'flex', gap: 4, marginBottom: 20 }}>
              {['chat', 'quiz'].map(t => (
                <button
                  key={t}
                  className={`tab-btn${tab === t ? ' active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t === 'chat' ? '💬 Chat' : '⚡ Quiz'}
                </button>
              ))}
            </div>

            {tab === 'chat' && <ChatPanel fileName={fileName} dark={dark} />}
            {tab === 'quiz' && <QuizPanel fileName={fileName} dark={dark} />}
          </div>
        </div>
      </div>
    </div>
  );
}