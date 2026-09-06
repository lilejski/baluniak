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

/** Accent per agent, in the order they appear in the dictionary. */
const AGENT_ACCENTS = [
  { ring: "border-emerald-500/30", text: "text-emerald-300", chip: "bg-emerald-500/10" },
  { ring: "border-pink-500/30", text: "text-pink-300", chip: "bg-pink-500/10" },
  { ring: "border-sky-500/30", text: "text-sky-300", chip: "bg-sky-500/10" },
  { ring: "border-amber-500/30", text: "text-amber-300", chip: "bg-amber-500/10" },
  { ring: "border-violet-500/30", text: "text-violet-300", chip: "bg-violet-500/10" },
];

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
            {q.heroTitle}
          </h1>
          <p className="mb-2 text-lg text-emerald-400 text-balance sm:text-xl font-medium">
            {q.heroSubline}
          </p>
          <p className="mb-6 text-sm text-zinc-400">{q.heroSubtext}</p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-emerald-300">
              <Wallet className="size-3" aria-hidden />
              {q.liveCapitalBadge}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-zinc-400">
              <PauseCircle className="size-3" aria-hidden />
              {q.statusLabel} {q.statusValue}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-violet-300">
              <Tag className="size-3" aria-hidden />
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
            className="mb-5 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {q.liveTitle}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mb-6 border-l-2 border-emerald-500/60 pl-5 text-base leading-relaxed text-zinc-200 sm:text-lg"
          >
            {q.liveLead}
          </motion.p>
          <motion.p variants={itemVariants} className="mb-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
            {q.liveP1}
          </motion.p>
          <motion.p variants={itemVariants} className="mb-8 text-sm leading-relaxed text-zinc-400 sm:text-base">
            {q.liveP2}
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            {q.liveStatsTitle}
          </motion.p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {q.liveStats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <p className="font-mono text-xl font-semibold text-emerald-300">{stat.value}</p>
                <p className="mt-1 text-xs leading-snug text-zinc-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            variants={itemVariants}
            className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm leading-relaxed text-zinc-400"
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
            className="relative overflow-hidden rounded-xl border border-zinc-800 bg-black shadow-[0_0_50px_rgba(16,185,129,0.10)]"
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
          <figcaption className="mt-3 text-center text-xs leading-relaxed text-zinc-500">
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
            className="mb-6 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
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
            className="mb-4 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {q.agentsTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="mb-8 text-sm leading-relaxed text-zinc-400 sm:text-base">
            {q.agentsLead}
          </motion.p>
          <div className="grid gap-4 sm:grid-cols-2">
            {q.agents.map((agent, index) => {
              const accent = AGENT_ACCENTS[index % AGENT_ACCENTS.length];
              return (
                <motion.div
                  key={agent.codename}
                  variants={itemVariants}
                  className={`rounded-xl border bg-zinc-900/50 p-5 ${accent.ring}`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`font-mono text-sm font-bold tracking-widest ${accent.text}`}>
                        {agent.codename}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">{agent.role}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-zinc-400 ${accent.chip}`}
                    >
                      {agent.weight}
                    </span>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-zinc-400">{agent.desc}</p>
                  <p className="font-mono text-[0.7rem] text-zinc-600">{agent.model}</p>
                </motion.div>
              );
            })}
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
            className="mb-8 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {q.cycleTitle}
          </motion.h2>
          <ol className="space-y-3">
            {q.cycleSteps.map((step, index) => (
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
            className="mb-4 flex items-center gap-3 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            <ShieldCheck className="size-6 shrink-0 text-emerald-400" aria-hidden />
            {q.guardTitle}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mb-8 border-l-2 border-emerald-500/60 pl-5 text-sm leading-relaxed text-zinc-300 sm:text-base"
          >
            {q.guardLead}
          </motion.p>
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {q.guardRules.map((rule) => (
              <motion.div
                key={rule.label}
                variants={itemVariants}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {rule.label}
                </p>
                <p className="mb-2 mt-1 font-mono text-lg font-semibold text-emerald-300">
                  {rule.value}
                </p>
                <p className="text-xs leading-relaxed text-zinc-500">{rule.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-xl border border-amber-500/25 bg-amber-950/10 p-6"
          >
            <Umbrella
              className="pointer-events-none absolute -bottom-8 -right-6 size-44 rotate-12 text-amber-400/10"
              strokeWidth={1.1}
              aria-hidden
            />
            <h3 className="relative mb-2 flex items-center gap-2.5 font-medium text-amber-200">
              <Umbrella className="size-4 shrink-0" aria-hidden />
              {q.guardDoctrine}
            </h3>
            <p className="relative text-sm leading-relaxed text-zinc-400">{q.guardDoctrineDesc}</p>
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
            className="mb-8 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {q.memoryTitle}
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {q.memoryItems.map((item) => (
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
            className="mb-4 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {q.interfaceTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="mb-8 text-sm leading-relaxed text-zinc-400 sm:text-base">
            {q.interfaceLead}
          </motion.p>
          <div className="grid gap-4 sm:grid-cols-2">
            {q.interfaceItems.map((item, index) => {
              const Icon = INTERFACE_ICONS[index % INTERFACE_ICONS.length];
              return (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
                >
                  <Icon className="mb-4 size-7 text-violet-400" aria-hidden />
                  <h3 className="mb-2 font-medium text-zinc-100">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{item.desc}</p>
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
            {q.stackListTitle}
          </motion.h2>
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
            {q.stackList.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-zinc-300"
              >
                {item}
              </span>
            ))}
          </motion.div>
        </motion.section>

        {/* Paused + for sale */}
        <motion.section
          ref={pausedRef}
          initial="hidden"
          animate={pausedInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="mb-10 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 sm:p-8"
          aria-labelledby="paused-heading"
        >
          <motion.h2
            id="paused-heading"
            variants={itemVariants}
            className="mb-4 flex items-center gap-3 text-xl font-semibold tracking-tight text-zinc-300"
          >
            <PauseCircle className="size-5 shrink-0 text-zinc-500" aria-hidden />
            {q.pausedTitle}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-sm leading-relaxed text-zinc-400">
            {q.pausedBody}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-6 rounded-xl border border-sky-500/25 bg-sky-950/10 p-5"
          >
            <h3 className="mb-2 font-medium text-sky-200">{q.pausedPortabilityTitle}</h3>
            <p className="text-sm leading-relaxed text-zinc-400">{q.pausedPortabilityBody}</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6"
          >
            <h3 className="mb-3 flex items-center gap-2.5 text-lg font-semibold text-emerald-300">
              <Tag className="size-4 shrink-0" aria-hidden />
              {q.forSaleTitle}
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-zinc-300">{q.forSaleBody}</p>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500">
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
          className="mb-10 rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-6 sm:p-8"
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
