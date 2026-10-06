import React, { useState, useEffect } from "react";
import { ArrowRight, Play, FileText, Video, Send, Loader2, CheckCircle2, MessageSquare, ListChecks, FolderPlus, User, Clock, FileVideo, Trash2, Plus, ArrowLeft } from "lucide-react";
import AuthDialog from "@/components/AuthDialog";

const LINE_1 = "Boring tutorials? Turn it into";
const PREFIX = "a personalized ";
const WORDS = ["tutor.", "quiz maker.", "study buddy."];
const LONGEST = WORDS.reduce((a, b) => (b.length > a.length ? b : a));

// Types the fixed headline once, then endlessly types / holds / deletes the last word.
// Respects prefers-reduced-motion by showing a static headline.
function useRotatingHeadline({ typeSpeed = 70, deleteSpeed = 35, hold = 1800 } = {}) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const fixedLen = LINE_1.length + PREFIX.length;
  const [fixedCount, setFixedCount] = useState(reduce ? fixedLen : 0);
  const [wordIdx, setWordIdx] = useState(0);
  const [wordCount, setWordCount] = useState(reduce ? WORDS[0].length : 0);
  const [phase, setPhase] = useState(reduce ? "static" : "intro");
  const [revealed, setRevealed] = useState(reduce);

  useEffect(() => {
    if (phase === "static") return;
    const word = WORDS[wordIdx];
    let t;

    if (phase === "intro") {
      if (fixedCount < fixedLen) {
        t = setTimeout(() => setFixedCount((c) => c + 1), fixedCount === 0 ? 400 : 55);
      } else {
        t = setTimeout(() => setPhase("typing"), 150);
      }
    } else if (phase === "typing") {
      if (wordCount < word.length) {
        t = setTimeout(() => setWordCount((c) => c + 1), typeSpeed);
      } else {
        setRevealed(true);
        setPhase("hold");
      }
    } else if (phase === "hold") {
      t = setTimeout(() => setPhase("deleting"), hold);
    } else if (phase === "deleting") {
      if (wordCount > 0) {
        t = setTimeout(() => setWordCount((c) => c - 1), deleteSpeed);
      } else {
        t = setTimeout(() => {
          setWordIdx((i) => (i + 1) % WORDS.length);
          setPhase("typing");
        }, 250);
      }
    }
    return () => clearTimeout(t);
  }, [phase, fixedCount, wordCount, wordIdx, fixedLen, typeSpeed, deleteSpeed, hold]);

  const line1 = LINE_1.slice(0, fixedCount);
  const prefix = PREFIX.slice(0, Math.max(0, fixedCount - LINE_1.length));
  const word = WORDS[wordIdx].slice(0, wordCount);
  const onLine2 = fixedCount > LINE_1.length || phase !== "intro";

  return { line1, prefix, word, onLine2, revealed };
}

const BADGE = "Stop rewatching. Start asking";
const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

const scrambleText = (text, resolved) =>
  text
    .split("")
    .map((ch, i) =>
      ch === " " || ch === "." || i < resolved
        ? ch
        : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    )
    .join("");

// Decodes `text` left to right out of random letters. Static under reduced motion.
function useScramble(text, { delay = 200, interval = 40, speed = 0.7 } = {}) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [out, setOut] = useState(() => (reduce ? text : scrambleText(text, 0)));

  useEffect(() => {
    if (reduce) return;
    let id;
    let frame = 0;
    const start = setTimeout(() => {
      id = setInterval(() => {
        frame += 1;
        const resolved = Math.floor(frame * speed);
        setOut(scrambleText(text, resolved));
        if (resolved >= text.length) clearInterval(id);
      }, interval);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(id);
    };
  }, [text, delay, interval, speed, reduce]);

  return out;
}

