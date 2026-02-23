"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function SklepPage() {
  const { dict } = useLanguage();
  const s = dict.sklep;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-100">{s.pageTitle}</h1>
      <p className="mt-4 text-zinc-400">{s.pageSubtitle}</p>
    </main>
  );
}
