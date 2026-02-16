"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function KreatorCTA() {
  const { dict, localeSegment } = useLanguage();
  const k = dict.kreator;

  return (
    <section
      id="kreator"
      className="scroll-mt-20 border-t border-white/10 bg-black/20 px-5 py-12 sm:px-6 md:py-16"
      aria-labelledby="kreator-heading"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="kreator-heading" className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
          {k.title}
        </h2>
        <p className="mt-2 text-sm text-zinc-400 sm:text-base">{k.subtitle}</p>
        <Button asChild size="lg" className="mt-6 min-h-12 bg-emerald-600 px-6 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-500">
          <Link href={`/${localeSegment}/kreator`}>
            {k.ctaButton}
            <ArrowRight className="ml-2 size-5 shrink-0" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
