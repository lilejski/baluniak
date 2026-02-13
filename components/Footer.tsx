"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Linkedin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { dict, lang } = useLanguage();
  const copy = dict.footer;

  return (
    <footer className="relative z-10 border-t border-zinc-800 bg-zinc-950">
      <div className="border-b border-zinc-800 px-5 py-10 sm:px-6 md:py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <motion.p
            key={lang}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="max-w-xl text-lg font-medium leading-relaxed text-zinc-200 text-balance md:text-xl"
          >
            {copy.finalNudge}
          </motion.p>
          <Button
            asChild
            size="lg"
            className="min-h-12 bg-emerald-600 px-8 text-base font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-500"
          >
            <Link href="/kreator">
              {copy.ctaLabel}
              <ArrowRight className="ml-2 size-5 shrink-0" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 md:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          <div className="space-y-4">
            <p className="font-bold tracking-tight text-zinc-100">
              BALUNIAK.COM
            </p>
            <motion.p
              key={`tagline-${lang}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-sm leading-relaxed text-zinc-400"
            >
              {copy.brandTagline}
            </motion.p>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-300">
              <span
                className="size-2 animate-pulse rounded-full bg-emerald-400"
                aria-hidden
              />
              {copy.statusLabel}
            </span>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {copy.navTitle}
            </p>
            <ul className="space-y-2">
              {copy.nav.map(({ label, href }) => (
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

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {copy.contactTitle}
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href={copy.linkedinUrl}
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
                  href={`mailto:${copy.email}`}
                  className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
                >
                  {copy.email}
                </a>
              </li>
              <li className="pt-2">
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-500">
                  <Link href="/wspolpraca">
                    <Calendar className="mr-2 size-4 shrink-0" />
                    {copy.consultationLabel}
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
