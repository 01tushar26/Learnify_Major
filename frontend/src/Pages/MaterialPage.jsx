import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageSquare, ListChecks, FileText, FileVideo, Loader2, AlertCircle } from "lucide-react";
import axiosInstance from "@/lib/axios-instance";
import ChatPanel from "@/components/ChatPanel";
import QuizPanel from "@/components/QuizPanel";

const TABS = [
  { key: "chat", label: "Chat", hint: "Ask questions", Icon: MessageSquare },
  { key: "quiz", label: "Quiz", hint: "Test yourself", Icon: ListChecks },
];

export default function MaterialPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("chat");
  const [material, setMaterial] = useState(null);

  // Load material info; poll while it is still being processed
  useEffect(() => {
    let timer;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/materials/${id}/status`);
        const m = res.data?.data ?? res.data;
        if (cancelled) return;
        setMaterial(m);
        if (m.status === "QUEUED" || m.status === "PROCESSING") {
          timer = setTimeout(load, 4000);
        }
      } catch {
        if (!cancelled) navigate("/materials", { replace: true });
      }
    };
    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id, navigate]);

  const ready = material?.status === "DONE";
  const TypeIcon = material?.materialType === "VIDEO" ? FileVideo : FileText;

  return (
    <div className="h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-100 font-sans selection:bg-[#58A6FF]/30">
      {/* --- Sidebar (top bar on mobile) --- */}
      <aside className="shrink-0 md:w-64 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-zinc-950 flex md:flex-col">
        <div className="p-4 md:p-5 flex-1 md:flex-none md:border-b border-zinc-800/80 min-w-0">
          <button
            onClick={() => navigate("/materials")}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All materials
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-[#58A6FF]/10 border border-[#58A6FF]/20 shrink-0">
              <TypeIcon className="h-4 w-4 text-[#58A6FF]" />
            </div>
            <p className="text-sm font-medium truncate" title={material?.fileName}>
              {material?.fileName ?? "Loading…"}
            </p>
          </div>
        </div>

        <nav className="flex md:flex-col gap-1 p-2 md:p-3 items-center md:items-stretch">
          {TABS.map(({ key, label, hint, Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 border ${
                  active
                    ? "bg-[#58A6FF]/10 border-[#58A6FF]/30 text-[#58A6FF]"
                    : "border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="hidden md:block text-[11px] opacity-70">{hint}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* --- Content --- */}
      <main className="flex-1 min-w-0 min-h-0 relative">
        {!material ? (
          <Centered><Loader2 className="h-6 w-6 animate-spin text-[#58A6FF]" /></Centered>
        ) : !ready ? (
          <Centered>
            {material.status === "FAILED" ? (
              <>
                <AlertCircle className="h-8 w-8 text-rose-400 mb-3" />
                <h3 className="font-semibold">Processing failed</h3>
                <p className="text-sm text-zinc-400 mt-1 max-w-sm">
                  {material.errorMessage || "This material couldn't be processed. Delete it and upload it again."}
                </p>
              </>
            ) : (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-[#58A6FF] mb-3" />
                <h3 className="font-semibold">Still processing</h3>
                <p className="text-sm text-zinc-400 mt-1 max-w-sm">
                  Chat and quiz unlock once indexing finishes. This page updates automatically.
                </p>
              </>
            )}
          </Centered>
        ) : (
          <>
            {/* Both stay mounted so chat history / quiz progress survive tab switches */}
            <div className={tab === "chat" ? "h-full" : "hidden"}><ChatPanel materialId={Number(id)} /></div>
            <div className={tab === "quiz" ? "h-full" : "hidden"}><QuizPanel materialId={Number(id)} /></div>
          </>
        )}
      </main>
    </div>
  );
}

function Centered({ children }) {
  return <div className="h-full flex flex-col items-center justify-center text-center p-8">{children}</div>;
}