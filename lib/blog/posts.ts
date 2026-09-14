import fs from "node:fs";
import path from "node:path";
import type { Post, PostFrontmatter, PostLang, PostSummary } from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content", "blog");

/**
 * A deliberately strict frontmatter reader.
 *
 * Only the keys the model declares are understood, values are plain scalars or
 * simple `[a, b]` lists, and anything unexpected is ignored rather than
 * guessed at. Pulling in a general YAML parser would accept far more syntax
 * than this needs, from files a generator wrote.
 */
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw.trim() };

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([a-zA-Z][a-zA-Z0-9_]*)\s*:\s*(.*)$/.exec(line.trim());
    if (!pair) continue;
    let value = pair[2].trim();
    // Strip one layer of matching quotes, if present.
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      value = value.slice(1, -1);
    }
    data[pair[1]] = value;
  }
  return { data, body: match[2].trim() };
}

function parseList(value: string | undefined): string[] {
  if (!value) return [];
  const inner = value.trim().replace(/^\[/, "").replace(/\]$/, "");
  return inner
    .split(",")
    .map((item) => item.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

/** Roughly 200 words a minute, floored at one. */
function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function toFrontmatter(data: Record<string, string>, fallbackSlug: string): PostFrontmatter {
  return {
    title: data.title ?? fallbackSlug,
    description: data.description ?? "",
    slug: data.slug ?? fallbackSlug,
    date: data.date ?? "1970-01-01",
    translationKey: data.translationKey ?? (data.slug ?? fallbackSlug),
    tags: parseList(data.tags),
    draft: data.draft === "true",
    cover: data.cover || undefined,
    related: parseList(data.related),
    sourceQuery: data.sourceQuery || undefined,
  };
}

function readDir(lang: PostLang): string[] {
  const dir = path.join(CONTENT_ROOT, lang);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((file) => file.endsWith(".md"));
}

function loadFile(lang: PostLang, file: string): Post {
  const fullPath = path.join(CONTENT_ROOT, lang, file);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const fallbackSlug = file.replace(/\.md$/, "");
  return {
    ...toFrontmatter(data, fallbackSlug),
    lang,
    body,
    readingMinutes: estimateReadingMinutes(body),
  };
}

/** Drop the body so listings do not carry every article in memory. */
function toSummary(post: Post): PostSummary {
  const summary: PostSummary = {
    title: post.title,
    description: post.description,
    slug: post.slug,
    date: post.date,
    translationKey: post.translationKey,
    tags: post.tags,
    draft: post.draft,
    cover: post.cover,
    related: post.related,
    sourceQuery: post.sourceQuery,
    lang: post.lang,
    readingMinutes: post.readingMinutes,
  };
  return summary;
}

/** Newest first. Drafts are excluded unless explicitly asked for. */
export function getAllPosts(lang: PostLang, options: { includeDrafts?: boolean } = {}): Post[] {
  return readDir(lang)
    .map((file) => loadFile(lang, file))
    .filter((post) => options.includeDrafts || !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostSummaries(lang: PostLang): PostSummary[] {
  return getAllPosts(lang).map(toSummary);
}

export function getPost(lang: PostLang, slug: string): Post | null {
  return getAllPosts(lang, { includeDrafts: true }).find((post) => post.slug === slug) ?? null;
}

/** The same article in the other language, for hreflang and the switcher. */
export function getTranslation(post: Post): Post | null {
  const other: PostLang = post.lang === "pl" ? "en" : "pl";
  return (
    getAllPosts(other, { includeDrafts: true }).find(
      (candidate) => candidate.translationKey === post.translationKey
    ) ?? null
  );
}

/**
 * Posts to link to from the end of an article. Curated `related` slugs come
 * first; the remaining slots are filled by whatever shares the most tags. This
 * is the internal linking that lets crawlers — and readers — move between
 * articles instead of hitting a dead end.
 */
export function getRelatedPosts(post: Post, limit = 3): PostSummary[] {
  const pool = getAllPosts(post.lang).filter((candidate) => candidate.slug !== post.slug);

  const curated = (post.related ?? [])
    .map((slug) => pool.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is Post => Boolean(candidate));

  const byOverlap = pool
    .filter((candidate) => !curated.some((chosen) => chosen.slug === candidate.slug))
    .map((candidate) => ({
      post: candidate,
      overlap: candidate.tags.filter((tag) => post.tags.includes(tag)).length,
    }))
    .filter((entry) => entry.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.post.date.localeCompare(a.post.date))
    .map((entry) => entry.post);

  return [...curated, ...byOverlap].slice(0, limit).map(toSummary);
}

/** Every tag in use, most frequent first. */
export function getAllTags(lang: PostLang): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts(lang)) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
