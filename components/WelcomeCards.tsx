"use client";

import { motion } from "framer-motion";
import { Globe, Bot, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

export const WELCOME_PROMPTS = [
  {
    id: "website",
    title: "Strona internetowa tego typu",
    prompt:
      "Wyjaśnij, dlaczego strona w Next.js to dobry wybór. Opisz plusy Next.js, podejście mobile-first i krótko polecane praktyki dla takiej strony.",
    icon: Globe,
    accent: "emerald" as const,
  },
  {
    id: "agents",
    title: "Implementacja agentów AI na stronie",
    prompt:
      "Wyjaśnij, po co wdrażać na stronie wirtualnych agentów AI. Napisz, że nie trzeba oddzwaniać ani samemu przedstawiać oferty – zrobią to za Ciebie wirtualni agenci. Właśnie z takimi agentami użytkownik teraz rozmawia.",
    icon: Bot,
    accent: "amber" as const,
  },
  {
    id: "automation",
    title: "Automatyzacje",
    prompt:
      "Opisz korzyści z automatyzacji z użyciem AI. Wyjaśnij, że ręczne obrabianie zdjęć, pisanie tekstów i przepisywanie dokumentów papierowych to przeszłość – workflow AI wykonuje te czynności za ludzi.",
    icon: Workflow,
    accent: "violet" as const,
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
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0d]",
              "disabled:pointer-events-none disabled:opacity-50",
              item.accent === "emerald" &&
                "border-emerald-500/30 bg-emerald-950/30 hover:border-emerald-500/50 hover:bg-emerald-950/50 focus-visible:ring-emerald-500/50",
              item.accent === "amber" &&
                "border-amber-500/30 bg-amber-950/20 hover:border-amber-500/50 hover:bg-amber-950/40 focus-visible:ring-amber-500/50",
              item.accent === "violet" &&
                "border-violet-500/30 bg-violet-950/20 hover:border-violet-500/50 hover:bg-violet-950/40 focus-visible:ring-violet-500/50"
            )}
          >
            <Icon
              className={cn(
                "size-5 shrink-0",
                item.accent === "emerald" && "text-emerald-400/80",
                item.accent === "amber" && "text-amber-400/80",
                item.accent === "violet" && "text-violet-400/80"
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
