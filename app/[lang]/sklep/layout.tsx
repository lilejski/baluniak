import type { Metadata } from "next";
import { translations } from "@/lib/translations";

const SITE_URL = "https://baluniak.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isPl = lang === "pl";
  const t = translations[isPl ? "PL" : "EN"].seo;
  const canonical = `${SITE_URL}/${lang}/sklep`;
  return {
    title: t.sklepTitle,
    description: t.sklepDescription,
    alternates: {
      canonical,
      languages: { pl: `${SITE_URL}/pl/sklep`, en: `${SITE_URL}/en/sklep` },
    },
    openGraph: {
      title: t.sklepTitle,
      description: t.sklepDescription,
      url: canonical,
      siteName: "BALUNIAK.COM",
      locale: isPl ? "pl_PL" : "en_US",
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
