import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import type { Language } from "@/lib/translations";
import { translations } from "@/lib/translations";

const SUPPORTED_LANGS = ["pl", "en"] as const;
const SITE_URL = "https://baluniak.com";

function toLanguage(segment: string): Language {
  return segment === "en" ? "EN" : "PL";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!SUPPORTED_LANGS.includes(lang as (typeof SUPPORTED_LANGS)[number])) {
    return { title: "BALUNIAK" };
  }
  const t = translations[lang === "pl" ? "PL" : "EN"].seo;
  const canonical = `${SITE_URL}/${lang}`;
  const keywords =
    "homeKeywords" in t && typeof (t as { homeKeywords?: string }).homeKeywords === "string"
      ? (t as { homeKeywords: string }).homeKeywords
      : undefined;
  return {
    title: t.homeTitle,
    description: t.homeDescription,
    ...(keywords && { keywords: keywords.split(",").map((k) => k.trim()) }),
    alternates: {
      canonical,
      languages: { pl: `${SITE_URL}/pl`, en: `${SITE_URL}/en` },
    },
    openGraph: {
      title: t.homeTitle,
      description: t.homeDescription,
      url: canonical,
      siteName: "BALUNIAK.COM",
      locale: lang === "pl" ? "pl_PL" : "en_US",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!SUPPORTED_LANGS.includes(lang as (typeof SUPPORTED_LANGS)[number])) {
    notFound();
  }
  const initialLang = toLanguage(lang);

  return (
    <LanguageProvider initialLang={initialLang} localeSegment={lang}>
      <Navbar />
      <main className="pt-16 pb-[max(3rem,env(safe-area-inset-bottom))] md:pb-0">{children}</main>
      <Footer />
      <Analytics />
    </LanguageProvider>
  );
}
