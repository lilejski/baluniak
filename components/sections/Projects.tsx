"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart2,
  Cloud,
  Cpu,
  ExternalLink,
  LayoutGrid,
  Layout,
  Database,
  Bot,
  Brain,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "@/components/SpotlightCard";

// Removed "SaaS Starter Kit" and "AI Automations"

const techIcons: Record<string, ComponentType<{ className?: string }>> = {
  nextjs: Layout,
  falai: Cpu,
  vercel: Cloud,
  posthog: BarChart2,
  openai: Brain,
  gemini: Bot,
  supabase: Database,
};

export function Projects() {
  const { dict, localeSegment, lang } = useLanguage();
  const p = dict.projects;
  const descriptions: Record<string, string> = {
    saasStarter: p.saasStarterDesc,
    aiAutomations: p.aiAutomationsDesc,
  };

  return (
    <section
      id="projekty"
      key={`projects-${lang}`}
      className="relative my-24 border-t border-zinc-800 bg-black/20 px-5 py-16 pb-[max(2rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-6 md:py-24 md:pb-24"
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="projects-heading"
          className="mb-10 text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl"
        >
          {p.sectionTitle}
        </h2>

        {/* Fotarobota: compact split view — desktop 50/50 max-h 500px, mobile stacked image 16:9 */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          className="mb-10 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 shadow-xl backdrop-blur-md md:flex md:max-h-[500px] transition-shadow hover:shadow-emerald-500/10"
        >
          <div className="relative w-full shrink-0 aspect-video md:aspect-auto md:h-auto md:min-h-0 md:w-1/2 md:max-h-[500px]">
            <Image
              src="/fotarobota-preview.png"
              alt="Fotarobota"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/40" aria-hidden />
          </div>
          <div className="flex flex-col justify-center p-6 md:w-1/2 md:min-w-0">
            <span className="mb-2 inline-block w-fit rounded-full border border-emerald-500/60 bg-black/80 px-2.5 py-0.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.2em] text-emerald-200">
              {p.caseStudyTag}
            </span>
            <h3 className="text-xl font-semibold text-zinc-100 md:text-2xl">Fotarobota</h3>
            <p className="mt-1 font-mono text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              {p.fotarobotaSubtitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {p.fotarobotaDesc}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.fotarobotaTech.map((key) => {
                const Icon = techIcons[key];
                const label = p.techLabels[key] ?? key;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300"
                    title={label}
                  >
                    {Icon ? <Icon className="size-3.5 shrink-0 opacity-80" /> : null}
                    <span>{label}</span>
                  </span>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="default" size="sm" asChild>
                <a href="https://www.fotarobota.pl" target="_blank" rel="noopener noreferrer">
                  {p.visit}
                  <ExternalLink className="ml-1 size-4" />
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${localeSegment}/projekty/fotarobota`}>
                  {p.caseStudyCta}
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Other projects grid */}
        <div
          className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5"
          style={{ gridAutoRows: "minmax(140px, auto)", perspective: 1200 }}
        >
          {/* Wyróżniona karta: migracja WordPress → Next.js (zajawka bloga SEO) */}
          <Link
            href={`/${localeSegment}/blog/dlaczego-warto-porzucic-wordpress-dla-nextjs`}
            className="block h-full md:col-span-2"
          >
            <SpotlightCard accent="emerald" className="h-full transition-opacity hover:opacity-100">
              <CardHeader className="pb-2">
                <span className="mb-2 inline-block w-fit rounded-full border border-emerald-500/60 bg-black/80 px-2.5 py-0.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.2em] text-emerald-200">
                  {p.wpMigrationBadge}
                </span>
                <CardTitle className="text-lg font-semibold text-card-foreground md:text-xl">
                  {p.wpMigrationTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                  {p.wpMigrationDesc}
                </CardDescription>
                <p className="text-xs text-muted-foreground/90">{p.wpMigrationExtra}</p>
                <div className="flex flex-wrap gap-2">
                  {p.wpMigrationTech.map((key: string) => {
                    const Icon = techIcons[key as keyof typeof techIcons];
                    const label = p.techLabels[key as keyof typeof p.techLabels] ?? key;
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300"
                        title={label}
                      >
                        {Icon ? <Icon className="size-3.5 shrink-0 opacity-80" /> : null}
                        <span>{label}</span>
                      </span>
                    );
                  })}
                </div>
                <Button variant="default" size="sm" className="w-fit" asChild>
                  <span>
                    {p.wpMigrationCta}
                    <ArrowRight className="ml-1 size-4" />
                  </span>
                </Button>
              </CardContent>
            </SpotlightCard>
          </Link>

          {/* Quantum OM: Multi-Agent AI */}
          <Link
            href={`/${localeSegment}/projekty/quantum-om`}
            className="block h-full md:col-span-2"
          >
            <SpotlightCard accent="emerald" className="h-full transition-opacity hover:opacity-100">
              <CardHeader className="pb-2">
                <span className="mb-2 inline-block w-fit rounded-full border border-emerald-500/60 bg-black/80 px-2.5 py-0.5 font-mono text-[0.7rem] font-medium uppercase tracking-[0.2em] text-emerald-200">
                  {p.caseStudyTag}
                </span>
                <CardTitle className="text-lg font-semibold text-card-foreground md:text-xl">
                  Quantum OM
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                  {p.quantumOmDesc}
                </CardDescription>
                <p className="text-xs text-muted-foreground/90">{p.quantumOmSubtitle}</p>
                <div className="flex flex-wrap gap-2">
                  {p.quantumOmTech.map((key: string) => {
                    const Icon = techIcons[key as keyof typeof techIcons];
                    const label = p.techLabels[key as keyof typeof p.techLabels] ?? key;
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300"
                        title={label}
                      >
                        {Icon ? <Icon className="size-3.5 shrink-0 opacity-80" /> : null}
                        <span>{label}</span>
                      </span>
                    );
                  })}
                </div>
                <Button variant="default" size="sm" className="w-fit" asChild>
                  <span>
                    {p.caseStudyCta}
                    <ArrowRight className="ml-1 size-4" />
                  </span>
                </Button>
              </CardContent>
            </SpotlightCard>
          </Link>



        </div>
      </div>
    </section>
  );
}
