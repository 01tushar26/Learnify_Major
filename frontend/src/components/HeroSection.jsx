import React from "react";
import { Sparkles, ArrowRight, Play, FileText, Video } from "lucide-react";

export default function HeroSection({ onGetStartedClick, onSignInClick }) {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-zinc-100 font-sans min-h-[85vh] flex flex-col justify-between border-b border-zinc-800/80">
      
      {/* --- Ambient Background Glow & Tech Texture Overlay --- */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#383842_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* --- Top Navigation Bar --- */}
      <nav className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 text-[#A5B4FC] shadow-sm shadow-indigo-500/10">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-[#A5B4FC] bg-clip-text text-transparent">
            Learnify
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onSignInClick}
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-3 py-2"
          >
            Sign In
          </button>
          <button
            onClick={onGetStartedClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-300 hover:bg-indigo-200 active:scale-95 text-zinc-900 font-medium text-sm px-5 py-2.5 transition-all duration-200 shadow-lg shadow-purple-900/20"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* --- Main Hero Content --- */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col justify-center">
        
        {/* Subtitle / Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-[#A5B4FC] text-xs font-medium w-fit mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI-Powered Study Workspace</span>
        </div>

        {/* Large Editorial Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-[1.15] max-w-4xl">
          Transform your PDFs & video lectures into{" "}
          <span className="bg-gradient-to-r from-[#A5B4FC] via-indigo-200 to-white bg-clip-text text-transparent">
            instant study material.
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl font-normal leading-relaxed">
          Index documents, transcribe recordings, and ask questions directly to your learning materials with surgical precision.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            onClick={onGetStartedClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-300 hover:bg-indigo-200 active:scale-95 text-zinc-900 font-semibold text-base px-6 py-3.5 transition-all duration-200 shadow-xl shadow-indigo-950/50"
          >
            Upload Material Now
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-200 font-medium text-base px-6 py-3.5 transition-all duration-200"
          >
            <Play className="h-4 w-4 text-[#A5B4FC] fill-[#A5B4FC]" />
            Watch Demo
          </button>
        </div>

        {/* Feature Pills */}
        <div className="mt-12 flex items-center gap-6 text-xs text-zinc-500 border-t border-zinc-800/60 pt-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#A5B4FC]" />
            <span>PDF Indexing</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-[#A5B4FC]" />
            <span>Lecture Transcription</span>
          </div>
        </div>
      </div>

      {/* --- Footer Status Bar --- */}
      <div className="relative z-10 border-t border-zinc-800/60 bg-zinc-950/40 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-zinc-500 uppercase tracking-widest">
          <span>SHOWCASE / DEMO</span>
          <span>2026</span>
        </div>
      </div>

    </section>
  );
}