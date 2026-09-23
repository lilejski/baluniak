import { NextResponse } from "next/server";
import { chooseTopic, draftArticle } from "@/lib/seo/draft";
import { contentBranchName, hasToken, openContentPullRequest } from "@/lib/seo/github";
import { LOCALES } from "@/lib/i18n";
import { notifyOwner } from "@/lib/seo/notify";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Drafts the next article in every language and opens a pull request.
 *
 * Triggered by Vercel Cron on a schedule, or by hand with the shared secret.
 * It never publishes: the draft arrives as a PR with `draft: true` in its
 * frontmatter, so even if it were merged untouched it would carry noindex and
 * stay out of listings and the sitemap until a human says otherwise.
 */
/**
 * Who may run this.
 *
 * Vercel Cron authenticates with `Authorization: Bearer $CRON_SECRET`, and
 * only when that variable exists in the project. There is no
 * `x-vercel-cron-secret` header — checking for one is why every scheduled
 * run answered 401 and the blog quietly stopped growing.
 *
 * SEO_REPORT_SECRET stays accepted so the endpoint can still be triggered by
 * hand without touching the cron's own secret.
 */
function authorise(req: Request): boolean {
  const header = req.headers.get("authorization");
  if (!header) return false;
  const accepted = [process.env.CRON_SECRET, process.env.SEO_REPORT_SECRET].filter(
    (secret): secret is string => Boolean(secret)
  );
  return accepted.some((secret) => header === `Bearer ${secret}`);
}

export async function GET(req: Request) {
  if (!authorise(req)) {
    // Naming the caller turns the next silent 401 into one log line that
    // says whether it was the cron, a scanner, or me with a stale secret.
    console.warn("[seo/draft] unauthorised call from", req.headers.get("user-agent") ?? "unknown");
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
      const reason = "Brak tematów — kolejka pusta, a dane z GSC nie wskazują nic nowego.";
      if (!dryRun) {
        await notifyOwner(
          "SEO: w tym tygodniu bez artykułu",
          `${reason}

Dopisz nowe tematy w content/topics.ts albo poczekaj, aż Search Console uzbiera dość danych, żeby typować samodzielnie.`
        );
      }
      return NextResponse.json({ drafted: false, reason });
    }

    const articles = await Promise.all(LOCALES.map((lang) => draftArticle(topic, lang)));
    const [pl] = articles;

    if (dryRun) {
      // Returns the files verbatim so a draft can be read before anything is
      // committed anywhere — the cheapest possible review loop.
      return NextResponse.json({
        drafted: true,
        dryRun: true,
        topic: { source: topic.source, translationKey: topic.translationKey },
        articles: articles.map((article) => ({
          lang: article.lang,
          slug: article.slug,
          title: article.title,
          path: article.path,
          words: article.content.split(/\s+/).length,
          content: article.content,
        })),
      });
    }

    const branchName = contentBranchName(topic.translationKey);

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
        ...articles.map((article) => `- \`${article.path}\``),
        ``,
        `## Zanim scalisz`,
        `Wszystkie pliki mają **\`draft: true\`** — są niewidoczne w listingu i w mapie witryny, i mają noindex. Przeczytaj, popraw co trzeba, a potem zmień na \`draft: false\`, żeby opublikować.`,
        ``,
        `Warto sprawdzić: czy nie ma żargonu, czy nie pojawiły się wymyślone liczby i czy linki wewnętrzne prowadzą tam, gdzie powinny.`,
      ].join("\n"),
      files: articles.map((article) => ({ path: article.path, content: article.content })),
    });

    await notifyOwner(
      `SEO: nowy artykuł czeka na akceptację — ${pl.title}`,
      [
        origin,
        "",
        `Pull request: ${url}`,
        "",
        "Pliki w PR:",
        ...articles.map((article) => `- ${article.path}`),
        "",
        "Wszystkie mają draft: true — dopóki tego nie zmienisz, są niewidoczne dla Google i w listingu bloga.",
      ].join("\n")
    );

    return NextResponse.json({
      drafted: true,
      topic: { source: topic.source, translationKey: topic.translationKey },
      pullRequest: url,
    });
  } catch (err) {
    console.error("[seo/draft]", err);
    const message = err instanceof Error ? err.message.slice(0, 300) : "Draft failed";
    if (!dryRun) {
      await notifyOwner(
        "SEO: przebieg się nie udał",
        `Cotygodniowy automat treści przerwał pracę.

${message}

Nic nie zostało opublikowane ani wysłane na GitHuba.`
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