// Reusable animated link component with a smooth 3D text flip effect on hover
function FlippingNavLink({ href, children, onClick, textColor = "text-zinc-300", hoverColor = "text-white" }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`group relative inline-block h-5 overflow-hidden text-sm font-medium transition-colors duration-200 ${textColor}`}
    >
      <div className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-1/2">
        <span className="flex h-5 items-center">{children}</span>
        <span className={`flex h-5 items-center font-semibold ${hoverColor}`}>
          {children}
        </span>
      </div>
    </a>
  );
}

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);

  const { line1, prefix, word, onLine2, revealed: done } = useRotatingHeadline();
  const badge = useScramble(BADGE);

  // Everything after the headline fades in once typing finishes
  const reveal = `transition-all duration-700 ease-out ${
    done ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
  }`;

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-[#58A6FF]/30 py-6 px-4">
      <style>{`
        @keyframes learnify-caret { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
        .learnify-caret { animation: learnify-caret 1s steps(1) infinite; }
        @keyframes learnify-pop { from { opacity: 0; transform: translateY(10px) scale(.98) } to { opacity: 1; transform: none } }
        .learnify-pop { animation: learnify-pop 450ms ease-out both; }
        @keyframes learnify-fade { from { opacity: 0 } to { opacity: 1 } }
        .learnify-fade { animation: learnify-fade 400ms ease-out both; }
        @media (prefers-reduced-motion: reduce) { .learnify-caret, .learnify-pop, .learnify-fade { animation: none; } }
      `}</style>

      {/* --- Ambient Background Glow & Dot Grid Overlay --- */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#383842_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#58A6FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#58A6FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. FLOATING CENTERED NAVBAR */}
      <nav className="max-w-4xl mx-auto h-14 rounded-full border border-zinc-800 bg-[#191919] px-4 flex items-center justify-between sticky top-6 z-50 shadow-2xl shadow-black/80">
        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-[#58A6FF] bg-clip-text text-transparent">
            Learnify
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs sm:text-sm px-5 py-2.5 transition-all active:scale-95 shadow-md flex items-center justify-center"
          >
            <FlippingNavLink textColor="text-zinc-950" hoverColor="text-zinc-950">
              Sign Up
            </FlippingNavLink>
          </button>
        </div>
      </nav>

      {/* --- Main Hero Section --- */}
      <main className="max-w-6xl mx-auto text-center pt-20 pb-16 px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#58A6FF]/20 bg-[#58A6FF]/10 text-[#58A6FF] text-xs font-medium w-fit mb-6 mx-auto">
          {/* Decodes from random letters on load; the invisible copy reserves the width */}
          <span className="grid">
            <span className="col-start-1 row-start-1 invisible">{BADGE}</span>
            <span aria-hidden="true" className="col-start-1 row-start-1 text-left">{badge}</span>
            <span className="sr-only">{BADGE}</span>
          </span>
        </div>

        {/* Shrink-wrapped to the headline: everything below matches the heading text width */}
        <div className="mx-auto w-fit max-w-full">
        {/* Headline: fixed text types in once, then the last word rotates.
            The invisible full copy reserves the final size so the layout never jumps. */}
        <h1
          aria-label={`Boring tutorials? Turn it into ${PREFIX}${WORDS.map((w) => w.replace(".", "")).join(", ")}.`}
          className="font-brighta text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-[1.15] max-w-5xl mx-auto"
        >
          <span aria-hidden="true" className="grid">
            <span className="col-start-1 row-start-1 invisible">
              <span className="block">{LINE_1}</span>
              <span className="block">{PREFIX}{LONGEST}</span>
            </span>

            <span className="col-start-1 row-start-1">
              <span className="block">
                {line1}
                {!onLine2 && <Caret />}
              </span>
              {/* inline-grid + left-aligned text keeps "a personalized" still while the word changes */}
              <span className="inline-grid text-left">
                <span className="col-start-1 row-start-1 invisible whitespace-pre">{PREFIX}{LONGEST}</span>
                <span className="col-start-1 row-start-1 whitespace-pre">
                  {prefix}
                  <span className="bg-gradient-to-r from-[#58A6FF] via-[#8FC4FF] to-white bg-clip-text text-transparent">
                    {word}
                  </span>
                  {onLine2 && <Caret />}
                </span>
              </span>
            </span>
          </span>
        </h1>

        {/* Description */}
        <p
          className={`mt-6 w-0 min-w-full text-lg sm:text-xl text-zinc-400 max-w-2xl font-normal leading-relaxed mx-auto text-center ${reveal}`}
        >
          No more pausing, rewinding, re-reading. Ask it questions, generate instant quizzes — Learnify handles the rest, grounded in exactly what you uploaded.
        </p>

        {/* Call to Actions */}
        <div className={`mt-10 w-0 min-w-full flex flex-wrap items-center gap-4 justify-center ${reveal}`} style={{ transitionDelay: "150ms" }}>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#58A6FF] hover:bg-[#79B8FF] active:scale-95 text-black font-semibold text-base px-6 py-3.5 transition-all duration-200"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-200 font-medium text-base px-6 py-3.5 transition-all duration-200"
          >
            <Play className="h-4 w-4 text-[#58A6FF] fill-[#58A6FF]" />
            Watch Demo
          </button>
        </div>

        {/* Product preview: a live-looking Learnify workspace instead of a screenshot */}
        <div className={`mt-14 w-full max-w-5xl mx-auto text-left ${reveal}`} style={{ transitionDelay: "300ms" }}>
          <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950">
            <ChatDemo active={done} />
          </div>
        </div>
        </div>

        {/* Feature Pills */}
        <div className="mt-12 flex items-center justify-center gap-6 text-xs text-zinc-500 border-t border-zinc-800/60 pt-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#58A6FF]" />
            <span>PDF Indexing</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-[#58A6FF]" />
            <span>Video Transcriptions</span>
          </div>
        </div>
      </main>

      {/* --- Footer / Showcase Strip --- */}
      <footer className="relative z-10 border-t border-zinc-800/60 bg-zinc-950/40 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-zinc-500 uppercase tracking-widest">
          <span>SHOWCASE / DEMO</span>
          <span>2026</span>
        </div>
      </footer>

      {/* --- Auth Dialog Modal --- */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}

// Blinking caret that follows the text being typed or deleted.
function Caret() {
  return (
    <span className="learnify-caret ml-1 inline-block w-[3px] h-[0.9em] align-[-0.1em] bg-[#58A6FF]" />
  );
}

// Dashboard scene (upload -> processing -> done -> open) runs first, then the workspace scene.
const PHASES = ["empty", "upload1", "proc1", "upload2", "done1", "open", "idle", "typing", "thinking", "answer", "hold", "quiz", "picked"];
const DASH = PHASES.slice(0, PHASES.indexOf("idle"));

const QUESTION = "Summarize this material";
const ANSWER =
  "Lecture 2 explains how a model learns with gradient descent. It measures its error with a loss function, then moves each weight a small step against the gradient. The learning rate sets the step size: too high and it overshoots, too low and training crawls.";
const SUGGESTIONS = ["Summarize this material", "What are the key concepts?", "Explain the hardest part simply"];
const QUIZ = {
  question: "What does the learning rate control in gradient descent?",
  options: ["The size of each weight update", "The number of training examples", "The depth of the network"],
  correct: 0,
  explanation: "A larger rate takes bigger steps and can overshoot the minimum. A smaller one is stable but slow.",
};
const DEMO_TABS = [
  { key: "chat", label: "Chat", hint: "Ask questions", Icon: MessageSquare },
  { key: "quiz", label: "Quiz", hint: "Test yourself", Icon: ListChecks },
];

// Looping preview that reuses the real ChatPanel / QuizPanel / MaterialPage styling:
// type a question, get a grounded answer, then switch to the Quiz tab and answer a question.
function ChatDemo({ active }) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const words = ANSWER.split(" ");

  const [phase, setPhase] = useState(reduce ? "static" : "empty");
  const [qCount, setQCount] = useState(0);
  const [aWords, setAWords] = useState(reduce ? words.length : 0);

  useEffect(() => {
    if (phase === "static") return;
    let t;
    if (phase === "empty") {
      if (active) t = setTimeout(() => setPhase("upload1"), 1100);
    } else if (phase === "upload1") {
      t = setTimeout(() => setPhase("proc1"), 1100);
    } else if (phase === "proc1") {
      t = setTimeout(() => setPhase("upload2"), 1300);
    } else if (phase === "upload2") {
      t = setTimeout(() => setPhase("done1"), 1100);
    } else if (phase === "done1") {
      t = setTimeout(() => setPhase("open"), 1400);
    } else if (phase === "open") {
      t = setTimeout(() => setPhase("idle"), 800);
    } else if (phase === "idle") {
      t = setTimeout(() => setPhase("typing"), 900);
    } else if (phase === "typing") {
      if (qCount < QUESTION.length) t = setTimeout(() => setQCount((c) => c + 1), 55);
      else t = setTimeout(() => setPhase("thinking"), 350);
    } else if (phase === "thinking") {
      t = setTimeout(() => setPhase("answer"), 1000);
    } else if (phase === "answer") {
      if (aWords < words.length) t = setTimeout(() => setAWords((c) => c + 1), 45);
      else setPhase("hold");
    } else if (phase === "hold") {
      t = setTimeout(() => setPhase("quiz"), 3200);
    } else if (phase === "quiz") {
      t = setTimeout(() => setPhase("picked"), 1800);
    } else if (phase === "picked") {
      t = setTimeout(() => {
        setQCount(0);
        setAWords(0);
        setPhase("empty");
      }, 4000);
    }
    return () => clearTimeout(t);
  }, [phase, active, qCount, aWords, words.length]);

  const onDash = DASH.includes(phase);
  const tab = phase === "quiz" || phase === "picked" ? "quiz" : "chat";
  const sent = ["thinking", "answer", "hold", "static"].includes(phase);
  const inputText = phase === "typing" ? QUESTION.slice(0, qCount) : "";
  const picked = phase === "picked";

  return (
    <div
      role="img"
      aria-label="Demo: a student asks Learnify to summarize an uploaded lecture, gets an answer grounded in it, then answers a generated quiz question."
    >
      <div aria-hidden="true" className="flex h-[28rem] sm:h-[26rem] flex-col bg-zinc-950">
        {onDash ? (
          <DashboardScene phase={phase} />
        ) : (
        <div key="workspace" className="learnify-fade flex min-h-0 flex-1 flex-row">
        {/* Left sidebar, styled like the MaterialPage sidebar (icons only on small screens) */}
        <aside className="flex w-14 shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950 sm:w-56">
          <div className="min-w-0 border-b border-zinc-800/80 p-3 sm:p-4">
            <span className="mb-3 hidden items-center gap-1.5 text-xs text-zinc-400 sm:inline-flex">
              <ArrowLeft className="h-3.5 w-3.5" /> All materials
            </span>
            <div className="flex min-w-0 items-center justify-center gap-2.5 sm:justify-start">
              <div className="shrink-0 rounded-lg border border-[#58A6FF]/20 bg-[#58A6FF]/10 p-2">
                <FileText className="h-4 w-4 text-[#58A6FF]" />
              </div>
              <p className="hidden min-w-0 truncate text-sm font-medium text-zinc-100 sm:block">
                Lecture 2 - Gradient Descent.pdf
              </p>
            </div>
          </div>
          <nav className="flex flex-col gap-1 p-2 sm:p-3">
            {DEMO_TABS.map(({ key, label, hint, Icon }) => (
              <span
                key={key}
                className={`flex items-center justify-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200 sm:justify-start ${
                  tab === key
                    ? "border-[#58A6FF]/30 bg-[#58A6FF]/10 text-[#58A6FF]"
                    : "border-transparent text-zinc-400"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-[11px] opacity-70">{hint}</span>
                </span>
              </span>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {tab === "chat" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-hidden px-5 py-5">
              <div className="space-y-4">
                {!sent && (
                  <div className="pt-4 text-center">
                    <h2 className="text-lg font-semibold text-white">Ask anything about this material</h2>
                    <p className="mt-1 text-sm text-zinc-400">Answers are grounded in what you uploaded.</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {SUGGESTIONS.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-[#58A6FF]/20 bg-[#58A6FF]/10 px-3.5 py-1.5 text-xs text-[#58A6FF]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {sent && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[#58A6FF] px-4 py-2.5 text-sm leading-relaxed text-black">
                      {QUESTION}
                    </div>
                  </div>
                )}

                {phase === "thinking" && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm border border-zinc-800/80 bg-zinc-900 px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-[#58A6FF]" />
                    </div>
                  </div>
                )}

                {sent && aWords > 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-zinc-800/80 bg-zinc-900 px-4 py-2.5 text-sm leading-relaxed text-zinc-200">
                      {/* The invisible full answer reserves the final width and height, so the bubble never resizes while streaming */}
                      <span className="grid">
                        <span aria-hidden="true" className="invisible col-start-1 row-start-1">{ANSWER}</span>
                        <span className="col-start-1 row-start-1">{words.slice(0, aWords).join(" ")}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input bar, styled like ChatPanel */}
            <div className="border-t border-zinc-800/80 bg-zinc-950 px-4 py-3">
              <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-2">
                <div className="flex-1 truncate px-2 py-1.5 text-sm">
                  {inputText ? (
                    <span className="text-zinc-100">
                      {inputText}
                      <Caret />
                    </span>
                  ) : (
                    <span className="text-zinc-500">Ask a question…</span>
                  )}
                </div>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-[#58A6FF] text-black transition-opacity duration-200 ${
                    inputText ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <Send className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Quiz view, styled like QuizPanel */
          <div className="min-h-0 flex-1 overflow-hidden px-5 py-5">
            <div className="mx-auto w-full max-w-xl">
              <div className="mb-3 flex items-center justify-between text-xs text-zinc-400">
                <span>Question 1 of 5</span>
                <span>Score {picked ? 1 : 0}</span>
              </div>
              <div className="mb-5 h-1 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-[#58A6FF] transition-all duration-300"
                  style={{ width: picked ? "20%" : "0%" }}
                />
              </div>

              <h3 className="text-base font-medium leading-snug text-white">{QUIZ.question}</h3>

              <div className="mt-4 space-y-2">
                {QUIZ.options.map((opt, i) => {
                  const isCorrect = i === QUIZ.correct;
                  let style = "border-zinc-800 bg-zinc-900/60";
                  if (picked && isCorrect) style = "border-emerald-700/60 bg-emerald-950/40 text-emerald-200";
                  else if (picked) style = "border-zinc-800/60 bg-zinc-900/30 text-zinc-500";
                  return (
                    <div
                      key={opt}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors duration-300 ${style}`}
                    >
                      <span>{opt}</span>
                      {picked && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
                    </div>
                  );
                })}
              </div>

              <p
                className={`mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 text-sm leading-relaxed text-zinc-400 transition-opacity duration-300 ${
                  picked ? "opacity-100" : "opacity-0"
                }`}
              >
                {QUIZ.explanation}
              </p>
            </div>
          </div>
        )}
        </div>
        </div>
        )}
      </div>
    </div>
  );
}

const DEMO_STATUS = {
  QUEUED: { label: "Queued", badge: "bg-zinc-800/80 text-zinc-300 border-zinc-700/80", Icon: Clock, icon: "text-zinc-400" },
  PROCESSING: { label: "Processing", badge: "bg-blue-950/50 text-[#58A6FF] border-[#58A6FF]/30", Icon: Loader2, icon: "animate-spin text-[#58A6FF]" },
  DONE: { label: "Completed", badge: "bg-emerald-950/50 text-emerald-300 border-emerald-800/40", Icon: CheckCircle2, icon: "text-emerald-400" },
};

// Mirrors MaterialCard: icon box, filename, status badge, then delete + date and the open arrow.
function DemoCard({ name, type, status, opening }) {
  const TypeIcon = type === "VIDEO" ? FileVideo : FileText;
  const { label, badge, Icon: StatusIcon, icon } = DEMO_STATUS[status];
  const ready = status === "DONE";
  return (
    <div className="learnify-pop min-w-0 rounded-xl border border-[#58A6FF]/20 bg-zinc-950/80 p-4">
      <div className="flex min-w-0 flex-col items-start gap-3">
        <div className="flex w-full min-w-0 items-center gap-3">
          <div className="shrink-0 rounded-lg border border-[#58A6FF]/20 bg-[#58A6FF]/10 p-2.5 shadow-inner">
            <TypeIcon className="h-5 w-5 text-[#58A6FF]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-100">{name}</p>
            <p className="mt-0.5 text-xs text-zinc-400">{type === "VIDEO" ? "Video Material" : "PDF Document"}</p>
          </div>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors duration-300 ${badge}`}>
          <StatusIcon className={`h-3.5 w-3.5 shrink-0 ${icon}`} />
          {label}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-800/60 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`p-1.5 text-zinc-500 ${ready ? "" : "opacity-40"}`}>
            <Trash2 className="h-4 w-4" />
          </span>
          <span className="truncate text-[11px] text-zinc-400">06 Oct 2026</span>
        </div>
        <span
          className={`inline-flex items-center rounded-lg border px-2.5 py-1.5 text-xs font-medium text-[#58A6FF] transition-all duration-300 ${
            opening
              ? "scale-95 border-[#58A6FF]/50 bg-[#58A6FF]/20"
              : ready
              ? "border-[#58A6FF]/30 bg-[#58A6FF]/10"
              : "border-[#58A6FF]/30 bg-[#58A6FF]/10 opacity-40"
          }`}
        >
          <ArrowRight className={`h-3.5 w-3.5 transition-transform duration-300 ${opening ? "translate-x-0.5" : ""}`} />
        </span>
      </div>
    </div>
  );
}

// Mirrors Header + MaterialsDashboard: tap "+", a card appears and moves Queued -> Processing -> Completed.
function DashboardScene({ phase }) {
  const at = (p) => PHASES.indexOf(p);
  const rank = at(phase);
  const card1 = rank < at("upload1") ? null : rank < at("proc1") ? "QUEUED" : rank < at("done1") ? "PROCESSING" : "DONE";
  const card2 = rank < at("upload2") ? null : rank < at("done1") ? "QUEUED" : "PROCESSING";
  const uploading = phase === "upload1" || phase === "upload2";

  return (
    <div key="dashboard" className="learnify-fade flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4">
        <span className="bg-gradient-to-r from-white via-zinc-100 to-[#58A6FF] bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
          Learnify
        </span>
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#58A6FF]/20 bg-[#58A6FF]/10 text-[#58A6FF] transition-all duration-200 ${
              uploading ? "scale-90 bg-[#58A6FF]/25" : ""
            }`}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </span>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300">
            <User className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-5 py-5">
        {!card1 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="relative mb-4">
              <div className="absolute -inset-1 rounded-full bg-[#58A6FF]/10 blur-md" />
              <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900 p-3.5 shadow-xl">
                <FolderPlus className="h-7 w-7 text-[#58A6FF]" />
              </div>
            </div>
            <h3 className="mb-1 text-base font-semibold text-white">No materials uploaded yet</h3>
            <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
              Drop a PDF document or a video file to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <DemoCard name="Lecture 2 - Gradient Descent.pdf" type="PDF" status={card1} opening={phase === "open"} />
            {card2 && <DemoCard name="Lecture 3 - Backprop.mp4" type="VIDEO" status={card2} />}
          </div>
        )}
      </div>
    </div>
  );
}