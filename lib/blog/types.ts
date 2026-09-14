/**
 * The blog's content model.
 *
 * Posts are Markdown files on disk, not database rows. That keeps them
 * statically rendered (fastest pages, best for crawling), version-controlled,
 * and — because the drafting pipeline opens a pull request rather than writing
 * straight to the site — reviewable before anything goes live.
 *
 * Markdown, deliberately, rather than MDX or a .ts module: generated content
 * should never be able to execute code just by being committed.
 */

export type PostLang = "pl" | "en";

export type PostFrontmatter = {
  title: string;
  description: string;
  /** URL segment. Must be unique within a language. */
  slug: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** Ties the PL and EN versions of one article together, for hreflang. */
  translationKey: string;
  tags: string[];
  /** Hidden from listings and sitemap, still reachable by direct URL. */
  draft: boolean;
  /**
   * Optional cover image under /public. When absent the card and the article
   * header fall back to a gradient derived from the slug, so a post never
   * looks broken just because nobody made artwork for it.
   */
  cover?: string;
  /**
   * Slugs of posts to link to from the bottom of this one. Curated links win
   * over the automatic tag-based suggestions.
   */
  related?: string[];
  /**
   * The Search Console query this article was written to answer, when the
   * drafting pipeline produced it. Purely informational — it records why the
   * piece exists so its performance can be judged against the intent.
   */
  sourceQuery?: string;
};

export type Post = PostFrontmatter & {
  lang: PostLang;
  /** Markdown body, frontmatter stripped. */
  body: string;
  /** Estimated from word count at read time. */
  readingMinutes: number;
};

/** Listing entry — everything except the body, so listings stay cheap. */
export type PostSummary = Omit<Post, "body">;
