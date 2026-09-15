import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { FileText, FileVideo } from "lucide-react";

/**
 * Upload choice dialog, shown when the header's "+" button is clicked.
 *
 * Visually modeled on Excalidraw's "Live collaboration" share dialog:
 * a centered dark card, a bold accent-colored title, a muted description,
 * a primary pill-shaped action button, a horizontal "Or" divider, then a
 * second labeled option below it. Here the two options are "Upload PDF"
 * and "Upload Video" instead of "Start session" / "Export to Link".
 *
 * This component owns the two hidden <input type="file"> elements and
 * simply reports the chosen file back to the parent via onFileSelected,
 * so MaterialsDashboard keeps all the actual upload/API logic.
 */
export default function UploadMaterialDialog({ open, onOpenChange, onFileSelected }) {
  const pdfInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handlePickFile = (e, materialType) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    onOpenChange(false);
    onFileSelected(file, materialType);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="sm:max-w-sm border border-purple-500/20 bg-zinc-900 text-zinc-100 rounded-2xl shadow-2xl shadow-purple-950/40 p-8 [&>button]:text-zinc-500 [&>button]:hover:text-zinc-200"
      >
        {/* --- PDF option (primary) --- */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-bold text-purple-400">Add a Material</h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-xs">
            Upload a PDF and Learnify will index it for search and study.
          </p>

          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-medium text-sm px-5 py-2.5 transition-all duration-200 shadow-lg shadow-purple-900/30"
          >
            <FileText className="h-4 w-4" />
            Upload PDF
          </button>
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handlePickFile(e, "PDF")}
          />
        </div>

        {/* --- Divider --- */}
        <div className="my-7 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs text-zinc-500">Or</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* --- Video option (secondary) --- */}
        <div className="flex flex-col items-center text-center">
          
          <p className="mt-1.5 text-sm text-zinc-400 max-w-xs">
            Upload a lecture recording to transcribe and ingest.
          </p>

          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-medium text-sm px-5 py-2.5 transition-all duration-200 shadow-lg shadow-purple-900/30"
          >
            <FileVideo className="h-4 w-4" />
            Upload Video
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handlePickFile(e, "VIDEO")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}