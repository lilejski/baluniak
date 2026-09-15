import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { caseStudyJsonLd } from "@/lib/structured-data";
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

export default async function FotarobotaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isPl = lang === "pl";
  return (
    <>
      <JsonLd
        data={caseStudyJsonLd({
          lang: isPl ? "pl" : "en",
          slug: "fotarobota",
          name: "Fotarobota",
          description: translations[isPl ? "PL" : "EN"].seo.fotarobotaDescription,
          category: "MultimediaApplication",
        })}
      />
      {children}
    </>
  );
}
