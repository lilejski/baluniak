"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

function FlagPL({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className={className}
      aria-hidden
    >
      <rect width="24" height="8" fill="#fff" />
      <rect y="8" width="24" height="8" fill="#dc143c" />
    </svg>
  );
}

/** Minimal UK flag (Union Jack) */
function FlagUK({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden>
      <rect width="60" height="30" fill="#012169" />
      <path stroke="#fff" strokeWidth="4" fill="none" d="M0 0L60 30M60 0L0 30" />
      <path stroke="#c8102e" strokeWidth="2" fill="none" d="M0 0L60 30M60 0L0 30" />
      <path stroke="#fff" strokeWidth="8" fill="none" d="M30 0V30M0 15h60" />
      <path stroke="#c8102e" strokeWidth="4" fill="none" d="M30 0V30M0 15h60" />
    </svg>
  );
}

const flagSize = "w-6 h-4"; // small, clean

export function LanguageSwitcher({ inSheet = false }: { inSheet?: boolean }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={cn("flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-0.5", inSheet && "mt-4")}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setLang("PL");
        }}
        className={cn(
          "flex min-h-12 min-w-12 items-center justify-center rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 md:min-h-9 md:min-w-9",
          lang === "PL"
            ? "bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            : "opacity-70 hover:opacity-100 hover:bg-white/10"
        )}
        aria-label="Polski"
        aria-pressed={lang === "PL"}
      >
        <FlagPL className={cn("rounded-sm", flagSize)} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setLang("EN");
        }}
        className={cn(
          "flex min-h-12 min-w-12 items-center justify-center rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 md:min-h-9 md:min-w-9",
          lang === "EN"
            ? "bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            : "opacity-70 hover:opacity-100 hover:bg-white/10"
        )}
        aria-label="English"
        aria-pressed={lang === "EN"}
      >
        <FlagUK className={cn("rounded-sm", flagSize)} />
      </button>
    </div>
  );
}
