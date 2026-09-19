import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, User, LogOut, Loader2, Sparkles } from "lucide-react";

/**
 * Top navigation header for the Materials dashboard.
 */
export default function Header({ uploading = false, onUploadClick , onLogout }) {

  const handleLogout = () => {
      onLogout();
      return;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Highlighted Brand Logo & Name */}
        <div className="flex items-center gap-3">
          {/* <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 text-[#A5B4FC] shadow-sm shadow-indigo-500/10">
            <Sparkles className="h-6 w-6" />
          </div> */}
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-[#A5B4FC] bg-clip-text text-transparent">
            Learnify
          </span>
        </div>

        {/* Top Bar Actions */}
        <div className="flex items-center gap-3">
          {/* Upload Button */}
          <button
            type="button"
            onClick={onUploadClick}
            disabled={uploading}
            title="Upload New Material (PDF / Video)"
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[#A5B4FC] hover:bg-indigo-500/20 hover:border-indigo-400/40 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Upload new material"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="User Profile"
                className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white focus-visible:ring-1 focus-visible:ring-indigo-400"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 bg-zinc-900 text-zinc-200 border-zinc-800/80 shadow-2xl rounded-xl p-1 font-sans"
            >
              <div className="px-2 py-1.5 text-zinc-400 text-xs font-normal">
                My Account
              </div>
              <DropdownMenuSeparator className="bg-zinc-800/80" />
              <DropdownMenuItem className="focus:bg-indigo-500/10 focus:text-[#A5B4FC] cursor-pointer rounded-lg transition-colors">
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800/80" />
              <DropdownMenuItem 
              onClick={handleLogout}
              className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-300 cursor-pointer rounded-lg transition-colors">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}