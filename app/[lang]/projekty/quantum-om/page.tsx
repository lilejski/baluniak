"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowLeft, Cpu, Bot, Rocket, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

export default function QuantumOmCaseStudyPage() {
  const { dict, localeSegment } = useLanguage();
  const q = dict.quantumOmPage;
  const f = dict.fotarobotaPage; // fallback for common items

  const heroRef = useRef<HTMLElement>(null);
  const archRef = useRef<HTMLElement>(null);
  const innovationsRef = useRef<HTMLElement>(null);
  const legalRef = useRef<HTMLElement>(null);
  
  const archInView = useInView(archRef, { once: true, amount: 0.15 });
  const innovationsInView = useInView(innovationsRef, { once: true, amount: 0.15 });
  const legalInView = useInView(legalRef, { once: true, amount: 0.15 });

  return (
    <div className="min-h-screen bg-zinc-950 pb-[max(2rem,env(safe-area-inset-bottom))] text-zinc-100">
      <div className="mx-auto max-w-4xl px-5 py-8 pb-16 sm:px-6 sm:py-10 sm:pb-10">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-zinc-200">
            <Link href={`/${localeSegment}/projekty`} className="inline-flex items-center gap-2">
              <ArrowLeft className="size-4" />
              {f.backToProjectsHome}
            </Link>
          </Button>
        </motion.div>

        <motion.header
          ref={heroRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 sm:mb-16"
        >
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-100 text-balance sm:text-4xl md:text-5xl">
            {q.heroTitle}
          </h1>
          <p className="mb-2 text-lg text-emerald-400 text-balance sm:text-xl font-medium">
            {q.heroSubline}
          </p>
          <p className="mb-6 text-sm text-zinc-400">
            {q.heroSubtext}
          </p>
          
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-violet-300">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-violet-500"></span>
            </span>
            {q.statusLabel} {q.statusValue}
          </div>
        </motion.header>

        <motion.section
          ref={archRef}
          initial="hidden"
          animate={archInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-6 flex items-center gap-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            <Rocket className="size-8 text-emerald-500" />
            {q.architekturaTitle}
          </motion.h2>
          <div className="space-y-4">
            <motion.p variants={itemVariants} className="text-sm leading-relaxed text-zinc-400 sm:text-base">
              {q.architekturaP1}
            </motion.p>
            <motion.p variants={itemVariants} className="text-sm leading-relaxed text-zinc-400 sm:text-base">
              {q.architekturaP2}
            </motion.p>
            <motion.p variants={itemVariants} className="text-sm leading-relaxed text-zinc-400 sm:text-base">
              {q.architekturaP3}
            </motion.p>
          </div>
        </motion.section>

        <motion.section
          ref={innovationsRef}
          initial="hidden"
          animate={innovationsInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-8 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {q.innovationsTitle}
          </motion.h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <motion.div variants={itemVariants} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <Bot className="mb-4 size-8 text-violet-400" />
              <h3 className="mb-2 font-medium text-emerald-300">{q.innovation1Title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{q.innovation1Desc}</p>
            </motion.div>
            <motion.div variants={itemVariants} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <Shield className="mb-4 size-8 text-emerald-400" />
              <h3 className="mb-2 font-medium text-emerald-300">{q.innovation2Title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{q.innovation2Desc}</p>
            </motion.div>
            <motion.div variants={itemVariants} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <Cpu className="mb-4 size-8 text-amber-400" />
              <h3 className="mb-2 font-medium text-emerald-300">{q.innovation3Title}</h3>
              <p className="text-sm leading-relaxed text-zinc-400">{q.innovation3Desc}</p>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          ref={legalRef}
          initial="hidden"
          animate={legalInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-10 rounded-2xl bg-zinc-900/80 p-8 border border-zinc-800/80"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-4 text-xl font-semibold tracking-tight text-zinc-300"
          >
            {q.legalTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-sm leading-relaxed text-zinc-500">
            {q.legalDesc}
          </motion.p>
        </motion.section>
      </div>
    </div>
  );
}
