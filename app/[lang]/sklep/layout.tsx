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
  const canonical = `${SITE_URL}/${lang}/sklep`;
  return {
    title: t.sklepTitle,
    description: t.sklepDescription,
    alternates: {
      canonical,
      languages: languageAlternates("/sklep"),
    },
    openGraph: {
      title: t.sklepTitle,
      description: t.sklepDescription,
      url: canonical,
      siteName: "BALUNIAK.COM",
      locale: OG_LOCALE[locale],
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default function SklepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
