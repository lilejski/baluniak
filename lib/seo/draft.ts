import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import { TOPIC_BACKLOG, type PlannedTopic } from "@/content/topics";
import { getAllPosts } from "@/lib/blog/posts";
import type { PostLang } from "@/lib/blog/types";
import { buildReport, type Opportunity } from "./opportunities";

const MODEL = "claude-sonnet-5";
const TOKEN_BUDGET = 6_000;
const TIMEOUT_MS = 120_000;

export type TopicChoice = {
  source: "search-console" | "backlog";
  translationKey: string;
  targetQuery: { pl: string; en: string };
  angle: string;
  tags: { pl: string[]; en: string[] };
  relatedSlugs: { pl: string[]; en: string[] };
  /** Present when Search Console picked the subject — the evidence behind it. */
  evidence?: Opportunity;
};

/** translationKeys already published, in either language. */
function publishedKeys(): Set<string> {
  const keys = new Set<string>();
  for (const lang of ["pl", "en"] as PostLang[]) {
    for (const post of getAllPosts(lang, { includeDrafts: true })) keys.add(post.translationKey);
  }
  return keys;
}

function fromBacklog(done: Set<string>): PlannedTopic | null {
  return TOPIC_BACKLOG.find((topic) => !done.has(topic.translationKey)) ?? null;
}

/**
 * Picks what to write about.
 *
 * Search Console wins whenever it has enough data to be meaningful — a query
 * the site already half-ranks for is a far shorter climb than a cold one.
 * Below that threshold the report refuses to rank anything, and the hand-made
 * backlog carries the pipeline instead. The switchover needs no code change:
 * it happens as soon as the data arrives.
 */
export async function chooseTopic(): Promise<TopicChoice | null> {
  const done = publishedKeys();

  const report = await buildReport(90).catch(() => null);
  const best = report?.maturity.enoughToMine ? report.opportunities[0] : undefined;

  if (best) {
    const slug = best.query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60);

    if (!done.has(slug)) {
      return {
        source: "search-console",
        translationKey: slug,
        targetQuery: { pl: best.query, en: best.query },
        angle: best.reason,
        tags: { pl: ["SEO"], en: ["SEO"] },
        relatedSlugs: { pl: [], en: [] },
        evidence: best,
      };
    }
  }

  const planned = fromBacklog(done);
  if (!planned) return null;

  return {
    source: "backlog",
    translationKey: planned.translationKey,
    targetQuery: planned.targetQuery,
    angle: planned.angle,
    tags: planned.tags,
    relatedSlugs: planned.relatedSlugs ?? { pl: [], en: [] },
  };
}

// ─── Writing ─────────────────────────────────────────────────────────────────

const articleSchema = z.object({
  title: z.string().describe("Tytuł artykułu. Konkretny, bez clickbaitu. Max 70 znaków."),
  description: z.string().describe("Opis pod wynik wyszukiwania. Jedno zdanie, 120-155 znaków."),
  slug: z.string().describe("Slug z adresu: małe litery, myślniki, bez polskich znaków."),
  body: z
    .string()
    .describe(
      "Treść w Markdown. Bez nagłówka H1 — tytuł jest osobno. Sekcje jako ## . 700-1100 słów."
    ),
});

const VOICE = `Piszesz na blogu baluniak.com — jednoosobowej firmy robiącej strony, sklepy, systemy i wdrożenia AI dla małych firm.

KTO CZYTA:
Właściciel małej firmy. Stolarz, fryzjerka, mechanik, hurtownik. NIE ZNA słów MVP, SaaS, backend, framework, API, deployment, stack, hosting. Jeśli któregoś użyjesz, przestanie czytać.

ZASADY:
1. Krótkie zdania, zwykłe słowa. Jak rozmowa przez płot, nie jak broszura.
2. ŻADNYCH cen, widełek ani kosztów usług. Na tej stronie nie ma cennika i artykuł nie może go udawać.
3. Zajmij stanowisko. Napisz też, czego NIE robić i kiedy coś się NIE opłaca — uczciwa sekcja o ograniczeniach jest warta więcej niż lista zalet.
4. Zero marketingowej waty: "kompleksowe rozwiązania", "dedykowane podejście", "w dzisiejszych czasach".
5. Nie obiecuj wyników ani terminów.
6. Nie wymyślaj statystyk, badań ani cytatów. Jeśli nie wiesz, nie podawaj liczby.
7. Zwracaj się na "Ty".
8. Bez nagłówka pierwszego poziomu. Sekcje jako ##. Bez emoji.`;

