"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Rocket, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

export function HeroSection() {
  const { dict, lang, localeSegment } = useLanguage();
  const h = dict.hero;

  return (
    <motion.section
      id="hero"
      className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-5 py-12 sm:min-h-[75vh] sm:px-6 sm:py-16 md:min-h-[80vh] md:py-20"
      aria-labelledby="hero-heading"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% -20%, rgba(16,185,129,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 80% 50% at 50% 60%, rgba(16,185,129,0.06) 0%, transparent 50%)
          `,
        }}
      />

      <motion.div
        layout
        className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-start text-center md:justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          layout
          variants={itemVariants}
          className="mb-5 flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/50 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300/90 backdrop-blur-sm sm:text-sm"
        >
          <Zap className="size-3.5 text-emerald-400" aria-hidden />
          {h.badge}
        </motion.p>

        <motion.h1
          id="hero-heading"
          layout
          variants={itemVariants}
          className={cn(
            "mb-5 text-2xl font-bold leading-tight tracking-tight text-zinc-100 text-balance",
            "sm:text-3xl md:text-4xl lg:text-5xl"
          )}
        >
          {h.headline}{" "}
          <span className="text-emerald-500">{h.headlineAccent}</span>
          {h.headlineEnd}
        </motion.h1>

        <motion.p
          layout
          variants={itemVariants}
          className="mb-6 max-w-lg text-sm leading-relaxed text-zinc-400 text-balance sm:mb-8 sm:text-base"
        >
          {h.subtext}
        </motion.p>

        {/* Spacer: on mobile pushes CTAs into bottom 30% (thumb zone) */}
        <div className="flex-1 min-h-[15vh] md:hidden" aria-hidden />

        <motion.div
          variants={itemVariants}
          className="mt-auto flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4 md:mt-0"
        >
          <Button
            asChild
            size="lg"
            className="min-h-12 w-full border border-emerald-500/60 bg-emerald-950/90 px-6 text-sm font-semibold tracking-tight text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.2)] transition-all hover:border-emerald-400/70 hover:bg-emerald-900/70 hover:shadow-[0_0_24px_rgba(16,185,129,0.25)] sm:w-auto sm:text-base"
          >
            <Link href={`/${localeSegment}/kreator`}>
              <Rocket className="mr-2 size-5 shrink-0" aria-hidden />
              {h.ctaPrimary}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-h-12 w-full border-white/20 bg-white/5 font-medium text-zinc-300 backdrop-blur-sm hover:bg-white/10 hover:text-zinc-100 sm:w-auto"
          >
            <Link href={`/${localeSegment}/projekty`}>
              {h.ctaSecondary}
              <ArrowRight className="ml-2 size-5 shrink-0" aria-hidden />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
