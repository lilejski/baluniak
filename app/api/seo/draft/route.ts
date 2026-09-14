import { NextResponse } from "next/server";
import { chooseTopic, draftArticle } from "@/lib/seo/draft";
import { hasToken, openContentPullRequest } from "@/lib/seo/github";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Drafts the next article in both languages and opens a pull request.
 *
 * Triggered by Vercel Cron on a schedule, or by hand with the shared secret.
 * It never publishes: the draft arrives as a PR with `draft: true` in its
 * frontmatter, so even if it were merged untouched it would carry noindex and
 * stay out of listings and the sitemap until a human says otherwise.
 */
function authorise(req: Request): boolean {
  const secret = process.env.SEO_REPORT_SECRET;
  if (!secret) return false;
  if (req.headers.get("authorization") === `Bearer ${secret}`) return true;
  // Vercel Cron authenticates with its own header.
  return req.headers.get("x-vercel-cron-secret") === secret;
}

export async function GET(req: Request) {
  if (!authorise(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set" }, { status: 503 });
  }
  // A dry run writes nothing to GitHub, so it must not demand the token —
  // that check belongs only on the path that actually opens a pull request.
  if (!dryRun && !hasToken()) {
    return NextResponse.json({ error: "GITHUB_TOKEN is not set" }, { status: 503 });
  }

  try {
    const topic = await chooseTopic();
    if (!topic) {
      // Not a failure: the backlog is drained and Search Console has nothing
      // new to say. Silence is the correct output.
      return NextResponse.json({
        drafted: false,
        reason: "Brak tematów — kolejka pusta, a dane z GSC nie wskazują nic nowego.",
      });
    }

    const [pl, en] = await Promise.all([draftArticle(topic, "pl"), draftArticle(topic, "en")]);

    if (dryRun) {
      // Returns the files verbatim so a draft can be read before anything is
      // committed anywhere — the cheapest possible review loop.
      return NextResponse.json({
        drafted: true,
        dryRun: true,
        topic: { source: topic.source, translationKey: topic.translationKey },
        articles: [pl, en].map((article) => ({
          lang: article.lang,
          slug: article.slug,
          title: article.title,
          path: article.path,
          words: article.content.split(/\s+/).length,
          content: article.content,
        })),
      });
    }

    const stamp = new Date().toISOString().slice(0, 10);
    const branchName = `content/${stamp}-${topic.translationKey}`.slice(0, 90);

    const origin =
      topic.source === "search-console"
        ? `Wybrane z Search Console: zapytanie „${topic.targetQuery.pl}", ${topic.evidence?.impressions} wyświetleń, pozycja ${topic.evidence?.position.toFixed(1)}.`
        : `Wybrane z kolejki tematów (content/topics.ts) — Search Console nie ma jeszcze dość danych, żeby typować samodzielnie.`;

    const url = await openContentPullRequest({
      branchName,
      title: `content: ${pl.title}`,
      body: [
        `## Skąd ten temat`,
        origin,
        ``,
        `## Co zawiera`,
        `- \`${pl.path}\``,
        `- \`${en.path}\``,
        ``,
        `## Zanim scalisz`,
        `Oba pliki mają **\`draft: true\`** — są niewidoczne w listingu i w mapie witryny, i mają noindex. Przeczytaj, popraw co trzeba, a potem zmień na \`draft: false\`, żeby opublikować.`,
        ``,
        `Warto sprawdzić: czy nie ma żargonu, czy nie pojawiły się wymyślone liczby i czy linki wewnętrzne prowadzą tam, gdzie powinny.`,
      ].join("\n"),
      files: [
        { path: pl.path, content: pl.content },
        { path: en.path, content: en.content },
      ],
    });

    return NextResponse.json({
      drafted: true,
      topic: { source: topic.source, translationKey: topic.translationKey },
      pullRequest: url,
    });
  } catch (err) {
    console.error("[seo/draft]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message.slice(0, 300) : "Draft failed" },
      { status: 500 }
    );
  }
}
