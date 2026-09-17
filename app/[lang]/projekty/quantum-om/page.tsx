"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Bot,
  Cpu,
  Eye,
  Gauge,
  PauseCircle,
  Shield,
  ShieldCheck,
  Tag,
  Umbrella,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TechLine } from "@/components/ui/tech-line";
import { SeeleNeon } from "@/components/SeeleNeon";
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

const INTERFACE_ICONS = [Gauge, Bell, Eye, Cpu];

export default function QuantumOmCaseStudyPage() {
  const { dict, localeSegment } = useLanguage();
  const q = dict.quantumOmPage;
  const f = dict.fotarobotaPage; // shared "back to projects" label

  const liveRef = useRef<HTMLElement>(null);
  const archRef = useRef<HTMLElement>(null);
  const agentsRef = useRef<HTMLElement>(null);
  const cycleRef = useRef<HTMLElement>(null);
  const guardRef = useRef<HTMLElement>(null);
  const memoryRef = useRef<HTMLElement>(null);
  const interfaceRef = useRef<HTMLElement>(null);
  const innovationsRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLElement>(null);
  const pausedRef = useRef<HTMLElement>(null);
  const legalRef = useRef<HTMLElement>(null);

  const liveInView = useInView(liveRef, { once: true, amount: 0.1 });
  const archInView = useInView(archRef, { once: true, amount: 0.15 });
  const agentsInView = useInView(agentsRef, { once: true, amount: 0.1 });
  const cycleInView = useInView(cycleRef, { once: true, amount: 0.1 });
  const guardInView = useInView(guardRef, { once: true, amount: 0.1 });
  const memoryInView = useInView(memoryRef, { once: true, amount: 0.1 });
  const interfaceInView = useInView(interfaceRef, { once: true, amount: 0.1 });
  const innovationsInView = useInView(innovationsRef, { once: true, amount: 0.15 });
  const stackInView = useInView(stackRef, { once: true, amount: 0.15 });
  const pausedInView = useInView(pausedRef, { once: true, amount: 0.1 });
  const legalInView = useInView(legalRef, { once: true, amount: 0.15 });

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
            {q.heroTitle}
          </h1>
          <p className="text-lead mb-2 text-fg">
            {q.heroSubline}
          </p>
          <p className="mb-6 text-base text-fg-muted">{q.heroSubtext}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-fg">
              <Wallet className="size-4 text-accent" strokeWidth={1.5} aria-hidden />
              {q.liveCapitalBadge}
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted">
              <PauseCircle className="size-4 text-fg-subtle" strokeWidth={1.5} aria-hidden />
              {q.statusLabel} {q.statusValue}
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-accent">
              <Tag className="size-4" strokeWidth={1.5} aria-hidden />
              {q.forSaleBadge}
            </span>
          </div>

          {/* The command centre's own neon sign, carried over from the app */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10"
          >
            <SeeleNeon />
          </motion.div>
        </motion.header>

        {/* The headline fact: real money, real exchange */}
        <motion.section
          ref={liveRef}
          initial="hidden"
          animate={liveInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="live-heading"
        >
          <motion.h2
            id="live-heading"
            variants={itemVariants}
            className="text-h2 mb-5"
          >
            {q.liveTitle}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mb-6 border-l-2 border-accent pl-5 text-lg leading-relaxed text-fg"
          >
            {q.liveLead}
          </motion.p>
          <motion.p variants={itemVariants} className="mb-4 text-base leading-relaxed text-fg-muted">
            {q.liveP1}
          </motion.p>
          <motion.p variants={itemVariants} className="mb-8 text-base leading-relaxed text-fg-muted">
            {q.liveP2}
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="eyebrow-muted mb-3"
          >
            {q.liveStatsTitle}
          </motion.p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {q.liveStats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="card p-4 md:p-5"
              >
                <p className="font-display text-2xl font-semibold tabular-nums text-fg">{stat.value}</p>
                <p className="mt-1 text-sm leading-snug text-fg-subtle">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            variants={itemVariants}
            className="card mt-6 p-5 text-[0.9375rem] leading-relaxed text-fg-muted"
          >
            {q.liveDisclaimer}
          </motion.p>
        </motion.section>

        {/* Command centre capture */}
        <motion.figure
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div
            className="relative overflow-hidden rounded-md border border-border bg-black"
            style={{ aspectRatio: "1600 / 1755" }}
          >
            <Image
              src="/quantum-om-preview.webp"
              alt="Quantum OM — Command Center"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </div>
          <figcaption className="mt-3 text-center text-sm leading-relaxed text-fg-subtle">
            {q.dashboardCaption}
          </figcaption>
        </motion.figure>

        {/* Decision architecture (kept from the original write-up) */}
        <motion.section
          ref={archRef}
          initial="hidden"
          animate={archInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-h2 mb-6"
          >
            {q.architekturaTitle}
          </motion.h2>
          <div className="space-y-4">
            <motion.p variants={itemVariants} className="text-base leading-relaxed text-fg-muted">
              {q.architekturaP1}
            </motion.p>
            <motion.p variants={itemVariants} className="text-base leading-relaxed text-fg-muted">
              {q.architekturaP2}
            </motion.p>
            <motion.p variants={itemVariants} className="text-base leading-relaxed text-fg-muted">
              {q.architekturaP3}
            </motion.p>
          </div>
        </motion.section>

        {/* The five agents */}
        <motion.section
          ref={agentsRef}
          initial="hidden"
          animate={agentsInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="agents-heading"
        >
          <motion.h2
            id="agents-heading"
            variants={itemVariants}
            className="text-h2 mb-4"
          >
            {q.agentsTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="mb-8 text-base leading-relaxed text-fg-muted">
            {q.agentsLead}
          </motion.p>
          <div className="grid gap-4 sm:grid-cols-2">
            {q.agents.map((agent) => (
              <motion.div
                key={agent.codename}
                variants={itemVariants}
                className="card p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-h4">{agent.codename}</p>
                    <p className="mt-0.5 text-sm text-fg-subtle">{agent.role}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-fg-muted">
                    {agent.weight}
                  </span>
                </div>
                <p className="mb-3 text-base leading-relaxed text-fg-muted">{agent.desc}</p>
                <p className="text-sm text-fg-subtle">{agent.model}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Decision cycle */}
        <motion.section
          ref={cycleRef}
          initial="hidden"
          animate={cycleInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="cycle-heading"
        >
          <motion.h2
            id="cycle-heading"
            variants={itemVariants}
            className="text-h2 mb-8"
          >
            {q.cycleTitle}
          </motion.h2>
          <ol className="space-y-3">
            {q.cycleSteps.map((step, index) => (
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

        {/* Guard */}
        <motion.section
          ref={guardRef}
          initial="hidden"
          animate={guardInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="guard-heading"
        >
          <motion.h2
            id="guard-heading"
            variants={itemVariants}
            className="text-h2 mb-4 flex items-center gap-3"
          >
            <ShieldCheck className="size-6 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
            {q.guardTitle}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mb-8 border-l-2 border-accent pl-5 text-base leading-relaxed text-fg"
          >
            {q.guardLead}
          </motion.p>
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {q.guardRules.map((rule) => (
              <motion.div
                key={rule.label}
                variants={itemVariants}
                className="card p-5"
              >
                <p className="eyebrow-muted">
                  {rule.label}
                </p>
                <p className="mb-2 mt-1 font-display text-xl font-semibold tabular-nums text-fg">
                  {rule.value}
                </p>
                <p className="text-sm leading-relaxed text-fg-muted">{rule.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            variants={itemVariants}
            className="card p-5 md:p-7"
          >
            <h3 className="text-h4 mb-2 flex items-center gap-2.5">
              <Umbrella className="size-5 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
              {q.guardDoctrine}
            </h3>
            <p className="text-base leading-relaxed text-fg-muted">{q.guardDoctrineDesc}</p>
          </motion.div>
        </motion.section>

        {/* Memory */}
        <motion.section
          ref={memoryRef}
          initial="hidden"
          animate={memoryInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="memory-heading"
        >
          <motion.h2
            id="memory-heading"
            variants={itemVariants}
            className="text-h2 mb-8"
          >
            {q.memoryTitle}
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {q.memoryItems.map((item) => (
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

        {/* Dashboard + Telegram */}
        <motion.section
          ref={interfaceRef}
          initial="hidden"
          animate={interfaceInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
          aria-labelledby="interface-heading"
        >
          <motion.h2
            id="interface-heading"
            variants={itemVariants}
            className="text-h2 mb-4"
          >
            {q.interfaceTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="mb-8 text-base leading-relaxed text-fg-muted">
            {q.interfaceLead}
          </motion.p>
          <div className="grid gap-4 sm:grid-cols-2">
            {q.interfaceItems.map((item, index) => {
              const Icon = INTERFACE_ICONS[index % INTERFACE_ICONS.length];
              return (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  className="card p-5 md:p-6"
                >
                  <Icon className="mb-4 size-6 text-accent" strokeWidth={1.5} aria-hidden />
                  <h3 className="text-h4 mb-2">{item.title}</h3>
                  <p className="text-base leading-relaxed text-fg-muted">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Innovations (kept from the original write-up) */}
        <motion.section
          ref={innovationsRef}
          initial="hidden"
          animate={innovationsInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-h2 mb-8"
          >
            {q.innovationsTitle}
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <motion.div variants={itemVariants} className="card p-5 md:p-6">
              <Bot className="mb-4 size-6 text-accent" strokeWidth={1.5} />
              <h3 className="text-h4 mb-2">{q.innovation1Title}</h3>
              <p className="text-base leading-relaxed text-fg-muted">{q.innovation1Desc}</p>
            </motion.div>
            <motion.div variants={itemVariants} className="card p-5 md:p-6">
              <Shield className="mb-4 size-6 text-accent" strokeWidth={1.5} />
              <h3 className="text-h4 mb-2">{q.innovation2Title}</h3>
              <p className="text-base leading-relaxed text-fg-muted">{q.innovation2Desc}</p>
            </motion.div>
            <motion.div variants={itemVariants} className="card p-5 md:p-6">
              <Cpu className="mb-4 size-6 text-accent" strokeWidth={1.5} />
              <h3 className="text-h4 mb-2">{q.innovation3Title}</h3>
              <p className="text-base leading-relaxed text-fg-muted">{q.innovation3Desc}</p>
            </motion.div>
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
            {q.stackListTitle}
          </motion.h2>
          <motion.div variants={itemVariants}>
            <TechLine items={q.stackList} className="text-base" />
          </motion.div>
        </motion.section>

        {/* Paused + for sale */}
        <motion.section
          ref={pausedRef}
          initial="hidden"
          animate={pausedInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="card mb-10 p-5 md:p-8"
          aria-labelledby="paused-heading"
        >
          <motion.h2
            id="paused-heading"
            variants={itemVariants}
            className="text-h2 mb-4 flex items-center gap-3"
          >
            <PauseCircle className="size-6 shrink-0 text-fg-subtle" strokeWidth={1.5} aria-hidden />
            {q.pausedTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-base leading-relaxed text-fg-muted">
            {q.pausedBody}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-6 rounded-md border border-border bg-surface-2 p-5"
          >
            <h3 className="text-h4 mb-2">{q.pausedPortabilityTitle}</h3>
            <p className="text-base leading-relaxed text-fg-muted">{q.pausedPortabilityBody}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-4 rounded-md border border-border bg-surface-2 p-5 md:p-6"
          >
            <h3 className="text-h4 mb-3 flex items-center gap-2.5">
              <Tag className="size-5 shrink-0 text-accent" strokeWidth={1.5} aria-hidden />
              {q.forSaleTitle}
            </h3>
            <p className="mb-6 text-base leading-relaxed text-fg-muted">{q.forSaleBody}</p>
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/${localeSegment}#contact`}>{q.forSaleCta}</Link>
            </Button>
          </motion.div>
        </motion.section>

        {/* Legal note */}
        <motion.section
          ref={legalRef}
          initial="hidden"
          animate={legalInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="card mb-10 p-5 md:p-8"
        >
          <motion.h2
            variants={itemVariants}
            className="text-h2 mb-4"
          >
            {q.legalTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-base leading-relaxed text-fg-muted">
            {q.legalDesc}
          </motion.p>
        </motion.section>
      </div>
    </div>
  );
}
