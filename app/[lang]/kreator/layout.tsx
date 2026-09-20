import type { Metadata } from "next";
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
  const canonical = `${SITE_URL}/${lang}/kreator`;
  return {
    title: t.kreatorTitle,
    description: t.kreatorDescription,
    alternates: {
      canonical,
      languages: languageAlternates("/kreator"),
    },
    openGraph: {
      title: t.kreatorTitle,
      description: t.kreatorDescription,
      url: canonical,
      siteName: "BALUNIAK.COM",
      locale: OG_LOCALE[locale],
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default function KreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
