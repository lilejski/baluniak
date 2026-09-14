import { getAccessToken, SCOPES } from "./google-auth";

/**
 * GA4 reporting.
 *
 * The property id is numeric and distinct from the G-XXXX measurement id that
 * the page tag uses — one identifies the property when reading, the other
 * identifies the stream when writing. Absent the env var, every call degrades
 * to null rather than throwing, so the rest of the pipeline keeps working on
 * Search Console data alone.
 */

export type PagePerformance = {
  path: string;
  sessions: number;
  users: number;
  /** Average engagement time per session, in seconds. */
  engagementSeconds: number;
  /** Share of sessions that were engaged, 0–1. */
  engagementRate: number;
};

function propertyId(): string | null {
  return process.env.GA4_PROPERTY_ID?.trim() || null;
}

export function isConfigured(): boolean {
  return Boolean(propertyId() && process.env.GOOGLE_SERVICE_ACCOUNT_B64);
}

export async function getPagePerformance(days = 28, limit = 50): Promise<PagePerformance[]> {
  const property = propertyId();
  if (!property) return [];

  const token = await getAccessToken([SCOPES.analytics]);
  if (!token) return [];

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "userEngagementDuration" },
          { name: "engagementRate" },
        ],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit,
      }),
    }
  );

  if (!res.ok) {
    console.error("[ga4] report failed:", res.status, (await res.text()).slice(0, 200));
    return [];
  }

  const json = (await res.json()) as {
    rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[];
  };

  return (json.rows ?? []).map((row) => {
    const sessions = Number(row.metricValues[0]?.value ?? 0);
    const engagementDuration = Number(row.metricValues[2]?.value ?? 0);
    return {
      path: row.dimensionValues[0]?.value ?? "",
      sessions,
      users: Number(row.metricValues[1]?.value ?? 0),
      engagementSeconds: sessions > 0 ? Math.round(engagementDuration / sessions) : 0,
      engagementRate: Number(row.metricValues[3]?.value ?? 0),
    };
  });
}
