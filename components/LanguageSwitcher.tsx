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

const flagSize = "w-5 h-3.5";

export function LanguageSwitcher({ inSheet = false }: { inSheet?: boolean }) {
  const { lang, setLang } = useLanguage();

  const buttonBase =
    "flex min-h-11 min-w-11 items-center justify-center rounded-sm transition-colors xl:min-h-9 xl:min-w-9";

  return (
    <div
      className={cn("flex items-center gap-0.5 rounded-md border border-border p-0.5", inSheet && "mt-4 w-fit")}
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
          buttonBase,
          lang === "PL" ? "bg-surface-2" : "opacity-55 hover:bg-surface-2 hover:opacity-100"
        )}
        aria-label="Polski"
        aria-pressed={lang === "PL"}
      >
        <FlagPL className={cn("rounded-[2px]", flagSize)} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setLang("EN");
        }}
        className={cn(
          buttonBase,
          lang === "EN" ? "bg-surface-2" : "opacity-55 hover:bg-surface-2 hover:opacity-100"
        )}
        aria-label="English"
        aria-pressed={lang === "EN"}
      >
        <FlagUK className={cn("rounded-[2px]", flagSize)} />
      </button>
    </div>
  );
}
