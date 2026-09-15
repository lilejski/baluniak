"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Rocket, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const HeroCube = dynamic(
  () => import("@/components/HeroCube").then((m) => ({ default: m.HeroCube })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full w-full items-center justify-center border-none bg-transparent"
        aria-hidden
      >
        <div className="h-24 w-24 animate-pulse rounded-xl border border-emerald-500/20 bg-zinc-900/40" />
      </div>
    ),
  }
);

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
  const { dict, localeSegment } = useLanguage();
  const h = dict.hero;

  return (
    <motion.section
      id="hero"
      className="relative z-0 flex min-h-[70vh] w-full flex-col overflow-hidden bg-zinc-950 px-5 pt-24 pb-12 sm:min-h-[75vh] sm:px-6 sm:pt-24 sm:pb-16 md:min-h-[80vh] md:pt-28 md:pb-20"
      aria-labelledby="hero-heading"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Tło: siatka + gradient */}
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

      {/* Grid: desktop = 2 kolumny (kostka lewo, tekst prawo); mobile = tekst góra (order-1), kostka poniżej (order-2) z ograniczoną wysokością */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Lewa kolumna (desktop): Kostka 3D. Na mobile pod tekstem, max 40vh żeby nie rozpychała. */}
        <motion.div
          layout
          className="relative order-2 flex h-[40vh] min-h-[240px] w-full max-h-[380px] items-center justify-center bg-transparent md:max-h-none lg:order-1 lg:h-[600px]"
          style={{ background: "transparent" }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Premium Glow – promieniowa poświata pod kostką */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 blur-2xl pointer-events-none"
            style={{
              background: "radial-gradient(circle at center, rgba(16,185,129,0.15) 0%, transparent 50%, transparent 100%)",
            }}
          />
          <motion.div
            variants={itemVariants}
            className="relative z-0 h-full w-full cursor-grab border-none bg-transparent active:cursor-grabbing"
            style={{ background: "transparent" }}
          >
            <HeroCube />
          </motion.div>
        </motion.div>

        {/* Prawa kolumna (desktop): Tekst i CTA – na mobile na górze (order-1) */}
        <motion.div
          layout
          className="order-1 flex flex-col items-center text-center lg:order-2 lg:items-start lg:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            layout
            variants={itemVariants}
            className="mb-5 flex w-fit items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/50 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300/90 backdrop-blur-sm sm:text-sm"
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
            {h.headline}
            {h.headlineAccent ? (
              <>
                {" "}
                <span className="text-emerald-500">{h.headlineAccent}</span>
                {h.headlineEnd}
              </>
            ) : null}
          </motion.h1>

          <motion.p
            layout
            variants={itemVariants}
            className="mb-6 max-w-lg text-sm leading-relaxed text-zinc-400 text-balance sm:mb-8 sm:text-base"
          >
            {h.subtext}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4"
          >
            <Button
              asChild
              className="w-full rounded-lg border-none bg-gradient-to-r from-emerald-600 to-emerald-400 px-8 py-6 font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] sm:w-auto"
            >
              <Link href={`/${localeSegment}/kreator`}>
                <Rocket className="mr-2 size-5 shrink-0" aria-hidden />
                {h.ctaPrimary}
              </Link>
            </Button>
            <Button
              asChild
              className="w-full rounded-lg border border-white/10 bg-white/5 px-8 py-6 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/20 hover:bg-white/10 sm:w-auto"
            >
              <Link href={`/${localeSegment}#projekty`}>
                {h.ctaSecondary}
                <ArrowRight className="ml-2 size-5 shrink-0" aria-hidden />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
