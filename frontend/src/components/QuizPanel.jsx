import React, { useState } from "react";
import { Loader2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import axiosInstance from "@/lib/axios-instance";
import { toast } from "sonner";

const LETTERS = ["A", "B", "C", "D"];

// Backend sends { id, questions: [{ id, question, optionA..optionD }] } with no answers.
// `correct` and `explanation` are filled in after the answer is submitted to POST /quiz/submit.
function normalizeQuiz(raw) {
  return (raw?.questions ?? []).map((q) => ({
    id: q.id,
    question: q.question,
    options: LETTERS.map((L) => q[`option${L}`] ?? ""),
    correct: -1,
    explanation: null,
  }));
}

export default function QuizPanel({ materialId }) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [checking, setChecking] = useState(false);
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/quiz/generate", {
        topic: topic.trim() || null,
        materialId,
        numberOfQuestions: count,
      });
      const payload = res.data?.data ?? res.data;
      const qs = normalizeQuiz(payload).filter((q) => q.id != null && q.question && q.options.every(Boolean));
      if (!qs.length) throw new Error("No questions were returned.");
      setQuizId(payload.id);
      setQuestions(qs);
      setCurrent(0); setPicked(null); setScore(0); setFinished(false);
    } catch (e) {
      toast.error("Couldn't generate quiz", { description: e?.response?.data?.error?.message ?? e.message });
    } finally {
      setLoading(false);
    }
  };

  // Sends the picked option to the backend, which replies with the correct answer and explanation.
  const choose = async (i) => {
    if (picked !== null || checking) return;
    const q = questions[current];
    setPicked(i);
    setChecking(true);
    try {
      const res = await axiosInstance.post("/quiz/submit", {
        quizId,
        answers: { [q.id]: LETTERS[i] },
      });
      const r = res.data?.data ?? res.data;
      const letter = String(r.correctAnswers?.[q.id] ?? "").trim().toUpperCase();
      const correct = LETTERS.indexOf(letter);
      setQuestions((qs) =>
        qs.map((x, idx) =>
          idx === current ? { ...x, correct, explanation: r.explanations?.[q.id] ?? null } : x
        )
      );
      if (correct === i) setScore((s) => s + 1);
    } catch (e) {
      setPicked(null); // let the user try again
      toast.error("Couldn't check your answer", {
        description: e?.response?.data?.error?.message ?? e?.response?.data?.message ?? e.message,
      });
    } finally {
      setChecking(false);
    }
  };

  const next = () => {
    if (current + 1 >= questions.length) setFinished(true);
    else { setCurrent((c) => c + 1); setPicked(null); }
  };

  const reset = () => { setQuestions(null); setFinished(false); };

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-8 py-10">
      <div className="max-w-2xl mx-auto">
        {/* --- Setup --- */}
        {!questions && (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white">Generate a quiz</h2>
            <p className="text-sm text-zinc-400 mt-1">Questions are created from this material.</p>

            <label className="block text-xs text-zinc-400 mt-6 mb-1.5">Topic (optional)</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Chapter 3, recursion, the Fed"
              className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm outline-none focus:border-[#58A6FF]/50 placeholder:text-zinc-600"
            />

            <label className="block text-xs text-zinc-400 mt-5 mb-1.5">Number of questions</label>
            <div className="flex gap-2">
              {[5, 10, 15].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`h-10 w-14 rounded-xl text-sm border transition-colors ${
                    count === n
                      ? "bg-[#58A6FF]/10 border-[#58A6FF]/40 text-[#58A6FF]"
                      : "border-zinc-800 text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#58A6FF] hover:bg-[#79B8FF] active:scale-95 text-black font-medium text-sm py-3 transition-all disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Generating…" : "Generate quiz"}
            </button>
          </div>
        )}

        {/* --- Question --- */}
        {questions && !finished && (
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
              <span>Question {current + 1} of {questions.length}</span>
              <span>Score {score}</span>
            </div>
            <div className="h-1 rounded-full bg-zinc-800 mb-6 overflow-hidden">
              <div className="h-full bg-[#58A6FF] transition-all duration-300" style={{ width: `${((current + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }} />
            </div>

            <h3 className="text-lg font-medium text-white leading-snug">{questions[current].question}</h3>

            <div className="mt-5 space-y-2.5">
              {questions[current].options.map((opt, i) => {
                const q = questions[current];
                const answered = picked !== null;
                const isCorrect = i === q.correct;
                const isPicked = i === picked;
                const revealed = answered && !checking; // backend has replied
                let style = "border-zinc-800 bg-zinc-900/60 hover:border-[#58A6FF]/40 hover:bg-zinc-900";
                if (revealed && isCorrect) style = "border-emerald-700/60 bg-emerald-950/40 text-emerald-200";
                else if (revealed && isPicked) style = "border-rose-800/60 bg-rose-950/40 text-rose-200";
                else if (checking && isPicked) style = "border-[#58A6FF]/40 bg-zinc-900 text-zinc-100";
                else if (answered) style = "border-zinc-800/60 bg-zinc-900/30 text-zinc-500";
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={answered}
                    className={`w-full flex items-center justify-between gap-3 text-left rounded-xl border px-4 py-3 text-sm transition-colors ${style}`}
                  >
                    <span>{opt}</span>
                    {checking && isPicked && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#58A6FF]" />}
                    {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
                    {revealed && isPicked && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-rose-400" />}
                  </button>
                );
              })}
            </div>

            {picked !== null && !checking && (
              <div className="mt-5">
                {questions[current].explanation && (
                  <p className="text-sm text-zinc-400 leading-relaxed rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-3.5">
                    {questions[current].explanation}
                  </p>
                )}
                <button
                  onClick={next}
                  className="mt-4 rounded-xl bg-[#58A6FF] hover:bg-[#79B8FF] active:scale-95 text-black font-medium text-sm px-5 py-2.5 transition-all"
                >
                  {current + 1 >= questions.length ? "See results" : "Next question"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- Result --- */}
        {questions && finished && (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 text-center">
            <p className="text-5xl font-semibold text-white">{score}<span className="text-zinc-500">/{questions.length}</span></p>
            <p className="text-sm text-zinc-400 mt-2">
              {score / questions.length >= 0.8 ? "Strong grasp of this material." : score / questions.length >= 0.5 ? "Good start. Review the missed topics and try again." : "Try asking the chat to explain the basics, then retake."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={generate} className="inline-flex items-center gap-2 rounded-xl bg-[#58A6FF] hover:bg-[#79B8FF] text-black font-medium text-sm px-5 py-2.5 active:scale-95 transition-all">
                <RotateCcw className="h-4 w-4" /> New quiz
              </button>
              <button onClick={reset} className="rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-sm px-5 py-2.5 transition-colors">
                Change settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}