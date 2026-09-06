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

export default function CharonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
