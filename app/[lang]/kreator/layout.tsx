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
  const canonical = `${SITE_URL}/${lang}/kreator`;
  return {
    title: t.kreatorTitle,
    description: t.kreatorDescription,
    alternates: {
      canonical,
      languages: { pl: `${SITE_URL}/pl/kreator`, en: `${SITE_URL}/en/kreator` },
    },
    openGraph: {
      title: t.kreatorTitle,
      description: t.kreatorDescription,
      url: canonical,
      siteName: "BALUNIAK.COM",
      locale: isPl ? "pl_PL" : "en_US",
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
