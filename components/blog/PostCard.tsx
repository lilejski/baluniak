import Link from "next/link";
import { DATE_LOCALE } from "@/lib/i18n";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { PostSummary } from "@/lib/blog/types";
import { PostCover } from "@/components/blog/PostCover";
import { cn } from "@/lib/utils";

export function PostCard({
  post,
  localeSegment,
  featured = false,
  labels,
}: {
  post: PostSummary;
  localeSegment: string;
  featured?: boolean;
  labels: { read: string; minutes: string };
}) {
  const href = `/${localeSegment}/blog/${post.slug}`;
  const published = new Date(post.date);
  const dateLabel = Number.isNaN(published.getTime())
    ? post.date
    : published.toLocaleDateString(DATE_LOCALE[post.lang], {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <article
      className={cn(
        "card card-interactive group relative overflow-hidden",
        featured && "sm:col-span-2"
      )}
    >
      <Link href={href} className="flex h-full flex-col">
        {/* Cover: the post's own artwork when it has one, otherwise the
            typographic cover, which then carries the card's heading. */}
        <div
          className={cn(
            "relative w-full shrink-0 overflow-hidden border-b border-border",
            featured ? "aspect-[16/10] sm:aspect-[2/1]" : "aspect-[16/10]"
          )}
        >
          {post.cover ? (
            <Image
              src={post.cover}
              alt=""
              fill
              className="object-cover"
              sizes={featured ? "(max-width: 640px) 100vw, 720px" : "(max-width: 640px) 100vw, 360px"}
            />
          ) : (
            <PostCover title={post.title} tags={post.tags} slug={post.slug} featured={featured} />
          )}
        </div>

        <div className="flex flex-1 flex-col p-5 md:p-6">
          {post.cover && (
            <>
              {post.tags.length > 0 && (
                <p className="eyebrow mb-2">{post.tags.slice(0, 3).join(" · ")}</p>
              )}
              {/* The clickable headline — the whole card is the link, but this is
                  the element a reader and a crawler both read as the title. */}
              <h2 className={cn("mb-2", featured ? "text-h3" : "text-h4")}>
                {post.title}
              </h2>
            </>
          )}

          {post.description && (
            <p className="line-clamp-3 text-base leading-relaxed text-fg-muted">
              {post.description}
            </p>
          )}

          <p className="mt-4 text-sm text-fg-subtle">
            <time dateTime={post.date}>{dateLabel}</time>
            {" · "}
            {post.readingMinutes} {labels.minutes}
          </p>

          <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-accent">
            {labels.read}
            <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-[2px]" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  );
}
