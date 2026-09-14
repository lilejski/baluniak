import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostBody } from "@/components/blog/PostBody";
import { PostCard } from "@/components/blog/PostCard";
import { getAllPosts, getPost, getRelatedPosts, getTranslation } from "@/lib/blog/posts";
import type { PostLang } from "@/lib/blog/types";

const SITE_URL = "https://baluniak.com";

const COPY = {
  pl: {
    back: "Wszystkie wpisy",
    minutes: "min czytania",
    read: "Czytaj dalej",
    related: "Przeczytaj również",
    ctaTitle: "Masz podobny problem u siebie?",
    ctaBody: "Opisz go własnymi słowami — kilka prostych pytań, bez żargonu i bez zobowiązań.",
    ctaButton: "Przejdź do kreatora",
  },
  en: {
    back: "All posts",
    minutes: "min read",
    read: "Read on",
    related: "Read next",
    ctaTitle: "Facing something similar?",
    ctaBody: "Describe it in your own words — a few plain questions, no jargon, no commitment.",
    ctaButton: "Open the order builder",
  },
} as const;

function toPostLang(lang: string): PostLang {
  return lang === "en" ? "en" : "pl";
}

/** Pre-render every published article at build time. */
export function generateStaticParams() {
  return (["pl", "en"] as const).flatMap((lang) =>
    getAllPosts(lang).map((post) => ({ lang, slug: post.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = getPost(toPostLang(lang), slug);
  if (!post) return {};

  const canonical = `${SITE_URL}/${lang}/blog/${post.slug}`;
  const translation = getTranslation(post);
  const languages: Record<string, string> = { [post.lang]: canonical };
  if (translation) {
    languages[translation.lang] = `${SITE_URL}/${translation.lang}/blog/${translation.slug}`;
  }

  return {
    title: `${post.title} | BALUNIAK`,
    description: post.description,
    alternates: { canonical, languages },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonical,
      siteName: "BALUNIAK.COM",
      locale: post.lang === "pl" ? "pl_PL" : "en_US",
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
      images: post.cover ? [{ url: `${SITE_URL}${post.cover}` }] : undefined,
    },
    // Drafts stay reachable by URL for review, but must never be indexed.
    robots: post.draft ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const postLang = toPostLang(lang);
  const post = getPost(postLang, slug);
  if (!post) notFound();

  const copy = COPY[postLang];
  const related = getRelatedPosts(post);
  const published = new Date(post.date);
  const dateLabel = Number.isNaN(published.getTime())
    ? post.date
    : published.toLocaleDateString(postLang === "pl" ? "pl-PL" : "en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  // Article structured data, so search engines get the headline, date and
  // author without having to infer them from the markup.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: postLang,
    author: { "@type": "Person", name: "Łukasz Bałuniak", url: SITE_URL },
    publisher: { "@type": "Person", name: "Łukasz Bałuniak", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/${lang}/blog/${post.slug}`,
    keywords: post.tags.join(", "),
    ...(post.cover ? { image: `${SITE_URL}${post.cover}` } : {}),
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-[max(3rem,env(safe-area-inset-bottom))] text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
        <Button variant="ghost" size="sm" asChild className="mb-8 -ml-3 text-zinc-500 hover:text-zinc-300">
          <Link href={`/${lang}/blog`} className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4" />
            {copy.back}
          </Link>
        </Button>

        <article>
          <header className="mb-10">
            {post.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-emerald-500/25 bg-emerald-500/5 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-emerald-300/90"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-zinc-100 text-balance sm:text-4xl md:text-[2.75rem]">
              {post.title}
            </h1>

            {post.description && (
              <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
                {post.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-800 pt-5 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                <time dateTime={post.date}>{dateLabel}</time>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 shrink-0" aria-hidden />
                {post.readingMinutes} {copy.minutes}
              </span>
              {post.draft && (
                <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono uppercase tracking-wider text-amber-300">
                  draft
                </span>
              )}
            </div>

            {post.cover && (
              <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-2xl border border-zinc-800">
                <Image
                  src={post.cover}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
            )}
          </header>

          <PostBody markdown={post.body} />
        </article>

        {/* Call to action — every article should offer somewhere to go next */}
        <section className="mt-16 rounded-2xl border border-emerald-500/25 bg-emerald-950/15 p-6 sm:p-8">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
            {copy.ctaTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{copy.ctaBody}</p>
          <Button asChild size="sm" className="mt-5 bg-emerald-600 hover:bg-emerald-500">
            <Link href={`/${lang}/kreator`}>
              {copy.ctaButton}
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </section>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-6 text-xl font-semibold tracking-tight text-zinc-100">
              {copy.related}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {related.map((item) => (
                <PostCard
                  key={item.slug}
                  post={item}
                  localeSegment={lang}
                  labels={{ read: copy.read, minutes: copy.minutes }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
