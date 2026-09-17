"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { TechLine } from "@/components/ui/tech-line";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Projects() {
  const { dict, localeSegment, lang } = useLanguage();
  const p = dict.projects;

  const techLabels = (keys: readonly string[]) =>
    keys.map((key) => p.techLabels[key as keyof typeof p.techLabels] ?? key);

  return (
    <section
      id="projekty"
      key={`projects-${lang}`}
      className="relative border-t border-border bg-bg section-y pb-[max(4rem,env(safe-area-inset-bottom))]"
      aria-labelledby="projects-heading"
    >
      <div className="container-page">
        <SectionHeading id="projects-heading" title={p.sectionTitle} />

        {/* Fotarobota: image above the text on mobile, side by side from md */}
        <div className="card mt-10 overflow-hidden md:grid md:grid-cols-2">
          <div className="p-3 md:p-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border md:aspect-auto md:h-full md:min-h-[320px]">
              <Image
                src="/fotarobota-preview.webp"
                alt="Fotarobota"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center p-5 md:p-8">
            <p className="eyebrow">{p.caseStudyTag}</p>
            <h3 className="text-h3 mt-2">Fotarobota</h3>
            <p className="mt-1 text-sm text-fg-subtle">{p.fotarobotaSubtitle}</p>
            <p className="mt-3 text-base leading-relaxed text-fg-muted">{p.fotarobotaDesc}</p>
            <TechLine items={techLabels(p.fotarobotaTech)} className="mt-3" />
            <Button variant="secondary" size="sm" asChild className="mt-6 w-fit">
              <Link href={`/${localeSegment}/projekty/fotarobota`}>
                {p.caseStudyCta}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>

        {/* Other projects */}
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Featured article: moving off WordPress */}
          <Link
            href={`/${localeSegment}/blog/dlaczego-warto-porzucic-wordpress-dla-nextjs`}
            className="card card-interactive flex h-full flex-col p-5 md:p-7"
          >
            <p className="eyebrow">{p.wpMigrationBadge}</p>
            <h3 className="text-h3 mt-2">{p.wpMigrationTitle}</h3>
            <p className="mt-3 text-base leading-relaxed text-fg-muted">{p.wpMigrationDesc}</p>
            <p className="mt-2 text-sm text-fg-subtle">{p.wpMigrationExtra}</p>
            <TechLine items={techLabels(p.wpMigrationTech)} className="mt-3" />
            <div className="mt-auto pt-6">
              <Button variant="secondary" size="sm" className="w-fit" asChild>
                <span>
                  {p.wpMigrationCta}
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </Button>
            </div>
          </Link>

          {/* Quantum OM */}
          <Link
            href={`/${localeSegment}/projekty/quantum-om`}
            className="card card-interactive flex h-full flex-col p-5 md:p-7"
          >
            <p className="eyebrow">{p.caseStudyTag}</p>
            <h3 className="text-h3 mt-2">Quantum OM</h3>
            <p className="mt-3 text-base leading-relaxed text-fg-muted">{p.quantumOmDesc}</p>
            <p className="mt-2 text-sm text-fg-subtle">{p.quantumOmSubtitle}</p>
            <TechLine items={techLabels(p.quantumOmTech)} className="mt-3" />
            <div className="mt-auto pt-6">
              <Button variant="secondary" size="sm" className="w-fit" asChild>
                <span>
                  {p.caseStudyCta}
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </Button>
            </div>
          </Link>

          {/* Charon — full width */}
          <Link
            href={`/${localeSegment}/projekty/charon`}
            className="card card-interactive flex h-full flex-col p-5 md:col-span-2 md:p-7"
          >
            <p className="eyebrow">{p.caseStudyTag}</p>
            <h3 className="text-h3 mt-2">Charon</h3>
            <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-fg-muted">{p.charonDesc}</p>
            <p className="mt-2 text-sm text-fg-subtle">{p.charonSubtitle}</p>
            <TechLine items={techLabels(p.charonTech)} className="mt-3" />
            <div className="mt-auto pt-6">
              <Button variant="secondary" size="sm" className="w-fit" asChild>
                <span>
                  {p.caseStudyCta}
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
