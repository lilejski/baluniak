"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Teksty (copywriting) – edytuj tutaj */
const HERO_COPY = {
  badge: "Product Engineer · AI & SaaS",
  headline: "Automatyzacja komunikacji, która brzmi jak Ty.",
  subtext: "Wybierz agenta, podaj kontekst i wygeneruj profesjonalną treść w sekundy.",
  ctaPrimary: "Wypróbuj AI Duel",
  ctaSecondary: "Jak to działa",
  bulletNoSignup: "Bez rejestracji",
  bulletDual: "DEV + BIZ w jednym",
  bulletLive: "Odpowiedzi na żywo",
} as const;

/** Delikatne animacje wejścia (fade-in) – framer-motion */
const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
} as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
} as const;

export function HeroSection() {
  return (
    <motion.section
      id="hero"
      className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center px-5 py-12 sm:min-h-[75vh] sm:px-6 sm:py-16 md:min-h-[80vh] md:py-20"
      aria-labelledby="hero-heading"
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="mx-auto flex w-full max-w-2xl flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge: czym jest Baluniak */}
        <motion.p
          variants={itemVariants}
          className="mb-4 flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/50 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/90 backdrop-blur-sm sm:text-sm"
        >
          <Sparkles className="size-3.5 text-emerald-400" aria-hidden />
          {HERO_COPY.badge}
        </motion.p>

        <motion.h1
          id="hero-heading"
          variants={itemVariants}
          className={cn(
            "mb-4 text-3xl font-bold leading-tight tracking-tight text-zinc-100 text-balance",
            "sm:text-4xl md:text-5xl"
          )}
        >
          {HERO_COPY.headline}
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mb-8 max-w-lg text-sm leading-relaxed text-muted-foreground"
        >
          {HERO_COPY.subtext}
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button
            asChild
            size="lg"
            className="min-h-12 border border-emerald-500/60 bg-emerald-950/90 px-6 text-base font-medium tracking-wide text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.2)] transition-all hover:border-emerald-400/70 hover:bg-emerald-900/70 hover:shadow-[0_0_24px_rgba(16,185,129,0.25)]"
          >
            <Link href="#ai-duel">
              {HERO_COPY.ctaPrimary}
              <ChevronDown className="ml-2 size-5 shrink-0" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-h-12 border-white/20 bg-white/5 font-medium text-zinc-300 backdrop-blur-sm hover:bg-white/10 hover:text-zinc-100"
          >
            <Link href="#jak-to-dziala">{HERO_COPY.ctaSecondary}</Link>
          </Button>
        </motion.div>

        {/* Krótkie value bullets – tylko na większych ekranach, żeby mobile był czysty */}
        <motion.ul
          variants={itemVariants}
          className="mt-10 hidden gap-6 text-sm text-zinc-500 sm:flex md:gap-8"
          aria-hidden
        >
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
            {HERO_COPY.bulletNoSignup}
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-amber-500" aria-hidden />
            {HERO_COPY.bulletDual}
          </li>
          <li className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
            {HERO_COPY.bulletLive}
          </li>
        </motion.ul>
      </motion.div>
    </motion.section>
  );
}
