import React, { useState } from "react";
import { Sparkles, ArrowRight, Play, FileText, Video } from "lucide-react";
import AuthDialog from "@/components/AuthDialog";
import dashboardImage from "@/assets/dashboard.png";


// Reusable animated link component with a smooth 3D text flip effect on hover
function FlippingNavLink({ href, children, onClick, textColor = "text-zinc-300", hoverColor = "text-white" }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`group relative inline-block h-5 overflow-hidden text-sm font-medium transition-colors duration-200 ${textColor}`}
    >
      <div className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-1/2">
        <span className="flex h-5 items-center">{children}</span>
        <span className={`flex h-5 items-center font-semibold ${hoverColor}`}>
          {children}
        </span>
      </div>
    </a>
  );
}

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30 py-6 px-4">

      {/* --- Ambient Background Glow & Dot Grid Overlay --- */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#383842_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl pointer-events-none" />

      
      {/* 1. FLOATING CENTERED NAVBAR */}
      <nav className="max-w-4xl mx-auto h-14 rounded-full border border-zinc-800 bg-[#191919] px-4 flex items-center justify-between sticky top-6 z-50 shadow-2xl shadow-black/80">
        
        {/* Left Circle Logo Badge */}
        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-[#A5B4FC] bg-clip-text text-transparent">
            Learnify
          </span>
        </div>

        {/* Right Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs sm:text-sm px-5 py-2.5 transition-all active:scale-95 shadow-md flex items-center justify-center"
          >
            <FlippingNavLink 
              textColor="text-zinc-950" 
              hoverColor="text-zinc-950"
            >
              Sign Up
            </FlippingNavLink>
          </button>
        </div>
      </nav>

      {/* --- Main Hero Section --- */}
      <main className="max-w-5xl mx-auto text-center pt-20 pb-16 px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-[#A5B4FC] text-xs font-medium w-fit mb-6 mx-auto">
          <span>Stop rewatching. Start asking</span>
        </div>

        {/* Headline */}
        <h1 className="font-brighta text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-[1.15] max-w-5xl mx-auto">
          Boring tutorials ? Turn it into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#A5B4FC] via-indigo-200 to-white bg-clip-text text-transparent">
            a personalized tutor.
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl font-normal leading-relaxed mx-auto text-center">
          No more pausing, rewinding, re-reading. Ask it questions, generate instant quizzes — Learnify handles the rest, grounded in exactly what you uploaded.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-wrap items-center gap-4 justify-center">
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-300 hover:bg-indigo-200 active:scale-95 text-zinc-900 font-semibold text-base px-6 py-3.5 transition-all duration-200 shadow-xl shadow-indigo-950/50"
          >
            Get Started Free
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
    <br/><br/>
    <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-indigo-500/30 via-indigo-300/20  blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          
         <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 rounded-t-xl border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              
              <div className="w-12" />
            </div>

            {/* Dashboard Image Shell */}
            <div className="relative overflow-hidden rounded-b-xl bg-zinc-900">
              <img
                src={dashboardImage}
                alt="Learnify Dashboard Preview"
                className="w-full h-auto object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Subtle Overlay Reflection / Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
            

        {/* Feature Pills */}
        <div className="mt-12 flex items-center justify-center gap-6 text-xs text-zinc-500 border-t border-zinc-800/60 pt-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#A5B4FC]" />
            <span>PDF Indexing</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-[#A5B4FC]" />
            <span>Video Transcriptions</span>
          </div>
        </div>

      
           
    
        

      </main>

      {/* --- Footer / Showcase Strip --- */}
      <footer className="relative z-10 border-t border-zinc-800/60 bg-zinc-950/40 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-zinc-500 uppercase tracking-widest">
          <span>SHOWCASE / DEMO</span>
          <span>2026</span>
        </div>
      </footer>

      {/* --- Auth Dialog Modal --- */}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}