import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GoogleAnalytics } from "@/components/Analytics";
import { AttributionCapture } from "@/components/AttributionCapture";
import { Analytics } from "@vercel/analytics/next";
import type { Language } from "@/lib/translations";
import { translations } from "@/lib/translations";

const SUPPORTED_LANGS = ["pl", "en"] as const;
const SITE_URL = "https://baluniak.com";

/**
 * The card social networks and chat apps show when someone shares a link.
 * Without one they scrape whatever image they can find on the page — which
 * was the logo SVG, rendered on white and awkwardly cropped.
 */
const OG_IMAGE = {
  url: `${SITE_URL}/og-baluniak.png`,
  width: 1200,
  height: 630,
  alt: "Łukasz Bałuniak — strony, sklepy i systemy dla firm",
};

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
      languages: {
        pl: `${SITE_URL}/pl`,
        en: `${SITE_URL}/en`,
        "pl-PL": `${SITE_URL}/pl`,
        "en-US": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title: t.homeTitle,
      description: t.homeDescription,
      url: canonical,
      siteName: "BALUNIAK.COM",
      locale: lang === "pl" ? "pl_PL" : "en_US",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: t.homeTitle,
      description: t.homeDescription,
      images: [OG_IMAGE.url],
    },
    robots: { index: true, follow: true },
    icons: {
      icon: [
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        {
          rel: "android-chrome-192x192",
          url: "/android-chrome-192x192.png",
        },
        {
          rel: "android-chrome-512x512",
          url: "/android-chrome-512x512.png",
        },
      ],
    },
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

  // <html> and <body> belong to the root layout alone. Rendering them here as
  // well produced nested documents, which broke hydration on every page.
  return (
    <LanguageProvider initialLang={initialLang} localeSegment={lang}>
      <Navbar />
      <main className="pt-16 pb-[max(3rem,env(safe-area-inset-bottom))] md:pb-0">{children}</main>
      <Footer />
      <Analytics />
      <GoogleAnalytics />
      <AttributionCapture />
    </LanguageProvider>
  );
}
