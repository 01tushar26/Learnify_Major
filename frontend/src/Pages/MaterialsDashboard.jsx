import React, { useEffect, useState } from "react";
import axios from "axios";
import MaterialCard from "@/components/MaterialCard";
import Header from "@/components/Header";
import UploadMaterialDialog from "@/components/UploadMaterialDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FolderPlus, Upload } from "lucide-react";

// --- Skeleton Card Component for Loading Grid ---
function MaterialCardSkeleton() {
  return (
    <div className="w-full max-w-sm p-4 rounded-xl border border-purple-500/10 bg-zinc-950/60 backdrop-blur-md space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="h-10 w-10 rounded-lg bg-zinc-800/80" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4 bg-zinc-800/80" />
            <Skeleton className="h-3 w-1/2 bg-zinc-800/60" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full bg-zinc-800/80" />
      </div>

      {/* Content Skeleton */}
      <div className="pt-2 space-y-2">
        <Skeleton className="h-2 w-full rounded bg-zinc-800/60" />
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
        <Skeleton className="h-3 w-28 bg-zinc-800/60" />
        <Skeleton className="h-7 w-7 rounded-lg bg-zinc-800/80" />
      </div>
    </div>
  );
}

export default function MaterialsDashboard() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // --- Fetch Materials from Backend API GET /materials ---
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/materials");
      const data = response.data;

      // Guard against non-array responses (e.g. { materials: [...] },
      // { data: [...] }, an error envelope, or an unexpected shape) so
      // materials.map() never crashes downstream.
      if (Array.isArray(data)) {
        setMaterials(data);
      } else if (Array.isArray(data?.materials)) {
        setMaterials(data.materials);
      } else if (Array.isArray(data?.data)) {
        setMaterials(data.data);
      } else {
        console.warn("Unexpected /materials response shape:", data);
        setMaterials([]);
      }
    } catch (error) {
      console.error("Failed to fetch materials:");
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMaterials([{
    id: "1",
    fileName: "Organic Chemistry - Chapter 7.pdf",
    materialType: "PDF",
    status: "COMPLETED",
    createdAt: "2026-09-10T14:32:00Z",
  },
  {
    id: "2",
    fileName: "Week 3 Lecture Recording.mp4",
    materialType: "VIDEO",
    status: "PROCESSING",
    createdAt: "2026-09-14T09:05:00Z",
    progress: 62,
  },
  {
    id: "3",
    fileName: "Linear Algebra Notes.pdf",
    materialType: "PDF",
    status: "PENDING",
    createdAt: "2026-09-15T08:15:00Z",
  },
  {
    id: "4",
    fileName: "Cell Biology Seminar.mov",
    materialType: "VIDEO",
    status: "FAILED",
    createdAt: "2026-09-13T18:47:00Z",
    errorMessage: "File exceeded max duration (2hr). Trim and re-upload.",
  },
  {
    id: "5",
    fileName: "Thermodynamics Problem Set.pdf",
    materialType: "PDF",
    status: "COMPLETED",
    createdAt: "2026-09-08T11:20:00Z",
  },
  {
    id: "6",
    fileName: "Guest Lecture - Dr. Nair.mp4",
    materialType: "VIDEO",
    status: "COMPLETED",
    createdAt: "2026-09-05T16:00:00Z",
  }])
    fetchMaterials();
  }, []);

  // --- Handle File Upload (PDF / Video) ---
  // Called by UploadMaterialDialog once the person has picked a file for
  // a specific material type — the dialog itself never touches the API.
  const handleFileUpload = async (file, materialType) => {
    const formData = new FormData();
    formData.append("file", file);

    const endpoint = materialType === "VIDEO" ? "/materials/video" : "/materials/pdf";

    try {
      setUploading(true);
      const res = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMaterials((prev) => [res.data, ...prev]);
    } catch (error) {
      console.error("Failed to upload material:", error);
    } finally {
      setUploading(false);
    }
  };

  // --- Handle Delete Material API DELETE /materials/{id} ---
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/materials/${id}`);
      setMaterials((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete material:", error);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-purple-500/30">
        <Header uploading={uploading} onUploadClick={() => setUploadDialogOpen(true)} />

        <UploadMaterialDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onFileSelected={handleFileUpload}
        />

        {/* --- Main Dashboard Content --- */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">
                My Materials
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Access and manage your uploaded PDFs and learning videos.
              </p>
            </div>
          </div>

          {/* Loading Skeleton Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <MaterialCardSkeleton key={i} />
              ))}
            </div>
          ) : materials.length === 0 ? (
            /* Elegant Empty State Message */
            <div className="flex flex-col items-center justify-center min-h-[380px] rounded-2xl border border-dashed border-purple-500/20 bg-zinc-900/20 p-8 text-center backdrop-blur-sm">
              <div className="relative mb-5">
                <div className="absolute -inset-1 rounded-full bg-purple-500/20 blur-md" />
                <div className="relative p-4 rounded-2xl bg-zinc-900 border border-purple-500/30 text-purple-300 shadow-xl">
                  <FolderPlus className="h-8 w-8 text-purple-400" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">
                No materials uploaded yet
              </h3>
              <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">
                Your learning workspace is empty. Drop a PDF document or a video file here to get started!
              </p>

              {/* Same dialog-first flow as the header's + button, for consistency */}
              <button
                type="button"
                onClick={() => setUploadDialogOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-purple-900/30"
              >
                <Upload className="h-4 w-4" />
                <span>Upload First Material</span>
              </button>
            </div>
          ) : (
            /* Materials Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((item) => (
                <MaterialCard
                  key={item.id}
                  id={item.id}
                  fileName={item.fileName}
                  materialType={item.materialType}
                  status={item.status}
                  createdAt={item.createdAt}
                  errorMessage={item.errorMessage}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}