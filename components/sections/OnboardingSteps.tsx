"use client";

import { motion } from "framer-motion";
import { MessageSquare, Cpu, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";

const steps: Array<{
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
  accent: "emerald" | "amber";
}> = [
  {
    step: 1,
    title: "Wpisz pytanie",
    description: "Jedno pole—np. „Jak zbudować API w Next.js?” lub „Ile to będzie kosztować?”",
    icon: MessageSquare,
    accent: "emerald",
  },
  {
    step: 2,
    title: "DEV i BIZ odpowiadają",
    description: "Techniczna perspektywa (kod, architektura) i biznesowa (koszty, ryzyko, rekomendacje).",
    icon: Cpu,
    accent: "amber",
  },
  {
    step: 3,
    title: "Porównaj i decyduj",
    description: "Masz obie odpowiedzi obok siebie. Jedna wgląd—dwa punkty widzenia.",
    icon: GitCompare,
    accent: "emerald",
  },
];

export function OnboardingSteps() {
  return (
    <section
      id="jak-to-dziala"
      className="relative z-10 border-t border-white/10 bg-black/20 px-5 py-12 backdrop-blur-sm sm:px-6 sm:py-16 md:py-20"
      aria-labelledby="onboarding-heading"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="onboarding-heading"
          className="mb-10 text-center text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl md:mb-12 md:text-3xl"
        >
          Jak to działa
        </h2>
        <ol className="space-y-6 sm:space-y-8">
          {steps.map(({ step, title, description, icon: Icon, accent }, i) => (
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
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500 sm:text-sm">
                  Krok {step}
                </p>
                <h3 className="mb-2 text-lg font-semibold text-zinc-100 sm:text-xl">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
                  {description}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
