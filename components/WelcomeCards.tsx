"use client";

import { motion } from "framer-motion";
import { Globe, Bot, Workflow } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const CARD_ICONS = [Globe, Bot, Workflow] as const;
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
    { id: CARD_KEYS[0], title: w.websiteTitle, label: w.websiteLabel, prompt: w.websitePrompt, icon: CARD_ICONS[0] },
    { id: CARD_KEYS[1], title: w.agentsTitle, label: w.agentsLabel, prompt: w.agentsPrompt, icon: CARD_ICONS[1] },
    { id: CARD_KEYS[2], title: w.automationTitle, label: w.automationLabel, prompt: w.automationPrompt, icon: CARD_ICONS[2] },
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
              "group relative overflow-hidden rounded-xl p-5 sm:p-4 min-h-[5.5rem] text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ring-1 ring-white/[0.05] backdrop-blur-sm",
              "bg-white/[0.02] transition-all duration-300 ease-out",
              "hover:bg-white/[0.05] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_20px_rgba(0,0,0,0.4)] hover:-translate-y-0.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0d]",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            {/* Subtelny radial gradient na hover – rozświetlenie od środka (fiolet/błękit) */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(139,92,246,0.06) 0%, rgba(59,130,246,0.03) 50%, transparent 70%)",
              }}
              aria-hidden
            />
            <Icon
              className="size-5 shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-100"
              aria-hidden
            />
            <span className="mt-2 block text-sm font-medium text-zinc-200 group-hover:text-zinc-100">
              {item.title}
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
