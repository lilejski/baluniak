"use client";

import { useLanguage } from "@/contexts/LanguageContext";

import { Cloud, Cpu, Database, Layout, Palette, CreditCard } from "lucide-react";

const LOGOS = [
  { name: "Next.js", href: "https://nextjs.org", icon: Layout },
  { name: "Vercel", href: "https://vercel.com", icon: Cloud },
  { name: "Stripe", href: "https://stripe.com", icon: Database },
  { name: "Autopay", href: "https://autopay.pl", icon: CreditCard },
  { name: "OpenAI", href: "https://openai.com", icon: Cpu },
  { name: "Supabase", href: "https://supabase.com", icon: Database },
  { name: "Tailwind CSS", href: "https://tailwindcss.com", icon: Palette },
] as const;

/** A quiet line of names — present for anyone who looks, never competing with the hero. */
export function TechStackTrust() {
  const { dict } = useLanguage();
  const heading = dict.hero.techStackTrust;

  return (
    <section
      className="relative border-y border-border bg-bg py-8 sm:py-10"
      aria-label={heading}
    >
      <div className="container-page">
        <p className="eyebrow-muted mb-4 text-center">
          {heading}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 sm:gap-x-8">
          {LOGOS.map(({ name, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-sm font-medium text-fg-subtle transition-colors hover:text-fg-muted"
              aria-label={name}
            >
              {name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
