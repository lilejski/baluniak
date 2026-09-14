import { getAccessToken, SCOPES } from "./google-auth";

/** The Search Console property. Domain properties are addressed with this prefix. */
export const GSC_SITE = "sc-domain:baluniak.com";

export type SearchRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type SearchTotals = {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Search Console lags two to three days behind, so a window that runs to today
 * always ends in empty days. Everything here ends three days back instead.
 */
export function dateWindow(days: number): { startDate: string; endDate: string } {
  const end = new Date(Date.now() - 3 * 864e5);
  const start = new Date(end.getTime() - days * 864e5);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

async function queryGsc(
  body: Record<string, unknown>
): Promise<{ rows: SearchRow[]; error?: string }> {
  const token = await getAccessToken([SCOPES.searchConsole]);
  if (!token) return { rows: [], error: "no-credentials" };

  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const detail = await res.text();
    console.error("[gsc] query failed:", res.status, detail.slice(0, 200));
    return { rows: [], error: `http-${res.status}` };
  }

  const json = (await res.json()) as { rows?: SearchRow[] };
  return { rows: json.rows ?? [] };
}

export async function getTotals(days = 90): Promise<SearchTotals | null> {
  const { rows } = await queryGsc({ ...dateWindow(days), dimensions: [], rowLimit: 1 });
  const row = rows[0];
  if (!row) return null;
  return { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position };
}

export async function getQueries(days = 90, rowLimit = 250): Promise<SearchRow[]> {
  const { rows } = await queryGsc({ ...dateWindow(days), dimensions: ["query"], rowLimit });
  return rows;
}

export async function getPages(days = 90, rowLimit = 100): Promise<SearchRow[]> {
  const { rows } = await queryGsc({ ...dateWindow(days), dimensions: ["page"], rowLimit });
  return rows;
}

/** Query paired with the page that ranks for it — needed to tell new topics from existing ones. */
export async function getQueryPagePairs(days = 90, rowLimit = 500): Promise<SearchRow[]> {
  const { rows } = await queryGsc({
    ...dateWindow(days),
    dimensions: ["query", "page"],
    rowLimit,
  });
  return rows;
}
