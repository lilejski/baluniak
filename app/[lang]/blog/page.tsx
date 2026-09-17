import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { PostCard } from "@/components/blog/PostCard";
import { getPostSummaries } from "@/lib/blog/posts";
import type { PostLang } from "@/lib/blog/types";

const SITE_URL = "https://baluniak.com";

const COPY = {
  pl: {
    eyebrow: "Blog",
    title: "Wiedza, która zostaje po rozmowie",
    subtitle:
      "Konkretnie o stronach, sklepach i automatyzacji — bez żargonu i bez sprzedawania na siłę. Piszę o tym, o co klienci pytają najczęściej.",
    empty: "Pierwsze teksty są w drodze.",
    read: "Czytaj dalej",
    minutes: "min czytania",
    back: "Strona główna",
    seoTitle: "Blog — strony, sklepy i automatyzacja bez żargonu | BALUNIAK",
    seoDescription:
      "Praktyczne teksty o nowoczesnych stronach, sklepach internetowych, automatyzacji i wdrożeniach AI w małych firmach. Pisane tak, żeby dało się je zrozumieć.",
  },
  en: {
    eyebrow: "Blog",
    title: "What stays with you after the conversation",
    subtitle:
      "Straight talk about websites, shops and automation — no jargon, no hard sell. I write about whatever clients ask most often.",
    empty: "The first pieces are on their way.",
    read: "Read on",
    minutes: "min read",
    back: "Home",
    seoTitle: "Blog — websites, shops and automation without the jargon | BALUNIAK",
    seoDescription:
      "Practical writing about modern websites, online shops, automation and AI for small businesses. Written to be understood.",
  },
} as const;

function toPostLang(lang: string): PostLang {
  return lang === "en" ? "en" : "pl";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const copy = COPY[toPostLang(lang)];
  const canonical = `${SITE_URL}/${lang}/blog`;
  return {
    title: copy.seoTitle,
    description: copy.seoDescription,
    alternates: {
      canonical,
      languages: { pl: `${SITE_URL}/pl/blog`, en: `${SITE_URL}/en/blog` },
    },
    openGraph: {
      title: copy.seoTitle,
      description: copy.seoDescription,
      url: canonical,
      siteName: "BALUNIAK.COM",
      locale: lang === "pl" ? "pl_PL" : "en_US",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const postLang = toPostLang(lang);
  const copy = COPY[postLang];
  const posts = getPostSummaries(postLang);

  return (
    <div className="min-h-screen bg-bg pb-[max(3rem,env(safe-area-inset-bottom))]">
      <div className="container-page page-top">
        <Button variant="ghost" size="sm" asChild className="-ml-4 mb-8">
          <Link href={`/${lang}`} className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4" />
            {copy.back}
          </Link>
        </Button>

        <SectionHeading as="h1" eyebrow={copy.eyebrow} title={copy.title} lead={copy.subtitle} className="mb-10 sm:mb-14" />

        {posts.length === 0 ? (
          <p className="card p-8 text-center text-fg-muted">
            {copy.empty}
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {posts.map((post, index) => (
              <PostCard
                key={post.slug}
                post={post}
                localeSegment={lang}
                featured={index === 0 && posts.length > 1}
                labels={{ read: copy.read, minutes: copy.minutes }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
