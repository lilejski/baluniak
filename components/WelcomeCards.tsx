"use client";

import { motion } from "framer-motion";
import { Globe, Bot, Workflow } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const CARD_ICONS = [Globe, Bot, Workflow] as const;
const CARD_ACCENTS = ["emerald", "amber", "violet"] as const;
const CARD_KEYS = ["website", "agents", "automation"] as const;

type WelcomeCardsProps = {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
};

export function WelcomeCards({ onSelect, disabled, className }: WelcomeCardsProps) {
  const { dict } = useLanguage();
  const w = dict.welcomeCards;
  const items = [
    { id: CARD_KEYS[0], title: w.websiteTitle, label: w.websiteLabel, prompt: w.websitePrompt, icon: CARD_ICONS[0], accent: CARD_ACCENTS[0] },
    { id: CARD_KEYS[1], title: w.agentsTitle, label: w.agentsLabel, prompt: w.agentsPrompt, icon: CARD_ICONS[1], accent: CARD_ACCENTS[1] },
    { id: CARD_KEYS[2], title: w.automationTitle, label: w.automationLabel, prompt: w.automationPrompt, icon: CARD_ICONS[2], accent: CARD_ACCENTS[2] },
  ];

  return (
    <div
      className={cn("grid grid-cols-1 gap-3 sm:grid-cols-3", className)}
      role="group"
      aria-label={w.ariaLabel}
    >
      {items.map((item, i) => {
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
            <span className="text-xs leading-relaxed text-zinc-500">
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
