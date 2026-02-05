"use client";

import { motion } from "framer-motion";
import { FileText, Code2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const WELCOME_PROMPTS = [
  {
    id: "offer",
    title: "Mail ofertowy",
    prompt: "Napisz maila ofertowego.",
    icon: FileText,
    accent: "emerald" as const,
  },
  {
    id: "linkedin",
    title: "Post na LinkedIn",
    prompt: "Przygotuj post na LinkedIn.",
    icon: Code2,
    accent: "emerald" as const,
  },
  {
    id: "client",
    title: "Odpowiedź do klienta",
    prompt: "Zredaguj odpowiedź do klienta.",
    icon: TrendingUp,
    accent: "amber" as const,
  },
] as const;

type WelcomeCardsProps = {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
};

export function WelcomeCards({ onSelect, disabled, className }: WelcomeCardsProps) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3", className)}
      role="group"
      aria-label="Szybkie akcje – przykładowe prompty"
    >
      {WELCOME_PROMPTS.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(item.prompt)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
            className={cn(
              "flex flex-col items-start gap-2 rounded-xl border px-4 py-3 text-left transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0d]",
              "disabled:pointer-events-none disabled:opacity-50",
              item.accent === "emerald"
                ? "border-emerald-500/30 bg-emerald-950/30 hover:border-emerald-500/50 hover:bg-emerald-950/50"
                : "border-amber-500/30 bg-amber-950/20 hover:border-amber-500/50 hover:bg-amber-950/40"
            )}
          >
            <Icon
              className={cn(
                "size-5 shrink-0",
                item.accent === "emerald" ? "text-emerald-400/80" : "text-amber-400/80"
              )}
              aria-hidden
            />
            <span className="text-sm font-medium text-zinc-200">{item.title}</span>
            <span className="line-clamp-2 text-xs leading-relaxed text-zinc-500">
              {item.prompt}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
