import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { FileText, FileVideo } from "lucide-react";

/**
 * Upload choice dialog, shown when the header's "+" button is clicked.
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
        className="font-sans sm:max-w-sm border border-zinc-800/80 bg-zinc-900 text-zinc-100 rounded-2xl shadow-2xl p-8 [&>button]:text-zinc-500 [&>button]:hover:text-zinc-200"
      >
        {/* --- PDF option (primary) --- */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-bold text-[#A5B4FC]">Add a material</h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-xs">
            Upload a PDF and Learnify will index it for search and study.
          </p>

          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-300 hover:bg-indigo-200 active:scale-95 text-zinc-900 font-medium text-sm px-5 py-2.5 transition-all duration-200 shadow-lg shadow-purple-900/30"
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
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs text-zinc-500">Or</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* --- Video option (secondary) --- */}
        <div className="flex flex-col items-center text-center">
          <p className="mt-1.5 text-sm text-zinc-400 max-w-xs">
            Upload a video to transcribe and ingest.
          </p>

          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-300 hover:bg-indigo-200 active:scale-95 text-zinc-900 font-medium text-sm px-5 py-2.5 transition-all duration-200 shadow-lg shadow-purple-900/30"
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