"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Archive,
  ArrowLeft,
  Camera,
  Clock,
  CreditCard,
  Leaf,
  Tag,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BeforeAfterShowcase } from "@/components/BeforeAfterShowcase";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

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

export default function FotarobotaCaseStudyPage() {
  const { dict, localeSegment } = useLanguage();
  const f = dict.fotarobotaPage;

  const demoRef = useRef<HTMLElement>(null);
  const problemRef = useRef<HTMLElement>(null);
  const solutionRef = useRef<HTMLElement>(null);
  const pipelineRef = useRef<HTMLElement>(null);
  const engineeringRef = useRef<HTMLElement>(null);
  const techRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const archiveRef = useRef<HTMLElement>(null);

  const demoInView = useInView(demoRef, { once: true, amount: 0.1 });
  const problemInView = useInView(problemRef, { once: true, amount: 0.15 });
  const solutionInView = useInView(solutionRef, { once: true, amount: 0.15 });
  const pipelineInView = useInView(pipelineRef, { once: true, amount: 0.1 });
  const engineeringInView = useInView(engineeringRef, { once: true, amount: 0.1 });
  const techInView = useInView(techRef, { once: true, amount: 0.15 });
  const resultsInView = useInView(resultsRef, { once: true, amount: 0.15 });
  const archiveInView = useInView(archiveRef, { once: true, amount: 0.15 });

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
              {f.backToProjects}
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
            {f.heroTitle}
          </h1>
          <p className="mb-2 text-lg text-zinc-400 text-balance sm:text-xl">{f.heroSubline}</p>
          <p className="mb-6 text-sm text-zinc-500">{f.heroSubtext}</p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-zinc-400">
              <Archive className="size-3" aria-hidden />
              {f.statusLabel} {f.statusValue}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-emerald-300">
              <Tag className="size-3" aria-hidden />
              {f.forSaleBadge}
            </span>
          </div>

          {/* Full landing-page capture — keep its native ratio so nothing is cropped away */}
          <div
            className="relative mt-10 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-[0_0_40px_rgba(16,185,129,0.12)]"
            style={{ aspectRatio: "1109 / 889" }}
          >
            <Image
              src="/fotarobota-preview.webp"
              alt="Fotarobota — podgląd produktu"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </div>
        </motion.header>

        {/* Before / after showcase — the product's core value, kept alive statically */}
        <motion.section
          ref={demoRef}
          initial="hidden"
          animate={demoInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="demo-heading"
        >
          <motion.h2
            id="demo-heading"
            variants={itemVariants}
            className="mb-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {f.demoTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="mb-8 text-sm leading-relaxed text-zinc-400 sm:text-base">
            {f.demoSubtitle}
          </motion.p>
          <motion.div variants={itemVariants}>
            <BeforeAfterShowcase />
          </motion.div>
        </motion.section>

        <motion.section
          ref={problemRef}
          initial="hidden"
          animate={problemInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="wyzwanie-heading"
        >
          <motion.h2
            id="wyzwanie-heading"
            variants={itemVariants}
            className="mb-6 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {f.wyzwanieTitle}
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { text: f.wyzwanieP1, Icon: Clock, tint: "text-amber-400/10", wide: false },
              { text: f.wyzwanieP2, Icon: TrendingUp, tint: "text-sky-400/10", wide: false },
              { text: f.wyzwanieFood, Icon: Leaf, tint: "text-lime-400/10", wide: true },
            ].map((card) => (
              <motion.div
                key={card.text}
                variants={itemVariants}
                className={cn(
                  "relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm",
                  card.wide && "sm:col-span-2 lg:col-span-1"
                )}
              >
                <card.Icon
                  className={cn(
                    "pointer-events-none absolute -bottom-5 -right-4 size-32 -rotate-12",
                    card.tint
                  )}
                  strokeWidth={1.25}
                  aria-hidden
                />
                <p className="relative text-sm leading-relaxed text-zinc-400">{card.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          ref={solutionRef}
          initial="hidden"
          animate={solutionInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="architektura-heading"
        >
          <motion.h2
            id="architektura-heading"
            variants={itemVariants}
            className="mb-6 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {f.architekturaTitle}
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-emerald-500/20 bg-zinc-900/50 p-6 backdrop-blur-sm sm:p-8"
          >
            <p className="mb-4 text-sm leading-relaxed text-zinc-300">{f.architekturaP1}</p>
            <p className="text-sm font-medium text-emerald-400">{f.architekturaMagia}</p>
          </motion.div>
        </motion.section>

        {/* Pipeline */}
        <motion.section
          ref={pipelineRef}
          initial="hidden"
          animate={pipelineInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="pipeline-heading"
        >
          <motion.h2
            id="pipeline-heading"
            variants={itemVariants}
            className="mb-8 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {f.pipelineTitle}
          </motion.h2>
          <ol className="space-y-3">
            {f.pipelineSteps.map((step, index) => (
              <motion.li
                key={step.title}
                variants={itemVariants}
                className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-emerald-500/30"
              >
                <span className="mt-0.5 font-mono text-xs font-semibold text-emerald-500/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="mb-1 font-medium text-zinc-100">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{step.desc}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </motion.section>

        {/* Engineering deep dive */}
        <motion.section
          ref={engineeringRef}
          initial="hidden"
          animate={engineeringInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="engineering-heading"
        >
          <motion.h2
            id="engineering-heading"
            variants={itemVariants}
            className="mb-8 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {f.engineeringTitle}
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {f.engineeringItems.map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
              >
                <h3 className="mb-2 font-mono text-sm font-medium text-emerald-300">{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          ref={techRef}
          initial="hidden"
          animate={techInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="tech-heading"
        >
          <motion.h2
            id="tech-heading"
            variants={itemVariants}
            className="mb-6 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {f.silnikTitle}
          </motion.h2>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: f.techFrontend, value: "Next.js", icon: Zap },
              { label: f.techAi, value: "fal.ai", icon: Camera },
              { label: f.techPayments, value: "Autopay", icon: CreditCard },
              { label: f.techScale, value: "Serverless", icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.value}
                  variants={itemVariants}
                  className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm"
                >
                  <Icon className="size-6 text-emerald-500/90" aria-hidden />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      {item.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-zinc-100">{item.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <motion.p
            variants={itemVariants}
            className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            {f.stackListTitle}
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
            {f.stackList.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-zinc-300"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          ref={resultsRef}
          initial="hidden"
          animate={resultsInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="efekty-heading"
        >
          <motion.h2
            id="efekty-heading"
            variants={itemVariants}
            className="mb-6 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {f.efektyTitle}
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6 backdrop-blur-sm sm:p-8"
          >
            <ul className="space-y-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500" />
                <span>
                  <strong className="text-zinc-100">{f.efekt1Bold}</strong> {f.efekt1}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500" />
                <span>{f.efekt2}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500" />
                <span>
                  <strong className="text-emerald-400">{f.efekt3Bold}</strong> {f.efekt3}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500" />
                <span>{f.efekt4}</span>
              </li>
            </ul>
          </motion.div>
        </motion.section>

        {/* Archive note — replaces the old "view it live" call to action */}
        <motion.section
          ref={archiveRef}
          initial="hidden"
          animate={archiveInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 sm:p-8"
          aria-labelledby="archive-heading"
        >
          <motion.h2
            id="archive-heading"
            variants={itemVariants}
            className="mb-4 flex items-center gap-3 text-xl font-semibold tracking-tight text-zinc-300"
          >
            <Archive className="size-5 shrink-0 text-zinc-500" aria-hidden />
            {f.archiveTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-sm leading-relaxed text-zinc-400">
            {f.archiveBody}
          </motion.p>
          <motion.p variants={itemVariants} className="mt-4 text-xs text-zinc-500">
            {f.archiveNote}
          </motion.p>

          {/* The system is finished and transferable — say so where the status is read */}
          <motion.div
            variants={itemVariants}
            className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6"
          >
            <h3 className="mb-3 flex items-center gap-2.5 text-lg font-semibold text-emerald-300">
              <Tag className="size-4 shrink-0" aria-hidden />
              {f.forSaleTitle}
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-zinc-300">{f.forSaleBody}</p>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500">
              <Link href={`/${localeSegment}#contact`}>{f.forSaleCta}</Link>
            </Button>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
