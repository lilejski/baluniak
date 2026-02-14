import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import type { Language } from "@/lib/translations";

const SUPPORTED_LANGS = ["pl", "en"] as const;

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
    return { title: "baluniak" };
  }
  const isPl = lang === "pl";
  return {
    title: isPl
      ? "baluniak — Product Engineer | MVP w 80h | Projekty, współpraca"
      : "baluniak — Product Engineer | MVP in 80h | Projects, collaboration",
    description: isPl
      ? "Projekty, sklep, współpraca. Pragmatyczny Product Engineering. Od pomysłu do produkcji w 80 godzin."
      : "Projects, shop, collaboration. Pragmatic Product Engineering. From idea to production in 80 hours.",
    alternates: {
      canonical: `https://baluniak.com/${lang}`,
      languages: { pl: "https://baluniak.com/pl", en: "https://baluniak.com/en" },
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

  return (
    <LanguageProvider initialLang={initialLang} localeSegment={lang}>
      <Navbar />
      <main className="pt-16 pb-[max(3rem,env(safe-area-inset-bottom))] md:pb-0">{children}</main>
      <Footer />
      <Analytics />
    </LanguageProvider>
  );
}
