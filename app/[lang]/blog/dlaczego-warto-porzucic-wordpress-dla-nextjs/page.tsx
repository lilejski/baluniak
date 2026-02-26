"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Clock, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const BADGES = ["Next.js", "SEO", "Wydajność"];

export default function BlogWpMigrationPlaceholderPage() {
  const { dict, localeSegment } = useLanguage();
  const backLabel = dict.fotarobotaPage?.backToProjects ?? "Wróć do projektów";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-5 pt-32 pb-16">
        {/* Nawigacja powrotu */}
        <div className="mb-10">
          <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-zinc-200">
            <Link href={`/${localeSegment}#projekty`} className="inline-flex items-center gap-2">
              <ArrowLeft className="size-4 shrink-0" />
              {backLabel}
            </Link>
          </Button>
        </div>

        {/* Header artykułu */}
        <header className="mb-12">
          <div className="mb-4 flex flex-wrap gap-2">
            {BADGES.map((label) => (
              <span
                key={label}
                className="rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-medium tracking-wide text-zinc-300"
              >
                {label}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 text-balance sm:text-4xl">
            Dlaczego warto porzucić WordPress dla Next.js?
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <Calendar className="size-4 shrink-0 text-zinc-500" aria-hidden />
              Kwiecień 2026
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-zinc-500" aria-hidden />
              Czas czytania: 5 min
            </span>
          </div>
        </header>

        {/* Placeholder treści z glow */}
        <div className="relative">
          {/* Subtelna poświata za boxem */}
          <div
            className="absolute -inset-4 -z-10 rounded-3xl opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative rounded-2xl border border-zinc-800/50 bg-zinc-900/20 p-8 text-center shadow-xl sm:p-12">
            <div className="flex flex-col items-center gap-6">
              <div
                className="flex size-14 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-800/30 text-zinc-400"
                aria-hidden
              >
                <PenTool className="size-7 animate-pulse" />
              </div>
              <p className="max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg">
                Artykuł w przygotowaniu. Pracuję nad szczegółowym zestawieniem wydajności i korzyści
                biznesowych z migracji na Next.js…
              </p>
              <p className="text-sm text-zinc-500">
                Wkrótce pełna treść — sprawdź ponownie za kilka dni.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
