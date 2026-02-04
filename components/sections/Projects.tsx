"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const beamVariants = {
  rest: { rotate: 0 },
  hover: { rotate: 360 },
};
const beamTransition = { duration: 3, repeat: Infinity, ease: "linear" } as const;
const glowVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1 },
};
const tiltVariants = {
  rest: { rotateX: 0, rotateY: 0 },
  hover: { rotateX: -2, rotateY: 2 },
};
const tiltTransition = { type: "tween", duration: 0.2 } as const;

const projects: Array<{
  title: string;
  description: string;
  href: string;
  externalUrl?: string;
  tag: string;
  span: string;
  placeholder?: boolean;
  /** Main card: show hover-reveal image */
  featured?: boolean;
}> = [
  {
    title: "Fotarobot",
    description: "SaaS automation tool for photographers.",
    href: "/projekty",
    externalUrl: "https://www.fotarobota.pl",
    tag: "Case study",
    span: "md:col-span-2 md:row-span-2",
    featured: true,
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
      className="relative my-24 border-t border-white/10 bg-black/30 px-4 py-16 backdrop-blur-sm md:py-24"
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
            <motion.div
              key={project.title}
              className={cn("relative overflow-hidden", project.span)}
              initial="rest"
              whileHover="hover"
              variants={tiltVariants}
              transition={tiltTransition}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Border beam: rotating gradient, reveals on hover */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -inset-[2px] z-0 rounded-xl"
                style={{
                  background: "conic-gradient(from 0deg, transparent 0deg 180deg, rgba(16,185,129,0.4) 200deg 280deg, transparent 320deg)",
                }}
                variants={beamVariants}
                transition={beamTransition}
              />
              {/* Subtle glow ring on hover */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -inset-[1px] z-0 rounded-xl opacity-0"
                style={{ boxShadow: "0 0 20px 1px rgba(16,185,129,0.18)" }}
                variants={glowVariants}
                transition={{ duration: 0.25 }}
              />
              <Card
                className={cn(
                  "relative z-10 m-[2px] overflow-hidden border-border bg-card text-card-foreground shadow-sm backdrop-blur-sm transition-colors",
                  project.placeholder && "border-muted bg-muted/30 opacity-90",
                  project.featured && "group"
                )}
              >
              {/* Placeholder image: reveals on hover (featured card only) */}
              {project.featured && (
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
                        "mb-2 inline-block rounded-md border px-2 py-0.5 text-xs font-medium",
                        project.placeholder
                          ? "border-amber-500/30 bg-amber-950/40 text-amber-300"
                          : "border-emerald-500/30 bg-emerald-950/40 text-emerald-300"
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
            </Card>
            </motion.div>
          ))}
          {/* Bento cell: CTA to all projects (Shadcn Card base) */}
          <motion.div
            className="relative overflow-hidden md:col-span-2 md:row-span-1"
            initial="rest"
            whileHover="hover"
            variants={tiltVariants}
            transition={tiltTransition}
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -inset-[2px] z-0 rounded-xl"
              style={{
                background: "conic-gradient(from 0deg, transparent 0deg 180deg, rgba(245,158,11,0.35) 200deg 280deg, transparent 320deg)",
              }}
              variants={beamVariants}
              transition={beamTransition}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -inset-[1px] z-0 rounded-xl opacity-0"
              style={{ boxShadow: "0 0 20px 1px rgba(245,158,11,0.15)" }}
              variants={glowVariants}
              transition={{ duration: 0.25 }}
            />
            <Card className="relative z-10 m-[2px] border-border bg-card text-card-foreground shadow-sm backdrop-blur-sm">
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
          </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
