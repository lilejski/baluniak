"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useState } from "react";
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

/** Lightweight 3D floating card – CSS 3D + optional mouse parallax. No heavy libs for PageSpeed. */
function Hero3DVisual() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const transformRef = useRef({ rotateX: 0, rotateY: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    const throttleMs = 50;
    let last = 0;

    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - last < throttleMs) return;
      last = now;
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const update = () => {
      rafRef.current = requestAnimationFrame(update);
      const { x, y } = mouseRef.current;
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (x - cx) / rect.width;
      const dy = (y - cy) / rect.height;
      const maxTilt = 12;
      const targetX = dy * maxTilt;
      const targetY = -dx * maxTilt;
      const t = 0.08;
      transformRef.current.rotateX += (targetX - transformRef.current.rotateX) * t;
      transformRef.current.rotateY += (targetY - transformRef.current.rotateY) * t;
      const { rotateX, rotateY } = transformRef.current;
      wrap.style.setProperty("--hero-3d-x", `${rotateX}deg`);
      wrap.style.setProperty("--hero-3d-y", `${rotateY}deg`);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [mounted]);

  return (
    <div
      ref={wrapRef}
      className="relative flex min-h-[200px] w-full items-center justify-center md:min-h-[320px]"
      style={{
        transform: "perspective(800px)",
        // CSS vars set by JS for parallax
        ["--hero-3d-x" as string]: "0deg",
        ["--hero-3d-y" as string]: "0deg",
      }}
    >
      {/* Outer glow */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 60%)",
          transform: "scale(1.2)",
        }}
      />
      {/* 3D card – pure CSS transform; wrapper has float animation in globals */}
      <div className="hero-3d-float-wrapper">
        <div
          className="hero-3d-card relative h-[180px] w-[280px] rounded-2xl border border-zinc-700/80 bg-zinc-900/60 shadow-2xl backdrop-blur-md md:h-[220px] md:w-[320px]"
          style={{
          transformStyle: "preserve-3d",
          transform:
            "rotateX(var(--hero-3d-x, 0deg)) rotateY(var(--hero-3d-y, 0deg)) translateZ(0)",
          boxShadow:
            "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), 0 0 40px -10px rgba(16,185,129,0.2)",
        }}
      >
        {/* Inner gradient overlay */}
        <div
          className="absolute inset-0 rounded-2xl opacity-60"
          style={{
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, transparent 50%, rgba(16,185,129,0.06) 100%)",
          }}
        />
        {/* Fake UI lines – decorative only */}
        <div className="absolute left-5 top-5 right-5 flex gap-2">
          <span className="h-2 w-12 rounded-full bg-zinc-600/80" />
          <span className="h-2 w-8 rounded-full bg-zinc-600/60" />
          <span className="h-2 w-6 rounded-full bg-zinc-600/40" />
        </div>
        <div className="absolute bottom-5 left-5 right-5 space-y-2">
          <div className="h-2 w-full rounded-full bg-zinc-700/50" />
          <div className="h-2 w-3/4 rounded-full bg-zinc-700/30" />
        </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const { dict, localeSegment } = useLanguage();
  const h = dict.hero;

  return (
    <motion.section
      id="hero"
      className="relative z-0 flex min-h-[70vh] w-full flex-col overflow-hidden bg-zinc-950 px-5 py-12 sm:min-h-[75vh] sm:px-6 sm:py-16 md:min-h-[80vh] md:py-20"
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

      {/* Grid: desktop = 2 kolumny (kostka lewo, tekst prawo); mobile = tekst góra, kostka dół */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Lewa kolumna (desktop): Kostka 3D – kontener bez jasnego tła, tylko bg-transparent */}
        <motion.div
          layout
          className="relative order-2 flex h-[400px] w-full items-center justify-center bg-transparent lg:order-1 lg:h-[600px]"
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
