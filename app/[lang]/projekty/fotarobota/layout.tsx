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
  const canonical = `${SITE_URL}/${lang}/projekty/fotarobota`;
  return {
    title: t.fotarobotaTitle,
    description: t.fotarobotaDescription,
    alternates: {
      canonical,
      languages: languageAlternates("/projekty/fotarobota"),
    },
    openGraph: {
      title: t.fotarobotaTitle,
      description: t.fotarobotaDescription,
      url: canonical,
      siteName: "BALUNIAK.COM",
      locale: OG_LOCALE[locale],
      type: "article",
    },
    robots: { index: true, follow: true },
  };
}

export default async function FotarobotaLayout({
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
          slug: "fotarobota",
          name: "Fotarobota",
          description: translations[toLanguage(locale)].seo.fotarobotaDescription,
          category: "MultimediaApplication",
        })}
      />
      {children}
    </>
  );
}
