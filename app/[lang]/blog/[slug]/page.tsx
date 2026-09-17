import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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

  if (!post) {
    // The slug may simply belong to the other language — someone swapped the
    // locale in the address bar, or followed an old link. Send them to the
    // article they meant instead of a dead end: the translation when one
    // exists, otherwise the version that does.
    const otherLang = postLang === "pl" ? "en" : "pl";
    const foreign = getPost(otherLang, slug);
    if (foreign) {
      const translated = getTranslation(foreign);
      redirect(
        translated
          ? `/${lang}/blog/${translated.slug}`
          : `/${otherLang}/blog/${foreign.slug}`
      );
    }
    notFound();
  }

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
    <div className="min-h-screen bg-bg pb-[max(3rem,env(safe-area-inset-bottom))]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-article page-top">
        <Button variant="ghost" size="sm" asChild className="-ml-4 mb-8">
          <Link href={`/${lang}/blog`} className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4" />
            {copy.back}
          </Link>
        </Button>

        <article>
          <header className="mb-10">
            {post.tags.length > 0 && (
              <p className="eyebrow-muted mb-3">{post.tags.join(" · ")}</p>
            )}

            <h1 className="text-h1">
              {post.title}
            </h1>

            {post.description && (
              <p className="text-lead mt-5 text-fg-muted">
                {post.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-5 text-sm text-fg-subtle">
              <time dateTime={post.date}>{dateLabel}</time>
              <span aria-hidden>·</span>
              <span>
                {post.readingMinutes} {copy.minutes}
              </span>
              {post.draft && (
                <span className="rounded-full border border-border-strong px-2 py-0.5 text-xs font-medium text-fg-muted">
                  draft
                </span>
              )}
            </div>

            {post.cover && (
              <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-md border border-border">
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
        <section className="card mt-16 p-5 md:p-8">
          <h2 className="text-h2">
            {copy.ctaTitle}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-fg-muted">{copy.ctaBody}</p>
          <Button asChild className="mt-6 w-full sm:w-auto">
            <Link href={`/${lang}/kreator`}>
              {copy.ctaButton}
            </Link>
          </Button>
        </section>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-h2 mb-6">
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
