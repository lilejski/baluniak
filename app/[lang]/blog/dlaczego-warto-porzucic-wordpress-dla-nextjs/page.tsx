"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Rocket, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BlogWpMigrationPage() {
  const { lang, localeSegment, dict } = useLanguage();
  const isPl = lang === "PL";

  const content = {
    backLabel: isPl ? "Wróć do projektów" : "Back to projects",
    date: isPl ? "Kwiecień 2026" : "April 2026",
    readTime: isPl ? "Czas czytania: 5 min" : "Read time: 5 min",
    badges: ["Next.js", "SEO", "Performance", "Security"],
    title: isPl
      ? "Dlaczego warto porzucić WordPress dla Next.js?"
      : "Why you should ditch WordPress for Next.js?",
    intro: isPl
      ? "WordPress był rewolucją dekadę temu. Dzisiaj jest synonimem powolnego ładowania, niekończących się aktualizacji wtyczek i problemów z bezpieczeństwem. W dobie mobile-first, ułamki sekund decydują o tym, czy klient zostanie na Twojej stronie. Oto dlaczego liderzy rynku przechodzą na Next.js."
      : "WordPress was a revolution a decade ago. Today, it's synonymous with slow loading times, endless plugin updates, and security vulnerabilities. In the mobile-first era, fractions of a second decide whether a client stays on your site. Here is why market leaders are migrating to Next.js.",
    sections: [
      {
        icon: Zap,
        title: isPl ? "1. Prędkość, która konwertuje" : "1. Speed that converts",
        body: isPl
          ? "Strony na WordPressie muszą polegać na ciężkich serwerach i pamięci podręcznej, aby działać znośnie. Next.js generuje strony z wyprzedzeniem (SSG/ISR) i dostarcza je przez globalną sieć CDN (Edge). Efekt? Twoja strona ładuje się w milisekundach niezależnie od tego, czy użytkownik jest z Warszawy czy z Nowego Jorku. Szybsze ładowanie to mniejszy współczynnik odrzuceń i wyższa sprzedaż."
          : "WordPress sites rely on heavy servers and caching just to be bearable. Next.js generates pages in advance (SSG/ISR) and delivers them through a global CDN. The result? Your site loads in milliseconds regardless of where the user is located. Unmatched speed means lower bounce rates and higher sales.",
      },
      {
        icon: ShieldCheck,
        title: isPl ? "2. Odporność na ataki i brak wtyczek" : "2. Bulletproof security and no plugins",
        body: isPl
          ? "WordPress napędza ogromną część internetu, co czyni go celem numer jeden dla hakerów. Jedna nieaktualna wtyczka potrafi położyć cały biznes. Next.js to architektura 'headless'. Brak bezpośredniego połączenia z otwartą bazą danych i logiką serwera eliminuje klasy ataków typowe dla WP. Brak ciągłego martwienia się o aktualizacje."
          : "WordPress powers a massive chunk of the internet, making it the number one target for hackers. One outdated plugin can crash your entire business. Next.js is built on a 'headless' architecture. The separation of frontend and backend eliminates entire classes of attacks common to WP. No more stressful plugin updates.",
      },
      {
        icon: Rocket,
        title: isPl ? "3. Skalowalność bez granic" : "3. Limitless scalability",
        body: isPl
          ? "Wraz z rosnącym biznesem, WP zaczyna przypominać zamek z kart. Próba wdrożenia unikalnej bazy danych, płatności SaaS czy własnego modelu AI? Często kończy się drogim kodowaniem i wolnym działaniem. Next.js i ekosystem Reacta stworzono do budowy systemów, które mogą obsługiwać miliony użytkowników i bezproblemowo integrować nowoczesne API."
          : "As your business grows, WP starts looking like a house of cards. Trying to implement a custom database, SaaS payments, or AI integration? It often ends in expensive, messy code and slow performance. Next.js and the React ecosystem were designed to build systems that easily scale to millions of users and seamlessly integrate modern APIs.",
      },
    ],
    conclusionTitle: isPl ? "Podsumowanie" : "Conclusion",
    conclusionBody: isPl
      ? "Przejście na nowoczesny stack (Next.js, Vercel, Tailwind) to nie koszt, to inwestycja w stabilność, wyniki SEO i świetne doświadczenie użytkownika. Nie pozwól, by pofragmentowana technologia sprzed lat spowalniała Twój rozwój."
      : "Migrating to a modern stack (Next.js, Vercel, Tailwind) isn't an expense, it's an investment in stability, top-tier SEO, and a flawless user experience. Don't let fragmented legacy technology slow down your growth.",
    ctaTitle: isPl ? "Twój projekt zasługuje na najlepszą technologię." : "Your project deserves the best technology.",
    ctaText: isPl
      ? "Chcesz przenieść swój WordPress na nowoczesną, ultraszybką architekturę lub zbudować zupełnie nową aplikację od zera? Umów się na darmową konsultację i sprawdźmy potencjał Twojego biznesu."
      : "Ready to migrate your WordPress site to a blazing-fast architecture, or build a brand-new app from scratch? Book a free consultation and let's unlock your business potential.",
    ctaButton: dict.footer?.consultationLabel ?? (isPl ? "Umów darmową konsultację" : "Book a free consultation"),
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-5 pt-32 pb-24">
        {/* Nawigacja powrotu */}
        <div className="mb-10">
          <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-zinc-200">
            <Link href={`/${localeSegment}#projekty`} className="inline-flex items-center gap-2">
              <ArrowLeft className="size-4 shrink-0" />
              {content.backLabel}
            </Link>
          </Button>
        </div>

        {/* Header artykułu */}
        <header className="mb-12">
          <div className="mb-4 flex flex-wrap gap-2">
            {content.badges.map((label) => (
              <span
                key={label}
                className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[0.65rem] font-medium tracking-widest uppercase text-emerald-300 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]"
              >
                {label}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl md:text-5xl lg:leading-[1.15]">
            {content.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <Calendar className="size-4 shrink-0 text-zinc-500" aria-hidden />
              {content.date}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-zinc-500" aria-hidden />
              {content.readTime}
            </span>
          </div>
        </header>

        {/* Treść asrykulu */}
        <article className="prose prose-zinc prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-zinc-300">
            {content.intro}
          </p>

          <div className="my-12 space-y-12">
            {content.sections.map((sec, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-6">
                <div className="shrink-0">
                  <div className="flex size-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-950/30 text-emerald-400 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.1)]">
                    <sec.icon className="size-7" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-zinc-100 mb-3 mt-0">
                    {sec.title}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed m-0">
                    {sec.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-2xl font-bold text-zinc-100 border-t border-white/10 pt-8">
            {content.conclusionTitle}
          </h3>
          <p className="text-zinc-400 leading-relaxed">
            {content.conclusionBody}
          </p>
        </article>

        {/* Call To Action */}
        <div className="relative mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-xl md:p-12 text-center">
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-black/40" />
          <div className="relative z-10 flex flex-col items-center">
            <h4 className="mb-4 text-2xl font-bold text-zinc-100">{content.ctaTitle}</h4>
            <p className="mb-8 max-w-xl text-sm leading-relaxed text-zinc-400">
              {content.ctaText}
            </p>
            <Button size="lg" asChild className="ring-1 ring-white/10 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_-10px_rgba(16,185,129,0.5)] transition-shadow">
              <Link href={`/${localeSegment}#contact`}>
                {content.ctaButton}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
