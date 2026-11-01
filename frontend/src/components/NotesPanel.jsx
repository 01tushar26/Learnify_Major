import React from "react";
import { Loader2, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import StudyGate from "@/components/StudyGate";
import { useStudyPart } from "@/hooks/useStudyPack";
import { downloadFile, notesToMarkdown, printNotes, safeName } from "@/lib/download";

export default function NotesPanel({ study, materialId, active }) {
  const { data: notes, error } = useStudyPart(materialId, "notes", study.state === "done", active);

  const handlePdf = () => {
    if (!printNotes(notes)) {
      toast.error("Popup blocked", { description: "Allow popups to save as PDF." });
    }
  };

  return (
    <StudyGate study={study}>
      {error ? (
        <p className="p-8 text-sm text-rose-400 text-center">{error}</p>
      ) : !notes ? (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#58A6FF]" />
        </div>
      ) : (
        <div className="h-full overflow-y-auto px-4 sm:px-8 py-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-white">{notes.title}</h2>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() =>
                  downloadFile(`${safeName(notes.title)}.md`, notesToMarkdown(notes), "text/markdown")
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs px-3 py-1.5 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Markdown
              </button>
              <button
                onClick={handlePdf}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs px-3 py-1.5 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" /> PDF
              </button>
            </div>

            <p className="text-sm text-zinc-400 mt-4 leading-relaxed rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-4">
              {notes.summary}
            </p>

            <div className="mt-8 space-y-7">
              {(notes.sections ?? []).map((s, i) => (
                <section key={i}>
                  <h3 className="text-base font-medium text-[#58A6FF]">{s.heading}</h3>
                  <ul className="mt-2.5 space-y-2">
                    {(s.points ?? []).map((p, j) => (
                      <li key={j} className="flex gap-2.5 text-sm text-zinc-300 leading-relaxed">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </StudyGate>
  );
}