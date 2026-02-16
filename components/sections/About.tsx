"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BarChart3, Smartphone, Zap } from "lucide-react";
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

function NextJsLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 180" className={className} aria-hidden>
      <mask id="nextjs-a">
        <rect width="180" height="180" fill="white" />
        <path d="M90 18L162 90L90 162L18 90L90 18Z" fill="black" />
      </mask>
      <g mask="url(#nextjs-a)">
        <path fill="black" d="M90 0L180 90L90 180L0 90Z" />
        <path fill="white" d="M90 18v72l52.5-52.5L90 18Z" />
      </g>
    </svg>
  );
}

function OpenAILogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 18.0103a5.9847 5.9847 0 0 0 3.9977-2.9001 6.0462 6.0462 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 3.7788-2.1952a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v8.5094a4.504 4.504 0 0 1-4.4945 4.4944 4.4755 4.4755 0 0 1-2.8765-1.0407zM12.1584 7.8965a.7948.7948 0 0 0-.3927.6813v6.7369l-2.02-1.1638a.0757.0757 0 0 1-.038-.056V6.9021a4.504 4.504 0 0 1 4.4945-4.4944 4.4755 4.4755 0 0 1 2.8764 1.0408l-.1419.0804-3.7788 2.1952z" />
    </svg>
  );
}

function StripeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 25" className={className} aria-hidden fill="currentColor">
      <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 2.96-1.59 0-.83-.44-1.38-2.21-1.92l-2.87-.78c-2.67-.73-4.37-2.23-4.37-4.79 0-2.95 2.32-4.7 5.63-4.7 2.64 0 4.75.96 5.9 2.64l-2.14 1.31c-.48-.93-1.45-1.48-2.76-1.48-1.26 0-2.23.53-2.23 1.44 0 .94.97 1.34 2.64 1.82l2.66.73c2.82.78 4.54 2.41 4.54 5 0 3.28-2.65 5.13-6.14 5.13-3.01 0-5.25-1.48-6.34-3.54l2.25-1.23c.96 1.58 2.58 2.5 4.22 2.5 1.31 0 2.35-.53 2.35-1.5zM40.95 20.3l2.72-14.22h2.8l-2.73 14.22h-2.8zm.02-17.15c0-.9.72-1.6 1.7-1.6 1 0 1.7.7 1.7 1.6 0 .9-.72 1.6-1.7 1.6-1 0-1.7-.7-1.7-1.6zM34.16 6.08h-3.5l-.25 1.24h3.25c1.54 0 2.55.66 2.55 1.8 0 1.14-1 1.8-2.55 1.8h-3.25l-.5 2.54h-2.7l1.54-7.98h5.2c1.54 0 2.55.66 2.55 1.8 0 1.06-.9 1.74-2.4 1.74l.1-.5zm-3.2 2.54h2.7c.9 0 1.45-.4 1.45-1.1s-.55-1.1-1.45-1.1h-2.7l-.5 2.2zM24.73 6.08h-2.9l-1.55 7.98h2.9l1.55-7.98zm-.13-4.35l-.3 1.54h2.03l.28-1.54h-2.02zM12.85 6.08H9.4L7.85 14.06h2.76l.5-2.54h3.25c1.54 0 2.55-.66 2.55-1.8 0-1.14-1-1.8-2.55-1.8H9.4l-.25-1.24h3.5c.9 0 1.45.4 1.45 1.1s-.55 1.1-1.45 1.1h-2.7l-.5 2.54H4.2l1.54-7.98h7.12zM4.43 12.54c.1.9.9 1.5 2.24 1.5 1.55 0 3.05-.6 4.1-1.56l1.45 1.28c-1.4 1.2-3.4 1.95-5.6 1.95-3.22 0-5.4-2.1-5.4-5.4 0-2.7 1.7-4.58 4.3-5.28 2.1-.57 4.5-.2 4.5-1.8 0-1.2-1-1.75-2.4-1.75-1.26 0-2.5.45-3.5 1.2l-1.4-1.4c1.35-1.15 3.35-1.85 5.4-1.85 3.1 0 5.1 1.95 5.1 4.85 0 2.55-1.5 4.1-3.9 4.8-2.4.7-4.6.35-4.6 1.9 0 .95.95 1.6 2.35 1.6 1.2 0 2.5-.5 3.5-1.25l1.45 1.27z" />
    </svg>
  );
}

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const { dict } = useLanguage();
  const stages = dict.about.stages;
  const icons = [BarChart3, Smartphone, Zap] as const;
  const heatmapBg = [true, false, false];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative my-24 border-t border-white/10 bg-black/30 px-5 py-16 pb-[max(2rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-6 md:py-24 md:pb-24"
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
          <div className="shrink-0">
            <div
              className="size-28 rounded-full border-2 border-emerald-500/30 bg-zinc-800/80 sm:size-36 md:size-40"
              aria-hidden
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-500">
                <span className="text-xs font-medium uppercase tracking-wider sm:text-sm">Photo</span>
              </div>
            </div>
          </div>
          <div className="min-w-0 max-w-[65ch] flex-1 text-center sm:text-left">
            <p
              className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl md:text-4xl"
              style={{ backgroundSize: "200% auto" }}
            >
              {dict.about.roleTitle}
            </p>
            <p className="mt-3 text-lg leading-relaxed text-zinc-200 text-balance">
              {dict.about.headline}
            </p>
            <p className="mt-2 text-sm text-zinc-500 md:text-base">
              {dict.about.subheadline}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:justify-start" aria-label="Expert-level tools">
              <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zinc-400">
                <NextJsLogo className="size-6 text-zinc-100" />
                <span className="text-xs font-medium">Next.js</span>
              </span>
              <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zinc-400">
                <OpenAILogo className="size-6 text-zinc-100" />
                <span className="text-xs font-medium">OpenAI</span>
              </span>
              <span className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zinc-400">
                <StripeLogo className="size-5 text-zinc-100" />
                <span className="text-xs font-medium">Stripe</span>
              </span>
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
              const Icon = icons[i];
              const heatmap = heatmapBg[i];
              return (
                <motion.div
                  key={stage.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  className={cn(
                    "relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-lg backdrop-blur-sm",
                    "md:flex md:flex-col"
                  )}
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
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400/90">
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
      </div>
    </section>
  );
}
