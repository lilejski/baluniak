"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Linkedin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { dict, localeSegment } = useLanguage();
  const copy = dict.footer;

  return (
    <>
      {/* Pre-Footer CTA */}
      <section
        className="relative z-10 border-t border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 px-5 py-14 sm:px-6 md:py-16 print:hidden"
        aria-labelledby="prefooter-cta-heading"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="prefooter-cta-heading"
            className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl"
          >
            {copy.preCtaHeader}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-zinc-400 sm:text-lg">
            {copy.preCtaSubtext}
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              className="min-h-14 min-w-[220px] bg-emerald-600 px-8 text-base font-semibold text-emerald-50 shadow-[0_0_24px_rgba(16,185,129,0.35)] hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_28px_rgba(16,185,129,0.4)]"
            >
              <Link href={`/${localeSegment}/kreator`}>
                {copy.preCtaButton}
                <ArrowRight className="ml-2 size-5 shrink-0" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer — 3-column grid */}
      <footer className="relative z-10 border-t border-zinc-800 bg-zinc-950 pb-[env(safe-area-inset-bottom)] print:hidden">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 md:py-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {/* Col 1: Brand + tagline */}
            <div className="space-y-3">
              <p className="font-bold tracking-tight text-zinc-100">
                BALUNIAK.COM
              </p>
              <p className="text-sm font-medium text-emerald-400/90">
                {copy.productEngineerTagline}
              </p>
              <motion.p
                layout
                className="text-sm leading-relaxed text-zinc-500"
              >
                {copy.brandTagline}
              </motion.p>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {copy.navTitle}
              </p>
              <ul className="space-y-2">
                {copy.quickLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={`/${localeSegment}${item.href}`}
                      className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Social + Email */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {copy.contactTitle}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={copy.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="size-5" />
                </a>
              </div>
              <p className="mt-4">
                <a
                  href={`mailto:${copy.email}`}
                  className="text-sm text-zinc-400 transition-colors hover:text-emerald-400"
                >
                  {copy.email}
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
