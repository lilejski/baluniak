"use client";

import Link from "next/link";
import { Calendar, Linkedin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FOOTER_COPY = {
  finalNudge: "Twój pomysł zasługuje na coś więcej niż tylko arkusz w Excelu.",
  ctaLabel: "Zamów wycenę MVP",
  brandTagline:
    "Pragmatyczny Product Engineering. Od pomysłu do produkcji w 80 godzin.",
  statusLabel: "Dostępny na nowe projekty",
  nav: [
    { label: "Projekty", href: "/projekty" },
    { label: "O mnie", href: "/#about" },
    { label: "Sklep", href: "/sklep" },
    { label: "Kreator", href: "/kreator" },
    { label: "Współpraca", href: "/wspolpraca" },
  ],
  consultationLabel: "Umów darmową konsultację",
  linkedinUrl: "https://www.linkedin.com/in/baluniak",
  email: "kontakt@baluniak.com",
} as const;

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-zinc-800 bg-zinc-950">
      {/* Final Nudge – full width above columns */}
      <div className="border-b border-zinc-800 px-5 py-10 sm:px-6 md:py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <p className="max-w-xl text-lg font-medium leading-relaxed text-zinc-200 text-balance md:text-xl">
            {FOOTER_COPY.finalNudge}
          </p>
          <Button
            asChild
            size="lg"
            className="min-h-12 bg-emerald-600 px-8 text-base font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-500"
          >
            <Link href="/kreator">
              {FOOTER_COPY.ctaLabel}
              <ArrowRight className="ml-2 size-5 shrink-0" />
            </Link>
          </Button>
        </div>
      </div>

      {/* 3 columns desktop / 1 column mobile */}
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 md:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {/* Col 1: Brand + status badge */}
          <div className="space-y-4">
            <p className="font-bold tracking-tight text-zinc-100">
              BALUNIAK.COM
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              {FOOTER_COPY.brandTagline}
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-300">
              <span
                className="size-2 animate-pulse rounded-full bg-emerald-400"
                aria-hidden
              />
              {FOOTER_COPY.statusLabel}
            </span>
          </div>

          {/* Col 2: Nawigacja */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Nawigacja
            </p>
            <ul className="space-y-2">
              {FOOTER_COPY.nav.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Kontakt */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Kontakt
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href={FOOTER_COPY.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
                >
                  <Linkedin className="size-4 shrink-0" />
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${FOOTER_COPY.email}`}
                  className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
                >
                  {FOOTER_COPY.email}
                </a>
              </li>
              <li className="pt-2">
                <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500">
                  <Link href="/wspolpraca">
                    <Calendar className="mr-2 size-4 shrink-0" />
                    {FOOTER_COPY.consultationLabel}
                  </Link>
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
