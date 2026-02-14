import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isPl = lang === "pl";
  return {
    title: "Fotarobota — Case Study | BALUNIAK",
    description: isPl
      ? "AI-Powered Photo Transformation. Od pomysłu do działającego SaaS w 2 tygodnie. Next.js, Fal.ai, automatyzacja zdjęć produktowych."
      : "AI-Powered Photo Transformation. From idea to working SaaS in 2 weeks. Next.js, Fal.ai, product photo automation.",
  };
}

export default function FotarobotaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
