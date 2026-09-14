import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import type { PostSummary } from "@/lib/blog/types";
import { cn } from "@/lib/utils";

/**
 * A deterministic cover for posts with no artwork.
 *
 * The hue comes from the slug, so a given article always gets the same look —
 * the listing stays visually varied without anyone having to draw anything,
 * and a freshly generated post never shows up as a broken image.
 */
function slugHue(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) % 360;
  return hash;
}

function GeneratedCover({ slug, title }: { slug: string; title: string }) {
  const hue = slugHue(slug);
  return (
    <div
      className="relative size-full overflow-hidden"
      style={{
        background: `radial-gradient(120% 120% at 20% 0%, hsl(${hue} 70% 22%) 0%, hsl(${(hue + 40) % 360} 60% 10%) 55%, #0a0a0b 100%)`,
      }}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <span className="absolute bottom-3 left-4 right-4 truncate font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
        {title}
      </span>
    </div>
  );
}

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
    : published.toLocaleDateString(post.lang === "pl" ? "pl-PL" : "en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition-colors hover:border-emerald-500/40",
        featured && "sm:col-span-2"
      )}
    >
      <Link href={href} className="flex h-full flex-col focus-visible:outline-none">
        {/* Thumbnail */}
        <div
          className={cn(
            "relative w-full shrink-0 overflow-hidden",
            featured ? "aspect-[2/1]" : "aspect-[16/10]"
          )}
        >
          {post.cover ? (
            <Image
              src={post.cover}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes={featured ? "(max-width: 640px) 100vw, 720px" : "(max-width: 640px) 100vw, 360px"}
            />
          ) : (
            <GeneratedCover slug={post.slug} title={post.title} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" aria-hidden />
        </div>

        <div className="flex flex-1 flex-col p-5">
          {post.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-emerald-500/25 bg-emerald-500/5 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-emerald-300/90"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* The clickable headline — the whole card is the link, but this is
              the element a reader and a crawler both read as the title. */}
          <h2
            className={cn(
              "font-semibold tracking-tight text-zinc-100 text-balance transition-colors group-hover:text-emerald-300",
              featured ? "text-xl sm:text-2xl" : "text-lg"
            )}
          >
            {post.title}
          </h2>

          {post.description && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-400">
              {post.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 shrink-0" aria-hidden />
              <time dateTime={post.date}>{dateLabel}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0" aria-hidden />
              {post.readingMinutes} {labels.minutes}
            </span>
          </div>

          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 transition-transform group-hover:translate-x-0.5">
            {labels.read}
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  );
}
