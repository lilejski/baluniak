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
  const canonical = `${SITE_URL}/${lang}/projekty/quantum-om`;
  return {
    title: t.quantumOmTitle,
    description: t.quantumOmDescription,
    alternates: {
      canonical,
      languages: {
        pl: `${SITE_URL}/pl/projekty/quantum-om`,
        en: `${SITE_URL}/en/projekty/quantum-om`,
      },
    },
    openGraph: {
      title: t.quantumOmTitle,
      description: t.quantumOmDescription,
      url: canonical,
      siteName: "BALUNIAK.COM",
      locale: isPl ? "pl_PL" : "en_US",
      type: "article",
    },
    robots: { index: true, follow: true },
  };
}

export default function QuantumOmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
