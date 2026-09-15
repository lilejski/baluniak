import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog/posts";

const SITE_URL = "https://baluniak.com";
const LANGS = ["pl", "en"] as const;

/**
 * Every indexable URL, in both languages, with the alternates spelled out so
 * Google treats the PL and EN versions as one page in two languages rather
 * than as duplicates competing with each other.
 */

/** Static routes, as paths relative to the locale segment. */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/kreator", priority: 0.9, changeFrequency: "monthly" },
  { path: "/o-mnie", priority: 0.8, changeFrequency: "monthly" },
  { path: "/projekty/fotarobota", priority: 0.7, changeFrequency: "monthly" },
  { path: "/projekty/quantum-om", priority: 0.7, changeFrequency: "monthly" },
  { path: "/projekty/charon", priority: 0.7, changeFrequency: "monthly" },
  { path: "/sklep", priority: 0.5, changeFrequency: "monthly" },
];

function alternatesFor(path: string): Record<string, string> {
  return Object.fromEntries(LANGS.map((lang) => [lang, `${SITE_URL}/${lang}${path}`]));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.flatMap((route) =>
    LANGS.map((lang) => ({
      url: `${SITE_URL}/${lang}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: alternatesFor(route.path) },
    }))
  );

  // Drafts are excluded by getAllPosts, so unreviewed drafts never reach here.
  const postEntries = LANGS.flatMap((lang) =>
    getAllPosts(lang).map((post) => ({
      url: `${SITE_URL}/${lang}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  return [...staticEntries, ...postEntries];
}
