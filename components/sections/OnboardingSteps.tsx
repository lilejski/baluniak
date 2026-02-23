"use client";

import { motion } from "framer-motion";
import { MessageSquare, Cpu, GitCompare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const STEP_ICONS = [MessageSquare, Cpu, GitCompare] as const;
const STEP_ACCENTS: Array<"emerald" | "amber"> = ["emerald", "amber", "emerald"];

export function OnboardingSteps() {
  const { t, mounted } = useLanguage();
  const steps = [
    { step: 1, title: t("howItWorks.step1Title"), description: t("howItWorks.step1Desc") },
    { step: 2, title: t("howItWorks.step2Title"), description: t("howItWorks.step2Desc") },
    { step: 3, title: t("howItWorks.step3Title"), description: t("howItWorks.step3Desc") },
  ];

  if (!mounted) {
    return (
      <section
        id="jak-to-dziala"
        className="relative z-10 border-t border-zinc-800 bg-black/20 px-5 py-12 pb-[max(2rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-6 sm:py-16 md:py-20 md:pb-20"
        aria-labelledby="onboarding-heading"
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 h-8 w-48 animate-pulse rounded bg-zinc-700/50 sm:mb-12" aria-hidden />
          <ol className="space-y-6 sm:space-y-8">
            {[1, 2, 3].map((i) => (
              <li key={i} className="flex gap-4 sm:gap-5">
                <div className="size-11 shrink-0 rounded-xl border border-zinc-600/50 bg-zinc-800/30 sm:size-12" />
                <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-700/50" />
                  <div className="h-4 w-full animate-pulse rounded bg-zinc-700/30" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section
      id="jak-to-dziala"
      className="relative z-10 border-t border-zinc-800 bg-black/20 px-5 py-12 pb-[max(2rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-6 sm:py-16 md:py-20 md:pb-20"
      aria-labelledby="onboarding-heading"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="onboarding-heading"
          className="mb-10 text-center text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl md:mb-12 md:text-3xl"
        >
          {t("howItWorks.title")}
        </h2>
        <ol className="space-y-6 sm:space-y-8">
          {steps.map(({ step, title, description }, i) => {
            const Icon = STEP_ICONS[i];
            const accent = STEP_ACCENTS[i];
            return (
              <motion.li
                key={step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="flex gap-4 sm:gap-5"
              >
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl border sm:size-12",
                    accent === "emerald"
                      ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-400"
                      : "border-amber-500/40 bg-amber-950/30 text-amber-400"
                  )}
                  aria-hidden
                >
                  <Icon className="size-5 sm:size-6" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="mb-2 text-lg font-semibold text-zinc-100 sm:text-xl">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
                    {description}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
