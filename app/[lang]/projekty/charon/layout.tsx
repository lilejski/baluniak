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
  const canonical = `${SITE_URL}/${lang}/projekty/charon`;
  return {
    title: t.charonTitle,
    description: t.charonDescription,
    alternates: {
      canonical,
      languages: { pl: `${SITE_URL}/pl/projekty/charon`, en: `${SITE_URL}/en/projekty/charon` },
    },
    openGraph: {
      title: t.charonTitle,
      description: t.charonDescription,
      url: canonical,
      siteName: "BALUNIAK.COM",
      locale: isPl ? "pl_PL" : "en_US",
      type: "article",
    },
    robots: { index: true, follow: true },
  };
}

export default async function CharonLayout({
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
          slug: "charon",
          name: "Charon",
          description: translations[isPl ? "PL" : "EN"].seo.charonDescription,
          category: "BusinessApplication",
        })}
      />
      {children}
    </>
  );
}
