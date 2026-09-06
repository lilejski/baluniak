"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowLeft,
  BarChart2,
  FileSpreadsheet,
  LayoutGrid,
  ScanLine,
  Send,
  Sparkles,
  Zap,
  Layers,
  Wallet,
  Smartphone,
  Boxes,
} from "lucide-react";
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

/** Icons for the six pipeline stages, in flow order. */
const flowIcons: ComponentType<{ className?: string }>[] = [
  FileSpreadsheet,
  ScanLine,
  Sparkles,
  LayoutGrid,
  Send,
  BarChart2,
];

/** Icons for the five competitive-edge points, in order. */
const edgeIcons: ComponentType<{ className?: string }>[] = [
  Zap,
  Layers,
  Wallet,
  Boxes,
  Smartphone,
];

export default function CharonCaseStudyPage() {
  const { dict, localeSegment } = useLanguage();
  const c = dict.charonPage;
  const f = dict.fotarobotaPage; // shared "back to projects" label

  const overviewRef = useRef<HTMLElement>(null);
  const problemRef = useRef<HTMLElement>(null);
  const flowRef = useRef<HTMLElement>(null);
  const edgeRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLElement>(null);
  const challengesRef = useRef<HTMLElement>(null);

  const overviewInView = useInView(overviewRef, { once: true, amount: 0.15 });
  const problemInView = useInView(problemRef, { once: true, amount: 0.15 });
  const flowInView = useInView(flowRef, { once: true, amount: 0.1 });
  const edgeInView = useInView(edgeRef, { once: true, amount: 0.1 });
  const stackInView = useInView(stackRef, { once: true, amount: 0.15 });
  const challengesInView = useInView(challengesRef, { once: true, amount: 0.1 });

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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 sm:mb-16"
        >
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-zinc-100 text-balance sm:text-4xl md:text-5xl">
            {c.heroTitle}
          </h1>
          <p className="mb-2 text-lg text-cyan-300 text-balance sm:text-xl font-medium">
            {c.heroSubline}
          </p>
          <p className="mb-6 text-sm text-zinc-400">{c.heroSubtext}</p>

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-cyan-300">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-cyan-500"></span>
            </span>
            {c.statusLabel} {c.statusValue}
          </div>
        </motion.header>

        {/* Overview */}
        <motion.section
          ref={overviewRef}
          initial="hidden"
          animate={overviewInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-6 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {c.overviewTitle}
          </motion.h2>
          <div className="space-y-4">
            <motion.p variants={itemVariants} className="text-sm leading-relaxed text-zinc-400 sm:text-base">
              {c.overviewP1}
            </motion.p>
            <motion.p variants={itemVariants} className="text-sm leading-relaxed text-zinc-400 sm:text-base">
              {c.overviewP2}
            </motion.p>
          </div>
        </motion.section>

        {/* Problem */}
        <motion.section
          ref={problemRef}
          initial="hidden"
          animate={problemInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-6 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {c.problemTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="mb-8 text-sm leading-relaxed text-zinc-400 sm:text-base">
            {c.problemIntro}
          </motion.p>
          <div className="grid gap-4 sm:grid-cols-3">
            {c.problemPoints.map((point) => (
              <motion.div
                key={point.title}
                variants={itemVariants}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
              >
                <h3 className="mb-2 text-sm font-medium text-zinc-200">{point.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{point.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.p variants={itemVariants} className="mt-8 text-sm leading-relaxed text-zinc-300 sm:text-base">
            {c.problemOutro}
          </motion.p>
        </motion.section>

        {/* Flow */}
        <motion.section
          ref={flowRef}
          initial="hidden"
          animate={flowInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-8 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {c.flowTitle}
          </motion.h2>
          <ol className="space-y-4">
            {c.flowSteps.map((step, index) => {
              const Icon = flowIcons[index];
              return (
                <motion.li
                  key={step.title}
                  variants={itemVariants}
                  className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-cyan-500/30"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
                    {Icon ? <Icon className="size-5 text-cyan-300" /> : null}
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-1 flex items-baseline gap-2 font-medium text-zinc-100">
                      <span className="font-mono text-xs text-cyan-500/80">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-400">{step.desc}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </motion.section>

        {/* Competitive edge */}
        <motion.section
          ref={edgeRef}
          initial="hidden"
          animate={edgeInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-8 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {c.edgeTitle}
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {c.edgePoints.map((point, index) => {
              const Icon = edgeIcons[index];
              return (
                <motion.div
                  key={point.title}
                  variants={itemVariants}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
                >
                  {Icon ? <Icon className="mb-4 size-7 text-cyan-400" /> : null}
                  <h3 className="mb-2 font-medium text-cyan-200">{point.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{point.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Stack */}
        <motion.section
          ref={stackRef}
          initial="hidden"
          animate={stackInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-6 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {c.stackTitle}
          </motion.h2>
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
            {c.stackList.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-zinc-300"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </motion.section>

        {/* Engineering challenges */}
        <motion.section
          ref={challengesRef}
          initial="hidden"
          animate={challengesInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-10 rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-6 sm:p-8"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-6 text-xl font-semibold tracking-tight text-zinc-200 sm:text-2xl"
          >
            {c.challengesTitle}
          </motion.h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {c.challenges.map((challenge) => (
              <motion.div key={challenge.title} variants={itemVariants}>
                <h3 className="mb-1.5 font-mono text-sm font-medium text-cyan-300">
                  {challenge.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-400">{challenge.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
