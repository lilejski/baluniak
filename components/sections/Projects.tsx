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

const otherProjectsMeta: Array<{
  titleKey: "saasStarter" | "aiAutomations";
  title: string;
  href: string;
  span: string;
  placeholder: boolean;
}> = [
  { titleKey: "saasStarter", title: "SaaS Starter Kit", href: "#projekty", span: "md:col-span-1", placeholder: true },
  { titleKey: "aiAutomations", title: "AI Automations", href: "#projekty", span: "md:col-span-1", placeholder: true },
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
    saasStarter: p.saasStarterDesc,
    aiAutomations: p.aiAutomationsDesc,
  };

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

        {/* Fotarobota: compact split view — desktop 50/50 max-h 500px, mobile stacked image 16:9 */}
        <div className="mb-10 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/50 shadow-xl md:flex md:max-h-[500px]">
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
            <span className="mb-2 inline-block w-fit rounded-full border border-emerald-400/80 bg-black/80 px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-emerald-200">
              {p.caseStudyTag}
            </span>
            <h3 className="text-xl font-semibold text-zinc-100 md:text-2xl">Fotarobota</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
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
              <Button variant="default" size="sm" asChild className="bg-emerald-600 text-white hover:bg-emerald-500">
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
        </div>

        {/* Other projects grid */}
        <div
          className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5"
          style={{ gridAutoRows: "minmax(140px, auto)", perspective: 1200 }}
        >
          {otherProjectsMeta.map((project) => (
            <SpotlightCard
              key={project.title}
              spanClassName={project.span}
              accent="emerald"
              className={project.placeholder ? "border-muted bg-muted/30 opacity-90" : undefined}
            >
              <CardHeader className="pb-2">
                <span className="mb-2 inline-block rounded-full border border-amber-400/80 bg-black/80 px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-amber-200">
                  {p.comingSoon}
                </span>
                <CardTitle className="text-lg font-semibold text-card-foreground md:text-xl">
                  {project.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                <CardDescription className="text-muted-foreground text-sm">
                  {descriptions[project.titleKey]}
                </CardDescription>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${localeSegment}${project.href}`}>
                    {p.comingSoon}
                    <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </CardContent>
            </SpotlightCard>
          ))}
          <SpotlightCard spanClassName="md:col-span-2 md:row-span-1" accent="amber">
            <CardContent className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <LayoutGrid className="size-10 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium text-muted-foreground">{p.allProjects}</p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${localeSegment}#projekty`}>
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
