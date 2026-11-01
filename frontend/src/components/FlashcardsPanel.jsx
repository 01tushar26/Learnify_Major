import React, { useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, Volume2, VolumeX, Download, Check, X, Layers } from "lucide-react";
import StudyGate from "@/components/StudyGate";
import { useStudyPart } from "@/hooks/useStudyPack";
import { playSound } from "@/lib/sounds";
import { downloadFile, flashcardsToAnki, safeName } from "@/lib/download";

const THRESHOLD = 90; // px dragged before a swipe counts

export default function FlashcardsPanel({ study, materialId, active, title }) {
  const { data, error } = useStudyPart(materialId, "flashcards", study.state === "done", active);

  const [deck, setDeck] = useState(null);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exit, setExit] = useState(0); // -1 = up (know) | 1 = down (review) | 0
  const [known, setKnown] = useState(0);
  const [missed, setMissed] = useState([]);
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem("fc-muted") === "1"; } catch { return false; }
  });
  const start = useRef(null);
  const moved = useRef(false);

  useEffect(() => {
    if (data && !deck) setDeck(data);
  }, [data, deck]);

  const sound = (k) => !muted && playSound(k);
  const toggleMute = () => {
    setMuted((m) => {
      try { localStorage.setItem("fc-muted", m ? "0" : "1"); } catch { /* ignore */ }
      return !m;
    });
  };

  const finished = deck && i >= deck.length;
  const card = deck?.[i];

  const flip = () => { sound("flip"); setFlipped((f) => !f); };

  // dir: -1 = swiped up (know it), 1 = swiped down (review again)
  const commit = (dir) => {
    if (exit || !card) return;
    sound(dir < 0 ? "know" : "review");
    setExit(dir);
    setDy(dir * 600);
    setTimeout(() => {
      if (dir < 0) setKnown((k) => k + 1);
      else setMissed((m) => [...m, card]);
      setFlipped(false);
      setExit(0);
      setDy(0);
      setI((x) => {
        if (x + 1 >= deck.length) sound("done");
        return x + 1;
      });
    }, 220);
  };

  // Keyboard: up = know, down = review, space = flip
  useEffect(() => {
    if (!active || finished || !deck) return;
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === "ArrowUp") { e.preventDefault(); commit(-1); }
      else if (e.key === "ArrowDown") { e.preventDefault(); commit(1); }
      else if (e.key === " ") { e.preventDefault(); flip(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onDown = (e) => {
    if (exit) return;
    start.current = e.clientY;
    moved.current = false;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!dragging) return;
    const d = e.clientY - start.current;
    if (Math.abs(d) > 6) moved.current = true;
    setDy(d);
  };
  const onUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (!moved.current) { setDy(0); flip(); return; }   // a tap flips the card
    if (dy < -THRESHOLD) commit(-1);
    else if (dy > THRESHOLD) commit(1);
    else setDy(0);                                      // snap back
  };

  const restart = (cards) => {
    setDeck(cards); setI(0); setKnown(0); setMissed([]); setFlipped(false); setDy(0);
  };

  const hint = dy < -40 ? "know" : dy > 40 ? "review" : null;

  const handleDownload = () => {
    const base = safeName((title || "study").replace(/\.[^.]+$/, ""));
    downloadFile(`${base}-flashcards.txt`, flashcardsToAnki(data ?? deck));
  };

  return (
    <StudyGate study={study}>
      {error ? (
        <p className="p-8 text-sm text-rose-400 text-center">{error}</p>
      ) : !deck ? (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#58A6FF]" />
        </div>
      ) : (
        <div className="h-full overflow-y-auto px-4 sm:px-8 py-8">
          <div className="max-w-md mx-auto">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-zinc-400">
                {finished ? "Done" : `Card ${i + 1} of ${deck.length}`}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs px-2.5 py-1.5 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
                <button
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800 p-1.5 transition-colors"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="h-1 rounded-full bg-zinc-800 mb-6 overflow-hidden">
              <div
                className="h-full bg-[#58A6FF] transition-all duration-300"
                style={{ width: `${(Math.min(i, deck.length) / deck.length) * 100}%` }}
              />
            </div>

            {!finished ? (
              <>
                <div className="relative" style={{ perspective: 1200 }}>
                  {/* Cards waiting behind the top one */}
                  {[2, 1].map((n) =>
                    deck[i + n] ? (
                      <div
                        key={n}
                        className="absolute inset-0 rounded-xl border border-[#58A6FF]/10 bg-zinc-950/70"
                        style={{ transform: `translateY(${n * 10}px) scale(${1 - n * 0.04})`, zIndex: 0 }}
                      />
                    ) : null
                  )}

                  <div
                    onPointerDown={onDown}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                    className="relative select-none cursor-grab active:cursor-grabbing"
                    style={{
                      zIndex: 1,
                      touchAction: "pan-x",
                      transform: `translateY(${dy}px) rotate(${dy / 40}deg)`,
                      opacity: exit ? 0 : 1,
                      transition: dragging ? "none" : "transform 220ms ease-out, opacity 220ms ease-out",
                    }}
                  >
                    {/* Swipe feedback */}
                    <div
                      className="absolute top-3 left-1/2 -translate-x-1/2 z-10 rounded-lg border-2 border-emerald-400 text-emerald-400 bg-zinc-950/80 px-3 py-1 text-xs font-bold pointer-events-none"
                      style={{ opacity: hint === "know" ? Math.min(-dy / THRESHOLD, 1) : 0 }}
                    >
                      KNOW IT
                    </div>
                    <div
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 rounded-lg border-2 border-rose-400 text-rose-400 bg-zinc-950/80 px-3 py-1 text-xs font-bold pointer-events-none"
                      style={{ opacity: hint === "review" ? Math.min(dy / THRESHOLD, 1) : 0 }}
                    >
                      REVIEW
                    </div>

                    {/* 3D flip */}
                    <div
                      className="relative min-h-[340px]"
                      style={{
                        transformStyle: "preserve-3d",
                        transition: "transform 450ms",
                        transform: flipped ? "rotateY(180deg)" : "none",
                      }}
                    >
                      <Face label="Question" text={card.front} index={i + 1} total={deck.length} />
                      <Face label="Answer" text={card.back} index={i + 1} total={deck.length} back />
                    </div>
                  </div>
                </div>

                {/* Buttons for mouse users */}
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    onClick={() => commit(1)}
                    aria-label="Review again"
                    className="h-12 w-12 rounded-full border border-rose-800/60 bg-rose-950/30 text-rose-400 hover:bg-rose-950/60 active:scale-95 flex items-center justify-center transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => commit(-1)}
                    aria-label="I know this"
                    className="h-12 w-12 rounded-full border border-emerald-800/60 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-950/60 active:scale-95 flex items-center justify-center transition-all"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-[#58A6FF]/20 bg-zinc-950/80 p-8 text-center">
                <p className="text-5xl font-semibold text-white">
                  {known}<span className="text-zinc-500">/{deck.length}</span>
                </p>
                <p className="text-sm text-zinc-400 mt-2">
                  {missed.length === 0 ? "You knew every card." : `${missed.length} card${missed.length > 1 ? "s" : ""} to review.`}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {missed.length > 0 && (
                    <button
                      onClick={() => restart(missed)}
                      className="rounded-xl bg-[#58A6FF] hover:bg-[#79B8FF] active:scale-95 text-black font-medium text-sm px-5 py-2.5 transition-all"
                    >
                      Review missed
                    </button>
                  )}
                  <button
                    onClick={() => restart(data)}
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-sm px-5 py-2.5 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" /> Start over
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </StudyGate>
  );
}

// One side of the card, styled like MaterialCard: icon box + label, body, footer with divider
function Face({ label, text, index, total, back }) {
  return (
    <div
      className="absolute inset-0 flex flex-col rounded-xl border border-[#58A6FF]/20 bg-zinc-950/95 p-5 shadow-xl shadow-blue-900/10"
      style={{ backfaceVisibility: "hidden", transform: back ? "rotateY(180deg)" : "none" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#58A6FF]/10 border border-[#58A6FF]/20 shadow-inner">
            <Layers className="h-5 w-5 text-[#58A6FF]" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-100">{label}</p>
            <p className="text-xs text-zinc-400 mt-0.5">Flashcard</p>
          </div>
        </div>
        <span className="rounded-full border border-[#58A6FF]/30 bg-blue-950/50 text-[#58A6FF] text-xs px-2.5 py-0.5">
          {index}/{total}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center text-center py-6 overflow-y-auto">
        <p className={`leading-relaxed ${back ? "text-base text-zinc-100" : "text-lg font-medium text-white"}`}>
          {text}
        </p>
      </div>

      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
        <span>Tap to flip</span>
        <span>Swipe up: know · down: review</span>
      </div>
    </div>
  );
}