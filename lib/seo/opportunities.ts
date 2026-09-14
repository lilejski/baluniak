import { getQueries, getQueryPagePairs, getTotals, type SearchRow } from "./gsc";
import { getPagePerformance, isConfigured as ga4Configured } from "./ga4";

/**
 * Turning Search Console data into a shortlist of what to write next.
 *
 * The premise: writing into a vacuum rarely ranks. Writing for a query Google
 * already shows you for — just not high enough to be clicked — is a much
 * shorter climb, because the site has already been judged partly relevant.
 */

export type OpportunityKind =
  /** Ranks on page one or two with impressions but few clicks — a small push may be enough. */
  | "striking-distance"
  /** Visible but buried. Deserves a page of its own rather than a mention. */
  | "needs-own-page"
  /** Good position, poor click-through — the title and description are the problem, not the rank. */
  | "poor-ctr";

export type Opportunity = {
  query: string;
  kind: OpportunityKind;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  /** The page currently ranking, if any. */
  currentPage?: string;
  /** Ordering weight — bigger means act sooner. */
  score: number;
  reason: string;
};

export type SeoReport = {
  generatedAt: string;
  window: { days: number };
  credentials: { searchConsole: boolean; analytics: boolean };
  totals: { clicks: number; impressions: number; ctr: number; position: number } | null;
  /** How much data exists — below the threshold the shortlist is noise, not signal. */
  maturity: {
    queryCount: number;
    enoughToMine: boolean;
    note: string;
  };
  opportunities: Opportunity[];
  topPages: { path: string; clicks: number; impressions: number; position: number }[];
  engagement: { path: string; sessions: number; engagementSeconds: number }[];
};

/**
 * Below this many distinct queries, picking topics from the data is picking
 * from noise — a handful of stray impressions says nothing about demand.
 */
const MIN_QUERIES_TO_MINE = 25;

/** Ignore near-zero rows; a single impression is not a signal. */
const MIN_IMPRESSIONS = 3;

function classify(row: SearchRow): { kind: OpportunityKind; reason: string } | null {
  const { impressions, ctr, position } = row;
  if (impressions < MIN_IMPRESSIONS) return null;

  if (position <= 10 && ctr < 0.02) {
    return {
      kind: "poor-ctr",
      reason:
        "Wysoka pozycja, ale prawie nikt nie klika — problem jest w tytule i opisie, nie w treści.",
    };
  }
  if (position > 4 && position <= 20) {
    return {
      kind: "striking-distance",
      reason:
        "Google już Cię tu pokazuje, tylko za nisko. Porządny tekst pod to zapytanie ma krótką drogę w górę.",
    };
  }
  if (position > 20 && impressions >= 10) {
    return {
      kind: "needs-own-page",
      reason: "Widoczne, ale głęboko. Temat zasługuje na własną stronę, nie wzmiankę.",
    };
  }
  return null;
}

/**
 * Impressions carry the weight — they measure real demand — tempered by how
 * far the query has to climb.
 */
function scoreOf(row: SearchRow, kind: OpportunityKind): number {
  const climb = Math.max(1, row.position - 3);
  const base = row.impressions / Math.sqrt(climb);
  const multiplier = kind === "striking-distance" ? 1.5 : kind === "poor-ctr" ? 1.2 : 1;
  return Math.round(base * multiplier * 100) / 100;
}

export async function buildReport(days = 90): Promise<SeoReport> {
  const hasCredentials = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_B64);

  const [totals, queries, pairs, pages, engagement] = await Promise.all([
    getTotals(days),
    getQueries(days),
    getQueryPagePairs(days),
    import("./gsc").then((m) => m.getPages(days, 25)),
    ga4Configured() ? getPagePerformance(28, 25) : Promise.resolve([]),
  ]);

  // Which page currently ranks for each query, so a draft can extend an
  // existing article instead of competing with it.
  const pageByQuery = new Map<string, string>();
  for (const row of pairs) {
    const [query, page] = row.keys;
    if (query && page && !pageByQuery.has(query)) pageByQuery.set(query, page);
  }

  const opportunities: Opportunity[] = [];
  for (const row of queries) {
    const verdict = classify(row);
    if (!verdict) continue;
    opportunities.push({
      query: row.keys[0],
      kind: verdict.kind,
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: row.ctr,
      position: row.position,
      currentPage: pageByQuery.get(row.keys[0]),
      score: scoreOf(row, verdict.kind),
      reason: verdict.reason,
    });
  }
  opportunities.sort((a, b) => b.score - a.score);

  const queryCount = queries.length;
  const enoughToMine = queryCount >= MIN_QUERIES_TO_MINE;

  return {
    generatedAt: new Date().toISOString(),
    window: { days },
    credentials: { searchConsole: hasCredentials, analytics: ga4Configured() },
    totals,
    maturity: {
      queryCount,
      enoughToMine,
      note: enoughToMine
        ? "Danych wystarczy, żeby typować tematy z realnego popytu."
        : `Za mało danych (${queryCount} z ${MIN_QUERIES_TO_MINE} zapytań). Tematy wybierane teraz byłyby zgadywaniem — najpierw strona musi się pokazać w wynikach.`,
    },
    opportunities: opportunities.slice(0, 20),
    topPages: pages.map((row) => ({
      path: row.keys[0].replace(/^https?:\/\/[^/]+/, ""),
      clicks: row.clicks,
      impressions: row.impressions,
      position: Math.round(row.position * 10) / 10,
    })),
    engagement: engagement.map((row) => ({
      path: row.path,
      sessions: row.sessions,
      engagementSeconds: row.engagementSeconds,
    })),
  };
}
