"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BarChart3, Smartphone, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const { dict, lang } = useLanguage();
  const stages = dict.about.stages;
  const icons = [BarChart3, Smartphone, Zap] as const;
  const heatmapBg = [true, false, false];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative my-24 border-t border-white/10 bg-black/30 px-5 py-16 backdrop-blur-sm sm:px-6 md:py-24"
      aria-labelledby="bridge-heading"
    >
      <div className="mx-auto max-w-5xl">
        <motion.header
          key={lang}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-14 text-center"
        >
          <h2
            id="bridge-heading"
            className="mb-4 text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl"
          >
            {dict.about.bridgeTitle}
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-200 text-balance md:text-xl">
            {dict.about.headline}
          </p>
          <p className="mt-2 text-sm text-zinc-500 md:text-base">
            {dict.about.subheadline}
          </p>
        </motion.header>

        <div className="relative">
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden
          >
            <svg
              className="hidden h-24 w-full md:block"
              viewBox="0 0 300 24"
              fill="none"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 0 12 Q 150 12 300 12"
                stroke="url(#bridge-gradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.4))" }}
              />
              <defs>
                <linearGradient id="bridge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
                  <stop offset="50%" stopColor="rgba(16,185,129,0.7)" />
                  <stop offset="100%" stopColor="rgba(16,185,129,0.3)" />
                </linearGradient>
              </defs>
            </svg>
            <svg
              className="absolute left-6 top-0 bottom-0 w-px md:hidden"
              viewBox="0 0 2 400"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 1 0 L 1 400"
                stroke="url(#bridge-gradient-vertical)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.4))" }}
              />
              <defs>
                <linearGradient id="bridge-gradient-vertical" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
                  <stop offset="50%" stopColor="rgba(16,185,129,0.7)" />
                  <stop offset="100%" stopColor="rgba(16,185,129,0.3)" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
            {stages.map((stage, i) => {
              const Icon = icons[i];
              const heatmap = heatmapBg[i];
              return (
                <motion.div
                  key={stage.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  className={cn(
                    "relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-lg backdrop-blur-sm",
                    "md:flex md:flex-col"
                  )}
                >
                  {heatmap && (
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.07]"
                      aria-hidden
                    >
                      <svg className="h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="none">
                        {[20, 45, 70, 95, 120, 145, 170].map((x, j) => (
                          <rect
                            key={j}
                            x={x}
                            y={80 - (j % 3) * 25}
                            width="18"
                            height={15 + (j % 4) * 12}
                            fill="rgb(16,185,129)"
                            rx="2"
                          />
                        ))}
                        <rect x="20" y="40" width="18" height="35" fill="rgb(16,185,129)" rx="2" opacity="0.8" />
                        <rect x="95" y="30" width="18" height="45" fill="rgb(16,185,129)" rx="2" opacity="0.9" />
                        <rect x="170" y="25" width="18" height="50" fill="rgb(16,185,129)" rx="2" />
                      </svg>
                    </div>
                  )}
                  <div className="relative z-10 flex items-center gap-3 md:flex-col md:items-start md:gap-4">
                    <div
                      className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-400"
                      aria-hidden
                    >
                      <Icon className="size-6" />
                    </div>
                    <div className="md:flex-1 md:pt-0">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400/90">
                        {stage.label}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-zinc-100">
                        {stage.title}
                      </h3>
                    </div>
                  </div>
                  <p className="relative z-10 mt-4 text-sm leading-relaxed text-zinc-400 md:mt-5 md:flex-1">
                    {stage.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
