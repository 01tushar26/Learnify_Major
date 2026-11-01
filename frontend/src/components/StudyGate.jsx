import React from "react";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";

export default function StudyGate({ study, children }) {
  const { state, error, generate } = study;

  if (state === "done") return children;

  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      {state === "loading" && <Loader2 className="h-6 w-6 animate-spin text-[#58A6FF]" />}

      {state === "none" && (
        <>
          <div className="p-3 rounded-2xl bg-[#58A6FF]/10 border border-[#58A6FF]/20 mb-4">
            <Sparkles className="h-7 w-7 text-[#58A6FF]" />
          </div>
          <h3 className="font-semibold">Generate notes and flashcards</h3>
          <p className="text-sm text-zinc-400 mt-1 max-w-sm">
            Created once from the whole material, then saved. Notes and Flashcards share the same result.
          </p>
          <button
            onClick={generate}
            className="mt-6 rounded-xl bg-[#58A6FF] hover:bg-[#79B8FF] active:scale-95 text-black font-medium text-sm px-5 py-2.5 transition-all"
          >
            Generate
          </button>
        </>
      )}

      {state === "processing" && (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-[#58A6FF] mb-3" />
          <h3 className="font-semibold">Generating…</h3>
          <p className="text-sm text-zinc-400 mt-1 max-w-sm">
            Long materials can take a few minutes. You can use Chat and Quiz meanwhile.
          </p>
        </>
      )}

      {state === "failed" && (
        <>
          <AlertCircle className="h-8 w-8 text-rose-400 mb-3" />
          <h3 className="font-semibold">Couldn't generate</h3>
          <p className="text-sm text-zinc-400 mt-1 max-w-sm">{error}</p>
          <button
            onClick={generate}
            className="mt-6 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-sm px-5 py-2.5 transition-colors"
          >
            Try again
          </button>
        </>
      )}
    </div>
  );
}