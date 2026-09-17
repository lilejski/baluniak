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
import { TechLine } from "@/components/ui/tech-line";
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
              {f.backToProjects}
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
            {f.heroTitle}
          </h1>
          <p className="text-lead mb-2 text-fg">{f.heroSubline}</p>
          <p className="mb-6 text-base text-fg-muted">{f.heroSubtext}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted">
              <Archive className="size-4 text-fg-subtle" strokeWidth={1.5} aria-hidden />
              {f.statusLabel} {f.statusValue}
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-accent">
              <Tag className="size-4" strokeWidth={1.5} aria-hidden />
              {f.forSaleBadge}
            </span>
          </div>

          {/* Full landing-page capture — keep its native ratio so nothing is cropped away */}
          <div
            className="relative mt-10 overflow-hidden rounded-md border border-border bg-surface"
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
            className="text-h2 mb-3"
          >
            {f.demoTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="mb-8 text-base leading-relaxed text-fg-muted">
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
            className="text-h2 mb-6"
          >
            {f.wyzwanieTitle}
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { text: f.wyzwanieP1, Icon: Clock, wide: false },
              { text: f.wyzwanieP2, Icon: TrendingUp, wide: false },
              { text: f.wyzwanieFood, Icon: Leaf, wide: true },
            ].map((card) => (
              <motion.div
                key={card.text}
                variants={itemVariants}
                className={cn(
                  "card p-5 md:p-6",
                  card.wide && "sm:col-span-2 lg:col-span-1"
                )}
              >
                <card.Icon className="mb-4 size-6 text-accent" strokeWidth={1.5} aria-hidden />
                <p className="text-base leading-relaxed text-fg-muted">{card.text}</p>
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
            className="text-h2 mb-6"
          >
            {f.architekturaTitle}
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="card p-5 md:p-8"
          >
            <p className="mb-4 text-base leading-relaxed text-fg-muted">{f.architekturaP1}</p>
            <p className="text-base font-medium text-accent">{f.architekturaMagia}</p>
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
            className="text-h2 mb-8"
          >
            {f.pipelineTitle}
          </motion.h2>
          <ol className="space-y-3">
            {f.pipelineSteps.map((step, index) => (
              <motion.li
                key={step.title}
                variants={itemVariants}
                className="card flex gap-4 p-5"
              >
                <span className="mt-0.5 font-mono text-sm tabular-nums text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-h4 mb-1">{step.title}</h3>
                  <p className="text-base leading-relaxed text-fg-muted">{step.desc}</p>
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
            className="text-h2 mb-8"
          >
            {f.engineeringTitle}
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {f.engineeringItems.map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="card p-5 md:p-6"
              >
                <h3 className="text-h4 mb-2">{item.title}</h3>
                <p className="text-base leading-relaxed text-fg-muted">{item.desc}</p>
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
            className="text-h2 mb-6"
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
                  className="card flex flex-col gap-3 p-5"
                >
                  <Icon className="size-6 text-accent" strokeWidth={1.5} aria-hidden />
                  <div>
                    <p className="eyebrow-muted">
                      {item.label}
                    </p>
                    <p className="text-h4 mt-1">{item.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <motion.p
            variants={itemVariants}
            className="eyebrow-muted mb-2"
          >
            {f.stackListTitle}
          </motion.p>
          <motion.div variants={itemVariants}>
            <TechLine items={f.stackList} />
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
            className="text-h2 mb-6"
          >
            {f.efektyTitle}
          </motion.h2>
          <motion.div
            variants={itemVariants}
            className="card p-5 md:p-8"
          >
            <ul className="space-y-3 text-base leading-relaxed text-fg-muted">
              <li className="flex items-start gap-3">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>
                  <strong className="font-semibold text-fg">{f.efekt1Bold}</strong> {f.efekt1}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{f.efekt2}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>
                  <strong className="font-semibold text-fg">{f.efekt3Bold}</strong> {f.efekt3}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
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
          className="card p-5 md:p-8"
          aria-labelledby="archive-heading"
        >
          <motion.h2
            id="archive-heading"
            variants={itemVariants}
            className="text-h2 mb-4 flex items-center gap-3"
          >
            <Archive className="size-6 shrink-0 text-fg-subtle" strokeWidth={1.5} aria-hidden />
            {f.archiveTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-base leading-relaxed text-fg-muted">
            {f.archiveBody}
          </motion.p>
          <motion.p variants={itemVariants} className="mt-4 text-sm text-fg-subtle">
            {f.archiveNote}
          </motion.p>

          {/* The system is finished and transferable — say so where the status is read */}
          <motion.div
            variants={itemVariants}
            className="mt-8 rounded-md border border-border bg-surface-2 p-5 md:p-6"
          >
            <h3 className="text-h4 mb-3 flex items-center gap-2.5">
              <Tag className="size-5 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
              {f.forSaleTitle}
            </h3>
            <p className="mb-6 text-base leading-relaxed text-fg-muted">{f.forSaleBody}</p>
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/${localeSegment}#contact`}>{f.forSaleCta}</Link>
            </Button>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
