import React from "react";
import { Link } from "react-router-dom";

// External sites use `href` and open in a new tab. Internal pages would use `to` (react-router).
const LINKS = [
  { label: "Github", href: "https://github.com/your-username" },
  { label: "Twitter", href: "https://twitter.com/your-handle" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/your-profile" },
];

const LINK_CLASS =
  "text-sm text-zinc-400 transition-colors duration-200 hover:text-[#58A6FF]";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 w-full border-t border-zinc-800/60 bg-zinc-950/40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left side: brand & tagline */}
        <div className="flex flex-col items-center md:items-start gap-0.5">
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-[#58A6FF] bg-clip-text text-transparent">
            Learnify
          </span>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
            © {currentYear} Learnify. Built for curious learners.
          </p>
        </div>

        {/* Right side: links */}
        <nav className="flex items-center gap-6">
          {LINKS.map(({ label, to, href }) =>
            href ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK_CLASS}
              >
                {label}
              </a>
            ) : (
              <Link key={label} to={to} className={LINK_CLASS}>
                {label}
              </Link>
            )
          )}
        </nav>
      </div>
    </footer>
  );
}