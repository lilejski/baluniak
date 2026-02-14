"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProjektyPage() {
  const { dict, localeSegment } = useLanguage();
  const proj = dict.projektyPage;
  const p = dict.projects;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-100">{proj.title}</h1>
      <p className="mt-2 text-zinc-500">
        {proj.subtitle}
      </p>

      {/* Segment: Fotarobota */}
      <article className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 shadow-xl">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="relative aspect-video md:aspect-auto md:min-h-[280px]">
            <Image
              src="/fotarobota-preview.png"
              alt="Fotarobota"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-transparent to-transparent md:bg-gradient-to-r" />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-8">
            <span className="mb-2 inline-block w-fit rounded-full border border-emerald-400/60 bg-emerald-950/40 px-3 py-1 text-xs font-medium uppercase tracking-wider text-emerald-300">
              {proj.caseStudyTag}
            </span>
            <h2 className="text-xl font-semibold text-zinc-100 md:text-2xl">
              Fotarobota
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {p.fotarobotaDesc}
            </p>
            <a
              href="https://www.fotarobota.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              www.fotarobota.pl
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </article>

      <p className="mt-8 text-center text-sm text-zinc-500">
        <Link href={`/${localeSegment}/#projekty`} className="text-zinc-400 hover:text-zinc-300">
          {dict.fotarobotaPage.backToProjectsHome}
        </Link>
      </p>
    </main>
  );
}
