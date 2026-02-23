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
  const canonical = `${SITE_URL}/${lang}/projekty/fotarobota`;
  return {
    title: t.fotarobotaTitle,
    description: t.fotarobotaDescription,
    alternates: {
      canonical,
      languages: { pl: `${SITE_URL}/pl/projekty/fotarobota`, en: `${SITE_URL}/en/projekty/fotarobota` },
    },
    openGraph: {
      title: t.fotarobotaTitle,
      description: t.fotarobotaDescription,
      url: canonical,
      siteName: "BALUNIAK.COM",
      locale: isPl ? "pl_PL" : "en_US",
      type: "article",
    },
    robots: { index: true, follow: true },
  };
}

export default function FotarobotaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
