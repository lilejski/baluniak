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

export function TechStackTrust() {
  const { dict } = useLanguage();
  const heading = dict.hero.techStackTrust;

  return (
    <section
      className="relative z-10 border-y border-white/5 bg-zinc-950/50 py-8 sm:py-10"
      aria-label={heading}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-zinc-500 sm:mb-8">
          {heading}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-12 md:gap-x-14">
          {LOGOS.map(({ name, href, icon: Icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 opacity-60 transition-opacity duration-200 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-zinc-950"
              aria-label={name}
            >
              <Icon className="size-5 sm:size-6 text-zinc-400" aria-hidden />
              <span className="font-sans text-sm font-semibold tracking-tight text-zinc-300">{name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
