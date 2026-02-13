import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fotarobota — Case Study | BALUNIAK",
  description:
    "AI-Powered Photo Transformation. Od pomysłu do działającego SaaS w 2 tygodnie. Next.js, Fal.ai, automatyzacja zdjęć produktowych.",
};

export default function FotarobotaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
