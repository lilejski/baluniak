"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function SklepPage() {
  const { dict } = useLanguage();
  const s = dict.sklep;

  return (
    <main className="container-narrow page-top">
      <h1 className="text-h1">{s.pageTitle}</h1>
      <p className="text-lead mt-4 text-fg-muted">{s.pageSubtitle}</p>
    </main>
  );
}
