import { NextResponse } from "next/server";
import { buildReport } from "@/lib/seo/opportunities";

export const runtime = "nodejs";
export const maxDuration = 60;
/** Always live — a cached SEO report is a misleading SEO report. */
export const dynamic = "force-dynamic";

/**
 * The SEO report, for a cron job or for me.
 *
 * Read-only: it looks at Search Console and Analytics and returns a shortlist.
 * Nothing here writes, publishes or spends money on a model — that is a
 * separate, deliberate step.
 *
 * Guarded by a shared secret rather than a login, because the only callers are
 * Vercel Cron and a terminal. Without SEO_REPORT_SECRET set, the route refuses
 * outright instead of defaulting to open.
 */
function authorise(req: Request): boolean {
  const secret = process.env.SEO_REPORT_SECRET;
  if (!secret) return false;

  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;

  // Vercel Cron sends its own header; accept it when the secrets match.
  return req.headers.get("x-vercel-cron-secret") === secret;
}

export async function GET(req: Request) {
  if (!authorise(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? 90), 7), 480);

  try {
    const report = await buildReport(days);
    return NextResponse.json(report);
  } catch (err) {
    console.error("[seo/report]", err);
    return NextResponse.json({ error: "Report failed" }, { status: 500 });
  }
}
