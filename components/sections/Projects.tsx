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
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "@/components/SpotlightCard";

const projectMeta: Array<{
  titleKey: "fotarobota" | "saasStarter" | "aiAutomations";
  title: string;
  href: string;
  externalUrl?: string;
  span: string;
  placeholder?: boolean;
  featured?: boolean;
  image?: string;
}> = [
  {
    titleKey: "fotarobota",
    title: "Fotarobota",
    href: "/projekty/fotarobota",
    externalUrl: "https://www.fotarobota.pl",
    span: "md:col-span-2 md:row-span-2",
    featured: true,
    image: "/fotarobota-preview.png",
  },
  {
    titleKey: "saasStarter",
    title: "SaaS Starter Kit",
    href: "/projekty",
    span: "md:col-span-1 md:row-span-1",
    placeholder: true,
  },
  {
    titleKey: "aiAutomations",
    title: "AI Automations",
    href: "/projekty",
    span: "md:col-span-1 md:row-span-1",
    placeholder: true,
  },
];

const techIcons: Record<string, ComponentType<{ className?: string }>> = {
  nextjs: Layout,
  falai: Cpu,
  vercel: Cloud,
  posthog: BarChart2,
};

export function Projects() {
  const { dict, localeSegment, lang } = useLanguage();
  const p = dict.projects;
  const descriptions: Record<string, string> = {
    fotarobota: p.fotarobotaDesc,
    saasStarter: p.saasStarterDesc,
    aiAutomations: p.aiAutomationsDesc,
  };
  /** Projects with Problem/Solution/Result copy (typed keys, no Record cast). */
  const hasNarrative = (key: string): key is "fotarobota" => key === "fotarobota";

  return (
    <section
      id="projekty"
      key={`projects-${lang}`}
      className="relative my-24 border-t border-white/10 bg-black/30 px-5 py-16 pb-[max(2rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-6 md:py-24 md:pb-24"
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="projects-heading"
          className="mb-10 text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl"
        >
          {p.sectionTitle}
        </h2>
        {/* Bento grid: CSS Grid with varied cell spans; perspective for 3D tilt */}
        <div
          className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5"
          style={{ gridAutoRows: "minmax(140px, auto)", perspective: 1200 }}
        >
          {projectMeta.map((project) => (
            <SpotlightCard
              key={project.title}
              spanClassName={project.span}
              accent="emerald"
              className={cn(
                project.placeholder && "border-muted bg-muted/30 opacity-90",
                project.featured && "group"
              )}
            >
              {project.featured && project.image && (
                <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    className="object-cover scale-95 transition-all duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" aria-hidden />
                </div>
              )}
              {/* Fallback: gradient + title on hover when featured but no image */}
              {project.featured && !project.image && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-zinc-900/90 to-zinc-950/95"
                    style={{ backgroundImage: "linear-gradient(135deg, rgba(6,78,59,0.4) 0%, rgba(24,24,27,0.9) 50%, rgba(9,9,11,0.95) 100%)" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-[var(--font-vt323)] text-6xl tracking-tighter text-emerald-400/30 md:text-7xl">
                      {project.title}
                    </span>
                  </div>
                </div>
              )}
              <div className={cn("relative z-10 flex flex-1 flex-col", project.featured && "min-h-[200px] md:min-h-[280px]")}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                  <div>
                    <span
                      className={cn(
                        "mb-2 inline-block rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-[0.16em]",
                        project.placeholder
                          ? "border-amber-400/80 bg-black/80 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.45)]"
                          : "border-emerald-400/80 bg-black/80 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      )}
                    >
                      {project.placeholder ? p.comingSoon : p.caseStudyTag}
                    </span>
                    <CardTitle className="mt-2 text-lg leading-none font-semibold text-card-foreground md:text-xl">
                      {project.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                  {hasNarrative(project.titleKey) ? (
                    <>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-semibold uppercase tracking-wider text-zinc-500">
                            {p.problemLabel}
                          </span>
                          <p className="mt-0.5 text-muted-foreground">
                            {p.fotarobotaProblem}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold uppercase tracking-wider text-zinc-500">
                            {p.solutionLabel}
                          </span>
                          <p className="mt-0.5 text-muted-foreground">
                            {p.fotarobotaSolution}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold uppercase tracking-wider text-zinc-500">
                            {p.resultLabel}
                          </span>
                          <p className="mt-0.5 text-muted-foreground">
                            {p.fotarobotaResult}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold uppercase tracking-wider text-zinc-500">
                            {p.metricsLabel}
                          </span>
                          <p className="mt-0.5 text-muted-foreground">
                            {p.fotarobotaMetrics}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
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
                    </>
                  ) : (
                    <CardDescription className="text-muted-foreground text-sm">
                      {descriptions[project.titleKey]}
                    </CardDescription>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {project.externalUrl && (
                      <Button variant="default" size="sm" asChild className="bg-emerald-600 text-white hover:bg-emerald-500">
                        <a
                          href={project.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {p.visit}
                          <ExternalLink className="ml-1 size-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${localeSegment}${project.href}`}>
                        {project.placeholder ? p.comingSoon : p.caseStudyCta}
                        <ArrowRight className="ml-1 size-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </div>
            </SpotlightCard>
          ))}
          <SpotlightCard
            spanClassName="md:col-span-2 md:row-span-1"
            accent="amber"
          >
            <CardContent className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <LayoutGrid className="size-10 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium text-muted-foreground">{p.allProjects}</p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${localeSegment}/projekty`}>
                  {p.viewList}
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </CardContent>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
