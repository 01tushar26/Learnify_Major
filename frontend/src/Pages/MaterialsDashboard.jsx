import React, { useEffect, useState } from "react";
import axios from "axios";
import MaterialCard from "@/components/MaterialCard";
import Header from "@/components/Header";
import UploadMaterialDialog from "@/components/UploadMaterialDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

import { toast, Toaster } from "sonner";
import { FolderPlus, Upload } from "lucide-react";

// --- Skeleton Card Component for Loading Grid ---
function MaterialCardSkeleton() {
  return (
    <div className="w-full max-w-sm p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md space-y-4">
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

// --- Extract a human-readable message from a backend error response ---
function getErrorMessage(error) {
  const data = error?.response?.data;

  if (data) {
    if (data.error?.message) return data.error.message;
    if (typeof data.error === "string") return data.error;
  }

  if (error?.message) return error.message;

  return "Something went wrong. Please try again.";
}

export default function MaterialsDashboard() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const  navigate = useNavigate();

  // --- Fetch Materials from Backend API GET /materials ---
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/materials");
      const data = response.data;

      const payload = data?.data ?? data;

      if (Array.isArray(payload)) {
        setMaterials(payload);
      } else if (Array.isArray(payload?.materials)) {
        setMaterials(payload.materials);
      } else {
        toast.error("Couldn't load materials", {
          description: "The server is down.",
        });
        setMaterials([]);
      }
    } catch (error) {
      toast.error("Failed to load materials", {
        description: getErrorMessage(error),
      });
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
  try {
    await axios.post("/auth/logout");
  } catch (error) {
    toast.error("Failed to log out", {
      description: getErrorMessage(error),
    });
    return ;
  }
  localStorage.removeItem("accessToken");
  toast.success("Logged out successfully");
  navigate("/");
  
};

  useEffect(() => {
    setMaterials([]);
    fetchMaterials();
  }, []);

  // --- Handle File Upload (PDF / Video) ---
  const handleFileUpload = async (file, materialType) => {
    const formData = new FormData();
    formData.append("file", file);

    const endpoint = materialType === "VIDEO" ? "/materials/video" : "/materials/pdf";

    try {
      setUploading(true);
      const res = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const created = res.data?.data ?? res.data;
      setMaterials((prev) => [created, ...prev]);

      toast.success("Upload complete", {
        description: `${file.name} was uploaded successfully !!`,
      });
    } catch (error) {
      toast.error("Upload failed", {
        description: getErrorMessage(error),
      });
    } finally {
      setUploading(false);
    }
  };

  // --- Handle Delete Material API DELETE /materials/{id} ---
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/materials/${id}`);
      setMaterials((prev) => prev.filter((item) => item.id !== id));
      toast.success("Material deleted successfully");
    } catch (error) {
      toast.error("Failed to delete material", {
        description: getErrorMessage(error),
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30">
        <Header uploading={uploading} onUploadClick={() => setUploadDialogOpen(true)} onLogout={handleLogout}/>

        <UploadMaterialDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onFileSelected={handleFileUpload}
        />

        {/* --- Main Dashboard Content --- */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">
                My Materials
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Access and manage your uploaded PDFs and learning videos.
              </p>
            </div>
          </div> */}

          {/* Loading Skeleton Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <MaterialCardSkeleton key={i} />
              ))}
            </div>
          ) : materials.length === 0 ? (
            /* Elegant Empty State Message */
            <div className="flex flex-col items-center justify-center min-h-[380px] rounded-2xl  bg-zinc-900/40 p-8 text-center backdrop-blur-sm">
              <div className="relative mb-5">
                <div className="absolute -inset-1 rounded-full bg-indigo-500/10 blur-md" />
                <div className="relative p-4 rounded-2xl bg-zinc-900 border border-zinc-800/80 text-[#A5B4FC] shadow-xl">
                  <FolderPlus className="h-8 w-8 text-[#A5B4FC]" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-1">
                No materials uploaded yet
              </h3>
              <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">
                Your learning workspace is empty. Drop a PDF document or a video file here to get started!
              </p>

              <button
                type="button"
                onClick={() => setUploadDialogOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-300 hover:bg-indigo-200 active:scale-95 text-zinc-900 font-medium text-sm transition-all duration-200 shadow-lg "
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

      <Toaster theme="dark" richColors position="top-right" />
    </TooltipProvider>
  );
}