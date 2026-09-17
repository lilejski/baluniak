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
  Share2,
  Wand2,
  Target,
  Layers,
  Wallet,
  Smartphone,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TechLine } from "@/components/ui/tech-line";
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
const flowIcons: ComponentType<{ className?: string; strokeWidth?: number }>[] = [
  FileSpreadsheet,
  ScanLine,
  Wand2,
  LayoutGrid,
  Share2,
  BarChart2,
];

/** Icons for the five competitive-edge points, in order. */
const edgeIcons: ComponentType<{ className?: string; strokeWidth?: number }>[] = [
  Target,
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
    <div className="min-h-screen bg-bg pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="container-narrow page-top">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Button variant="ghost" size="sm" asChild className="-ml-4">
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
          className="mb-16 sm:mb-20"
        >
          <h1 className="text-h1 mb-4">
            {c.heroTitle}
          </h1>
          <p className="text-lead mb-2 text-fg">
            {c.heroSubline}
          </p>
          <p className="mb-6 text-base text-fg-muted">{c.heroSubtext}</p>

          <div className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted">
            <span className="size-2 rounded-full bg-accent" aria-hidden />
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
            className="text-h2 mb-6"
          >
            {c.overviewTitle}
          </motion.h2>
          <div className="space-y-4">
            <motion.p variants={itemVariants} className="text-base leading-relaxed text-fg-muted">
              {c.overviewP1}
            </motion.p>
            <motion.p variants={itemVariants} className="text-base leading-relaxed text-fg-muted">
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
            className="text-h2 mb-6"
          >
            {c.problemTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="mb-8 text-base leading-relaxed text-fg-muted">
            {c.problemIntro}
          </motion.p>
          <div className="grid gap-4 sm:grid-cols-3">
            {c.problemPoints.map((point) => (
              <motion.div
                key={point.title}
                variants={itemVariants}
                className="card p-5"
              >
                <h3 className="text-h4 mb-2">{point.title}</h3>
                <p className="text-base leading-relaxed text-fg-muted">{point.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.p variants={itemVariants} className="mt-8 text-base leading-relaxed text-fg">
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
            className="text-h2 mb-8"
          >
            {c.flowTitle}
          </motion.h2>
          <ol className="space-y-3">
            {c.flowSteps.map((step, index) => {
              const Icon = flowIcons[index];
              return (
                <motion.li
                  key={step.title}
                  variants={itemVariants}
                  className="card flex gap-4 p-5"
                >
                  {Icon ? <Icon className="mt-0.5 size-6 shrink-0 text-accent" strokeWidth={1.5} /> : null}
                  <div className="min-w-0">
                    <h3 className="text-h4 mb-1 flex items-baseline gap-2">
                      <span className="font-mono text-sm font-normal tabular-nums text-fg-subtle">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {step.title}
                    </h3>
                    <p className="text-base leading-relaxed text-fg-muted">{step.desc}</p>
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
            className="text-h2 mb-8"
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
                  className="card p-5 md:p-6"
                >
                  {Icon ? <Icon className="mb-4 size-6 text-accent" strokeWidth={1.5} /> : null}
                  <h3 className="text-h4 mb-2">{point.title}</h3>
                  <p className="text-base leading-relaxed text-fg-muted">{point.desc}</p>
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
            className="text-h2 mb-4"
          >
            {c.stackTitle}
          </motion.h2>
          <motion.div variants={itemVariants}>
            <TechLine items={c.stackList} className="text-base" />
          </motion.div>
        </motion.section>

        {/* Engineering challenges */}
        <motion.section
          ref={challengesRef}
          initial="hidden"
          animate={challengesInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="card mb-10 p-5 md:p-8"
        >
          <motion.h2
            variants={itemVariants}
            className="text-h2 mb-6"
          >
            {c.challengesTitle}
          </motion.h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {c.challenges.map((challenge) => (
              <motion.div key={challenge.title} variants={itemVariants}>
                <h3 className="text-h4 mb-1.5">
                  {challenge.title}
                </h3>
                <p className="text-base leading-relaxed text-fg-muted">{challenge.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
