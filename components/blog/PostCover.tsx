import { cn } from "@/lib/utils";

/**
 * Typographic cover for a blog post, built from the post itself at render time.
 *
 * No image file exists, so a draft merged from the content pipeline gets its
 * cover the moment it is published, in whatever language it is written — the
 * title and tags are the artwork. One system for every post: a printed-card
 * frame, the tags on top, an accent rule and the title at the bottom, and the
 * first letter of the topic set huge in outline behind it. Posts on the same
 * topic share that letter; the slug decides where it sits, so a listing stays
 * varied without anyone designing anything.
 */

const PLACEMENTS = [
  "-bottom-[0.3em] -right-[0.04em]",
  "-top-[0.24em] -right-[0.1em]",
  "top-1/2 -right-[0.14em] -translate-y-1/2",
] as const;

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

export function PostCover({
  title,
  tags,
  slug,
  featured = false,
  heading = "h2",
}: {
  title: string;
  tags: string[];
  slug: string;
  featured?: boolean;
  /** The cover carries the card's heading; pass "p" where the title is already a heading elsewhere. */
  heading?: "h2" | "p";
}) {
  const Title = heading;
  const topic = tags[0] ?? title;
  const initial = topic.trim().charAt(0).toUpperCase();
  const placement = PLACEMENTS[hash(slug) % PLACEMENTS.length];

  return (
    <div
      className="relative isolate flex size-full flex-col justify-between overflow-hidden bg-bg p-5 md:p-7"
      style={{ containerType: "inline-size" }}
    >
      {/* Printed-card frame */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-2.5 rounded-[10px] border border-border"
      />

      {/* The topic's initial, huge and outlined, cropped by the card */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -z-10 select-none font-display font-bold leading-[0.8] text-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100",
          placement
        )}
        style={{ fontSize: "min(88cqi, 22rem)", WebkitTextStroke: "1px rgba(61, 203, 139, 0.32)" }}
      >
        {initial}
      </span>

      <p className="eyebrow relative">{tags.length > 0 ? tags.slice(0, 3).join(" · ") : "Blog"}</p>

      <div className="relative">
        <span aria-hidden className="mb-3 block h-px w-10 bg-accent" />
        <Title
          className="line-clamp-4 max-w-[22ch] font-display font-bold text-fg text-balance"
          style={{
            fontSize: featured ? "clamp(1.5rem, 5.4cqi, 2.75rem)" : "clamp(1.25rem, 7.2cqi, 1.875rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </Title>
      </div>
    </div>
  );
}
