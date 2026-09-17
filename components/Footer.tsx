"use client";

import Link from "next/link";
import { Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { dict, localeSegment } = useLanguage();
  const copy = dict.footer;

  return (
    <>
      {/* Pre-Footer CTA */}
      <section
        className="relative border-t border-border bg-bg section-y print:hidden"
        aria-labelledby="prefooter-cta-heading"
      >
        <div className="container-page flex flex-col items-center">
          <SectionHeading
            id="prefooter-cta-heading"
            align="center"
            title={copy.preCtaHeader}
            lead={copy.preCtaSubtext}
          />
          <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
            <Link href={`/${localeSegment}/kreator`}>
              {copy.preCtaButton}
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer — 3-column grid */}
      <footer className="relative border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] print:hidden">
        <div className="container-page py-12 md:py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {/* Col 1: Brand + tagline */}
            <div className="space-y-3">
              <p className="font-display text-lg font-semibold tracking-tight text-fg">
                BALUNIAK.COM
              </p>
              <p className="max-w-[38ch] text-[0.9375rem] leading-relaxed text-fg-muted">
                {copy.productEngineerTagline}
              </p>
              <p className="max-w-[38ch] text-sm leading-relaxed text-fg-subtle">
                {copy.brandTagline}
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <p className="eyebrow-muted mb-2">{copy.navTitle}</p>
              <ul>
                {copy.quickLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={`/${localeSegment}${item.href}`}
                      className="inline-flex min-h-11 items-center text-[0.9375rem] text-fg-muted transition-colors hover:text-fg"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Social + Email */}
            <div>
              <p className="eyebrow-muted mb-2">{copy.contactTitle}</p>
              <div className="flex flex-wrap items-center">
                <a
                  href={copy.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="-ml-3 inline-flex size-11 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="size-5" strokeWidth={1.5} />
                </a>
              </div>
              <p>
                <a
                  href={`mailto:${copy.email}`}
                  className="inline-flex min-h-11 items-center text-[0.9375rem] text-fg-muted transition-colors hover:text-fg"
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
