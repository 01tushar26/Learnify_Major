import React, { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axios-instance";
import { toast } from "sonner";

const SUGGESTIONS = ["Summarize this material", "What are the key concepts?", "Explain the hardest part simply"];

export default function ChatPanel({ materialId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || sending) return;

    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setSending(true);

    try {
      // Body matches ChatRequestDTO { question: String, materialId: Long }
      const res = await axiosInstance.post("/chat", { question, materialId });
      // Response matches ChatResponseDTO { answer: String }
      const answer = res.data?.answer ?? res.data?.data?.answer ?? "No answer returned.";
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
    } catch (e) {
      toast.error("Couldn't get an answer", {
        description: e?.response?.data?.error?.message ?? e?.response?.data?.message ?? e.message,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="pt-16 text-center">
              <h2 className="text-xl font-semibold text-white">Ask anything about this material</h2>
              <p className="text-sm text-zinc-400 mt-1">Answers are grounded in what you uploaded.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-[#58A6FF]/20 bg-[#58A6FF]/10 text-[#58A6FF] text-xs px-3.5 py-1.5 hover:bg-[#58A6FF]/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#58A6FF] text-black rounded-br-sm"
                    : "bg-zinc-900 border border-zinc-800/80 text-zinc-200 rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-zinc-900 border border-zinc-800/80 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-[#58A6FF]" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-zinc-800/80 bg-zinc-950 px-4 sm:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-end gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 focus-within:border-[#58A6FF]/50 transition-colors">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask a question…"
            className="flex-1 resize-none bg-transparent outline-none text-sm text-zinc-100 placeholder:text-zinc-500 px-2 py-2 max-h-40"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || sending}
            aria-label="Send"
            className="h-9 w-9 rounded-xl bg-[#58A6FF] text-black flex items-center justify-center hover:bg-[#79B8FF] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}