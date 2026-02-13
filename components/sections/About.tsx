"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { HardHat, Building2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const BRIDGE_COPY = {
  headline:
    "The Bridge: Dlaczego Twoim produktem powinien zająć się inżynier z doświadczeniem w biznesie?",
  subheadline:
    "Nie urodziłem się w cieplarnianym biurze. Moją przewagą jest droga, którą przeszedłem.",
  stages: [
    {
      id: "grit",
      label: "Fundamenty",
      title: "Budowa",
      body: "Praca u podstaw. Budowa nauczyła mnie, że efekt musi być namacalny, a opóźnienia kosztują. Tu zrodził się mój pragmatyzm.",
      icon: HardHat,
    },
    {
      id: "process",
      label: "Skala",
      title: "Amazon / HR",
      body: "Rozumienie systemów. Praca w Amazonie i HR pokazała mi, jak działają wielkie organizacje i czego naprawdę potrzebują ludzie. Kod to tylko narzędzie do rozwiązywania ich problemów.",
      icon: Building2,
    },
    {
      id: "speed",
      label: "Dźwignia",
      title: "Product Engineer",
      body: "AI & Prototypowanie. Łączę etykę pracy z budowy z procesowym myśleniem korporacyjnym, używając AI do budowania produktów w rekordowym tempie.",
      icon: Sparkles,
    },
  ],
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative my-24 border-t border-white/10 bg-black/30 px-5 py-16 backdrop-blur-sm sm:px-6 md:py-24"
      aria-labelledby="bridge-heading"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-14 text-center">
          <h2
            id="bridge-heading"
            className="mb-4 text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl"
          >
            The Bridge
          </h2>
          <p className="mx-auto mb-3 max-w-2xl text-lg leading-relaxed text-zinc-200 text-balance md:text-xl">
            {BRIDGE_COPY.headline}
          </p>
          <p className="text-sm text-zinc-500 md:text-base">
            {BRIDGE_COPY.subheadline}
          </p>
        </header>

        {/* Cards + Bridge connector */}
        <div className="relative">
          {/* SVG Bridge: horizontal on desktop, vertical on mobile */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden
          >
            {/* Desktop: horizontal line through center */}
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
            {/* Mobile: vertical line on left */}
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

          {/* 3-col grid desktop, single col mobile (timeline) */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
            {BRIDGE_COPY.stages.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  className={cn(
                    "relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-lg backdrop-blur-sm",
                    "md:flex md:flex-col"
                  )}
                >
                  <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-4">
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
                  <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:mt-5 md:flex-1">
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
