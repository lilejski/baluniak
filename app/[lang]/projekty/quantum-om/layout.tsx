import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { caseStudyJsonLd } from "@/lib/structured-data";
import { translations } from "@/lib/translations";
import { isLocale, languageAlternates, OG_LOCALE, SITE_URL, toLanguage } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "pl";
  const t = translations[toLanguage(locale)].seo;
  const canonical = `${SITE_URL}/${lang}/projekty/quantum-om`;
  return {
    title: t.quantumOmTitle,
    description: t.quantumOmDescription,
    alternates: {
      canonical,
      languages: languageAlternates("/projekty/quantum-om"),
    },
    openGraph: {
      title: t.quantumOmTitle,
      description: t.quantumOmDescription,
      url: canonical,
      siteName: "BALUNIAK.COM",
      locale: OG_LOCALE[locale],
      type: "article",
    },
    robots: { index: true, follow: true },
  };
}

export default async function QuantumOmLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "pl";
  return (
    <>
      <JsonLd
        data={caseStudyJsonLd({
          lang: locale,
          slug: "quantum-om",
          name: "Quantum OM",
          description: translations[toLanguage(locale)].seo.quantumOmDescription,
          category: "FinanceApplication",
        })}
      />
      {children}
    </>
  );
}
