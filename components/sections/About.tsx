"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { BarChart3, Cpu, Activity, Layout, Database, Brain, ExternalLink, Award, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const CERT_URL =
  "https://cdn.umiejetnoscijutra.pl/certificates/f60d74f1-5530-481d-8cc0-b1e5d661cf11";

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const { dict, localeSegment } = useLanguage();
  const stages = dict.about.stages;
  // Map each stage id to a Lucide icon
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iconMap: Record<string, React.ComponentType<any>> = {
    fullstack: BarChart3,
    ai: Cpu,
    ux: Brain,
  };
  const heatmapBg = [true, false, false];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative my-24 border-t border-zinc-800 bg-black/20 px-5 py-16 pb-[max(2rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-6 md:py-24 md:pb-24"
      aria-labelledby="bridge-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="bridge-heading"
          className="mb-10 text-center text-2xl font-bold tracking-tight text-zinc-100 md:text-3xl"
        >
          {dict.about.bridgeTitle}
        </h2>

        <motion.div
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5 }}
          className="mb-14 flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10"
        >
          <div className="relative size-28 shrink-0 overflow-hidden rounded-full border-2 border-emerald-500 bg-zinc-800/80 shadow-[0_0_12px_rgba(16,185,129,0.4)] sm:size-36 md:size-40">
            <Image
              src="/li.jpg"
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 7rem, (max-width: 768px) 9rem, 10rem"
            />
          </div>
          <div className="min-w-0 max-w-[65ch] flex-1 text-center sm:text-left">
            <p className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl md:text-4xl">
              BAŁUN<span className="text-emerald-500">IA</span>K ŁUKASZ
            </p>
            <p className="mt-3 text-lg leading-relaxed text-zinc-200 text-balance">
              {dict.about.headline}
            </p>
            <p className="mt-2 text-sm text-zinc-500 md:text-base">
              {dict.about.subheadline}
            </p>
            {/* Tech badges — clean Lucide icons matching TechStackTrust style */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:justify-start" aria-label="Expert-level tools">
              {[
                { icon: Layout, label: "Next.js" },
                { icon: Cpu, label: "OpenAI" },
                { icon: Database, label: "Supabase" },
                { icon: Activity, label: "Vercel" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-300"
                >
                  <Icon className="size-5 text-zinc-400" aria-hidden />
                  <span className="text-xs font-medium">{label}</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="relative">
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-hidden
          >
            <svg
              className="hidden h-24 w-full md:block"
              viewBox="0 0 300 24"
              fill="none"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 0 12 Q 150 12 300 12"
                stroke="url(#bridge-gradient)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.4))" }}
              />
              <defs>
                <linearGradient id="bridge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
                  <stop offset="50%" stopColor="rgba(16,185,129,0.7)" />
                  <stop offset="100%" stopColor="rgba(16,185,129,0.3)" />
                </linearGradient>
              </defs>
            </svg>
            <svg
              className="absolute left-6 top-0 bottom-0 w-px md:hidden"
              viewBox="0 0 2 400"
              preserveAspectRatio="none"
            >
              <motion.path
                d="M 1 0 L 1 400"
                stroke="url(#bridge-gradient-vertical)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 6px rgba(16,185,129,0.4))" }}
              />
              <defs>
                <linearGradient id="bridge-gradient-vertical" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
                  <stop offset="50%" stopColor="rgba(16,185,129,0.7)" />
                  <stop offset="100%" stopColor="rgba(16,185,129,0.3)" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
            {stages.map((stage, i) => {
              const Icon = iconMap[stage.id] ?? BarChart3;
              const heatmap = heatmapBg[i];
              return (
                <motion.div
                  key={stage.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  className={cn(
                    "relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-lg backdrop-blur-sm transition-all duration-300",
                    "md:flex md:flex-col"
                  )}
                  whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
                >
                  {heatmap && (
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.07]"
                      aria-hidden
                    >
                      <svg className="h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="none">
                        {[20, 45, 70, 95, 120, 145, 170].map((x, j) => (
                          <rect
                            key={j}
                            x={x}
                            y={80 - (j % 3) * 25}
                            width="18"
                            height={15 + (j % 4) * 12}
                            fill="rgb(16,185,129)"
                            rx="2"
                          />
                        ))}
                        <rect x="20" y="40" width="18" height="35" fill="rgb(16,185,129)" rx="2" opacity="0.8" />
                        <rect x="95" y="30" width="18" height="45" fill="rgb(16,185,129)" rx="2" opacity="0.9" />
                        <rect x="170" y="25" width="18" height="50" fill="rgb(16,185,129)" rx="2" />
                      </svg>
                    </div>
                  )}
                  <div className="relative z-10 flex items-center gap-3 md:flex-col md:items-start md:gap-4">
                    <div
                      className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-400"
                      aria-hidden
                    >
                      <Icon className="size-6" />
                    </div>
                    <div className="md:flex-1 md:pt-0">
                      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-emerald-400/90">
                        {stage.label}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-zinc-100">
                        {stage.title}
                      </h3>
                    </div>
                  </div>
                  <p className="relative z-10 mt-4 text-sm leading-relaxed text-zinc-400 md:mt-5 md:flex-1">
                    {stage.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Proof of Concept ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12"
        >
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-zinc-500">
            {dict.about.proofTitle}
          </p>
          <a
            href={CERT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mx-auto flex max-w-sm items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_0_24px_rgba(66,133,244,0.15)]"
          >
            {/* Google-coloured award badge */}
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-[#4285F4]/30 bg-[#4285F4]/10">
              <Award className="size-7 text-[#4285F4]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              {/* Google wordmark — coloured dots + text */}
              <div className="mb-1 flex items-center gap-[2px]">
                <span className="text-sm font-bold tracking-tight" style={{ color: "#4285F4" }}>G</span>
                <span className="text-sm font-bold tracking-tight" style={{ color: "#EA4335" }}>o</span>
                <span className="text-sm font-bold tracking-tight" style={{ color: "#FBBC05" }}>o</span>
                <span className="text-sm font-bold tracking-tight" style={{ color: "#4285F4" }}>g</span>
                <span className="text-sm font-bold tracking-tight" style={{ color: "#34A853" }}>l</span>
                <span className="text-sm font-bold tracking-tight" style={{ color: "#EA4335" }}>e</span>
              </div>
              <p className="text-sm font-medium text-zinc-200 leading-snug">{dict.about.proofDesc}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-[#4285F4] transition-colors group-hover:text-[#76a9fc]">
                {dict.about.proofCta}
                <ExternalLink className="size-3" aria-hidden />
              </p>
            </div>
          </a>
        </motion.div>

        {/* The second door: recruiters get their own page instead of this client pitch */}
        <p className="mt-10 text-center">
          <Link
            href={`/${localeSegment}/o-mnie`}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-emerald-400"
          >
            {dict.about.recruiterCta}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  );
}
