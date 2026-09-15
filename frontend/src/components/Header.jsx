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
 *
 * The "+" button no longer opens the OS file picker directly — it calls
 * `onUploadClick`, which the parent uses to open the Upload dialog
 * (PDF vs. Video choice). The header itself stays presentational and
 * knows nothing about files or dialogs.
 */
export default function Header({ uploading = false, onUploadClick }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-500/15 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Learnify
            </span>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-3">
            {/*
              Same Base UI/Radix asChild mismatch as the profile menu fix:
              TooltipTrigger doesn't merge asChild props here, so it was
              rendering its own <button> around this one (invalid nested
              <button>s). Using a native title attribute instead until
              ui/tooltip.jsx is regenerated for Base UI.
            */}
            <button
              type="button"
              onClick={onUploadClick}
              disabled={uploading}
              title="Upload New Material (PDF / Video)"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/40 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Upload new material"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </button>

            {/* Profile Menu — plain button, no tooltip, avoids nested <button> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="User Profile"
                  className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white focus-visible:ring-1 focus-visible:ring-purple-400"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-48 bg-zinc-900 text-zinc-200 border-zinc-800 shadow-2xl rounded-xl"
              >
                {/*
                  Using a plain div instead of DropdownMenuLabel: this
                  project's dropdown-menu.jsx was generated for Radix but
                  @base-ui-components/react is installed, and Base UI's
                  MenuGroupLabel throws unless wrapped in <Menu.Group>.
                  Regenerate the ui/dropdown-menu.jsx file for Base UI to
                  restore DropdownMenuLabel/DropdownMenuGroup safely.
                */}
                <div className="px-2 py-1.5 text-zinc-400 text-xs font-normal">
                  My Account
                </div>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="focus:bg-purple-500/10 focus:text-purple-300 cursor-pointer rounded-lg">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-300 cursor-pointer rounded-lg">
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