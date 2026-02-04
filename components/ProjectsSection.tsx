import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const projects = [
  {
    title: "Fotarobota",
    description: "Case study: Problem → 80h Build → Result. Strona projektu z pełnym opisem i linkami.",
    href: "/projekty",
    externalUrl: "https://www.fotarobota.pl",
    tag: "Case study",
  },
] as const;

export function ProjectsSection() {
  return (
    <section
      id="projekty"
      className="relative border-t border-white/10 bg-black/30 px-4 py-16 backdrop-blur-sm md:py-24"
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          id="projects-heading"
          className="mb-10 text-2xl font-semibold tracking-tight text-zinc-100 md:text-3xl"
        >
          Projekty
        </h2>
        <ul className="grid gap-6 sm:grid-cols-1">
          {projects.map((project) => (
            <li key={project.title}>
              <Card className="border-white/10 bg-zinc-900/60 backdrop-blur-sm transition-colors hover:border-emerald-500/30 hover:bg-zinc-900/80">
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                  <div>
                    <span className="mb-2 inline-block rounded-md border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5 text-xs font-medium text-emerald-300">
                      {project.tag}
                    </span>
                    <CardTitle className="mt-2 text-lg text-zinc-100 md:text-xl">
                      {project.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-zinc-400">
                    {project.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm" asChild className="border-white/20 text-zinc-200 hover:bg-white/10 hover:text-zinc-100">
                      <Link href={project.href}>
                        Zobacz case study
                        <ArrowRight className="ml-1 size-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-emerald-400">
                      <a
                        href={project.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {project.externalUrl.replace(/^https?:\/\//, "")}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <Button variant="outline" asChild className="border-white/20 text-zinc-300 hover:bg-white/10 hover:text-zinc-100">
            <Link href="/projekty">Wszystkie projekty</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
