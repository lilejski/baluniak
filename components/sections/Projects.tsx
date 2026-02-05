"use client";

import Link from "next/link";
import Image from "next/image";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "@/components/SpotlightCard";

const projects: Array<{
  title: string;
  description: string;
  href: string;
  externalUrl?: string;
  tag: string;
  span: string;
  placeholder?: boolean;
  /** Main card: show holographic preview image */
  featured?: boolean;
  /** Path to local preview image (e.g. /fotarobota-preview.png) */
  image?: string;
}> = [
  {
    title: "Fotarobota",
    description: "SaaS automation tool for photographers.",
    href: "/projekty/fotarobota",
    externalUrl: "https://www.fotarobota.pl",
    tag: "Case study",
    span: "md:col-span-2 md:row-span-2",
    featured: true,
    image: "/fotarobota-preview.png",
  },
  {
    title: "SaaS Starter Kit",
    description: "Next.js 15 Boilerplate.",
    href: "/projekty",
    tag: "Wkrótce",
    span: "md:col-span-1 md:row-span-1",
    placeholder: true,
  },
  {
    title: "AI Automations",
    description: "Custom workflows.",
    href: "/projekty",
    tag: "Wkrótce",
    span: "md:col-span-1 md:row-span-1",
    placeholder: true,
  },
];

export function Projects() {
  return (
    <section
      id="projekty"
      className="relative my-24 border-t border-white/10 bg-black/30 px-5 py-16 backdrop-blur-sm sm:px-6 md:py-24"
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="projects-heading"
          className="mb-10 text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl"
        >
          Projekty
        </h2>
        {/* Bento grid: CSS Grid with varied cell spans; perspective for 3D tilt */}
        <div
          className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5"
          style={{ gridAutoRows: "minmax(140px, auto)", perspective: 1200 }}
        >
          {projects.map((project) => (
            <SpotlightCard
              key={project.title}
              spanClassName={project.span}
              accent="emerald"
              className={cn(
                project.placeholder && "border-muted bg-muted/30 opacity-90",
                project.featured && "group"
              )}
            >
              {/* Holographic preview: image background + gradient overlay (featured with image) */}
              {project.featured && project.image && (
                <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    className="object-cover grayscale scale-95 transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
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
                      {project.tag}
                    </span>
                    <CardTitle className="mt-2 text-lg leading-none font-semibold text-card-foreground md:text-xl">
                      {project.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                  <CardDescription className="text-muted-foreground text-sm">
                    {project.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-3">
                    {project.externalUrl && (
                      <Button variant="default" size="sm" asChild className="bg-emerald-600 text-white hover:bg-emerald-500">
                        <a
                          href={project.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit
                          <ExternalLink className="ml-1 size-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={project.href}>
                        {project.placeholder ? "Wkrótce" : "Zobacz case study"}
                        <ArrowRight className="ml-1 size-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </div>
            </SpotlightCard>
          ))}
          {/* Bento cell: CTA to all projects */}
          <SpotlightCard
            spanClassName="md:col-span-2 md:row-span-1"
            accent="amber"
          >
            <CardContent className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <LayoutGrid className="size-10 text-muted-foreground" aria-hidden />
              <p className="text-sm font-medium text-muted-foreground">Wszystkie projekty</p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/projekty">
                  Zobacz listę
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
