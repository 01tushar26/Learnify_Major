import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileVideo,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  MessageSquareText,
} from "lucide-react";

const SpotlightCard = ({
  children,
  className = "",
  spotlightColor = "rgba(88, 166, 255, 0.15)",
}) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-xl border border-[#58A6FF]/20 bg-zinc-950/80 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-[#58A6FF]/40 hover:shadow-xl hover:shadow-blue-900/20 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
        style={{
          opacity,
          background: `radial-gradient(500px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

// --- Configurations & Helpers ---
const typeConfig = {
  VIDEO: { Icon: FileVideo, label: "Video Material", color: "text-[#58A6FF]" },
  PDF: { Icon: FileText, label: "PDF Document", color: "text-[#58A6FF]" },
};

const statusConfig = {
  QUEUED: {
    label: "Queued",
    badgeClass: "bg-zinc-800/80 text-zinc-300 border-zinc-700/80",
    Icon: Clock,
    iconClass: "text-zinc-400",
  },
  PROCESSING: {
    label: "Processing",
    badgeClass: "bg-blue-950/50 text-[#58A6FF] border-[#58A6FF]/30",
    Icon: Loader2,
    iconClass: "animate-spin text-[#58A6FF]",
  },
  DONE: {
    label: "Completed",
    badgeClass: "bg-emerald-950/50 text-emerald-300 border-emerald-800/40",
    Icon: CheckCircle2,
    iconClass: "text-emerald-400",
  },
  FAILED: {
    label: "Failed",
    badgeClass: "bg-rose-950/50 text-rose-300 border-rose-800/40",
    Icon: AlertCircle,
    iconClass: "text-rose-400",
  },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- Main MaterialCard Component ---
export function MaterialCard({
  id,
  fileName,
  materialType,
  status,
  createdAt,
  errorMessage,
  onDelete,
}) {
  const navigate = useNavigate();
  const isReady = status === "DONE";
  const { Icon: TypeIcon, label: typeLabel } =
    typeConfig[materialType] ?? typeConfig.PDF;
  const {
    label: statusLabel,
    badgeClass,
    Icon: StatusIcon,
    iconClass,
  } = statusConfig[status] ?? statusConfig.QUEUED;

  return (
    <TooltipProvider>
      <SpotlightCard className="w-full max-w-sm p-4">
        {/* Ensured border-none is explicitly set on Card */}
        <Card className="bg-transparent !border-none !ring-0 shadow-none text-zinc-100">
          <CardHeader className="p-0 space-y-0">
            <div className="flex items-start justify-between gap-3">
              {/* File Icon & Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2.5 rounded-lg bg-[#58A6FF]/10 border border-[#58A6FF]/20 shrink-0 shadow-inner">
                  <TypeIcon className="h-5 w-5 text-[#58A6FF]" />
                </div>
                <div className="min-w-0 flex-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-sm font-medium text-zinc-100 truncate hover:text-[#58A6FF] transition-colors duration-200 cursor-default">
                        {fileName}
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="bg-zinc-900 text-zinc-200 border border-zinc-700 text-xs max-w-xs break-all shadow-xl"
                    >
                      {fileName}
                    </TooltipContent>
                  </Tooltip>
                  <p className="text-xs text-zinc-400 mt-0.5">{typeLabel}</p>
                </div>
              </div>

              {/* Status Badge */}
              <Badge
                variant="outline"
                className={`shrink-0 gap-1.5 px-2.5 py-0.5 text-xs font-medium border backdrop-blur-sm ${badgeClass}`}
              >
                <StatusIcon className={`h-3.5 w-3.5 ${iconClass}`} />
                {statusLabel}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0 mt-4 space-y-3">
            {/* Error Banner */}
            {status === "FAILED" && errorMessage && (
              <div className="text-xs text-rose-300 bg-rose-950/30 border border-rose-800/30 rounded-lg p-2.5 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}

            {/* Footer: Date & Delete Tooltip Action */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60">
              <span className="text-[11px] text-zinc-400">
                {formatDate(createdAt)}
              </span>

              <div className="flex items-center gap-1">
                {/* Open Chat & Quiz */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => isReady && navigate(`/materials/${id}`)}
                      disabled={!isReady}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-[#58A6FF] hover:bg-[#58A6FF]/10 active:scale-95 transition-all duration-200 outline-none focus-visible:ring-1 focus-visible:ring-[#58A6FF] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400"
                      aria-label="Open chat and quiz"
                    >
                      <MessageSquareText className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-zinc-900 text-zinc-200 border border-zinc-700 text-xs shadow-xl"
                  >
                    {isReady ? "Chat & Quiz" : "Available once processing is done"}
                  </TooltipContent>
                </Tooltip>

                {/* Delete */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onDelete?.(id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all duration-200 outline-none focus-visible:ring-1 focus-visible:ring-[#58A6FF]"
                      aria-label="Delete material"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="bg-zinc-900 text-zinc-200 border border-zinc-700 text-xs shadow-xl"
                  >
                    Delete Material
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>
      </SpotlightCard>
    </TooltipProvider>
  );
}

export default MaterialCard;