const VOICE_EN = `You write for the blog at baluniak.com — a one-person business building websites, shops, systems and AI for small companies.

WHO READS IT:
A small business owner. A carpenter, a hairdresser, a mechanic, a wholesaler. They do NOT know the words MVP, SaaS, backend, framework, API, deployment, stack or hosting. Use one and they stop reading.

RULES:
1. Short sentences, ordinary words. A conversation over a fence, not a brochure.
2. NO prices, ranges or service costs. This site has no price list and the article must not invent one.
3. Take a position. Include what NOT to do and when something is NOT worth it — an honest section on limits is worth more than a list of benefits.
4. No marketing filler: "comprehensive solutions", "bespoke approach", "in today's world".
5. Do not promise results or deadlines.
6. Do not invent statistics, studies or quotes. If you do not know a number, do not give one.
7. Address the reader directly as "you".
8. No top-level heading. Sections as ##. No emoji.`;

function buildPrompt(topic: TopicChoice, lang: PostLang, linkTargets: string[]): string {
  const voice = lang === "pl" ? VOICE : VOICE_EN;
  const query = lang === "pl" ? topic.targetQuery.pl : topic.targetQuery.en;

  const links = linkTargets.length
    ? `\n\nLINKI WEWNĘTRZNE — wpleć 2-3 z nich naturalnie w treść, w formacie [tekst](adres). Nie wciskaj wszystkich:\n${linkTargets.join("\n")}`
    : "";

  const evidence = topic.evidence
    ? `\n\nDANE: to zapytanie ma ${topic.evidence.impressions} wyświetleń i pozycję ${topic.evidence.position.toFixed(1)}. ${topic.evidence.reason}`
    : "";

  return `${voice}

TEMAT: napisz artykuł odpowiadający na intencję wyszukiwania "${query}".

KĄT UJĘCIA: ${topic.angle}${evidence}${links}

Napisz tytuł, opis pod wynik wyszukiwania, slug i treść.`;
}

/** Candidate internal links, so an article never ends as a dead end. */
function linkTargetsFor(lang: PostLang, relatedSlugs: string[]): string[] {
  const posts = getAllPosts(lang).slice(0, 6);
  const targets = posts.map((post) => `- ${post.title} → /${lang}/blog/${post.slug}`);
  targets.push(
    lang === "pl"
      ? "- Kreator zamówienia → /pl/kreator"
      : "- Order builder → /en/kreator"
  );
  // Curated links first — they were chosen for this specific piece.
  const curated = relatedSlugs
    .map((slug) => posts.find((p) => p.slug === slug))
    .filter(Boolean)
    .map((post) => `- ${post!.title} → /${lang}/blog/${post!.slug}`);
  return [...new Set([...curated, ...targets])];
}

function frontmatter(fields: Record<string, string | string[] | undefined>): string {
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) =>
      Array.isArray(value) ? `${key}: [${value.join(", ")}]` : `${key}: ${value}`
    );
  return `---\n${lines.join("\n")}\n---\n`;
}

export type DraftedArticle = {
  lang: PostLang;
  path: string;
  slug: string;
  title: string;
  content: string;
};

export async function draftArticle(
  topic: TopicChoice,
  lang: PostLang
): Promise<DraftedArticle> {
  const related = lang === "pl" ? topic.relatedSlugs.pl : topic.relatedSlugs.en;

  const { object } = await generateObject({
    model: anthropic(MODEL),
    schema: articleSchema,
    prompt: buildPrompt(topic, lang, linkTargetsFor(lang, related)),
    maxOutputTokens: TOKEN_BUDGET,
    maxRetries: 1,
    abortSignal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const slug = object.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const content =
    frontmatter({
      title: object.title.trim(),
      description: object.description.trim(),
      slug,
      date: new Date().toISOString().slice(0, 10),
      translationKey: topic.translationKey,
      tags: lang === "pl" ? topic.tags.pl : topic.tags.en,
      // Every generated piece lands as a draft: noindex, hidden from listings
      // and the sitemap until a human flips this to false.
      draft: "true",
      related: related.length ? related : undefined,
      sourceQuery: lang === "pl" ? topic.targetQuery.pl : topic.targetQuery.en,
    }) +
    "\n" +
    object.body.trim() +
    "\n";

  return {
    lang,
    slug,
    title: object.title.trim(),
    path: `content/blog/${lang}/${slug}.md`,
    content,
  };
}
