/**
 * A small in-process sliding-window limiter.
 *
 * Honest about what this is: serverless instances are ephemeral and there can
 * be several of them, so this is a speed bump against naive loops rather than
 * a guarantee. It costs nothing, needs no external store, and stops the cheap
 * attack — someone curling the endpoint in a shell loop to burn the AI key.
 * If the endpoint ever gets real traffic, swap the Map for a shared store.
 */

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

/** Drop expired buckets so the map cannot grow without bound. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, hit] of buckets) {
    if (hit.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the window resets — for the Retry-After header. */
  retryAfter: number;
};

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const hit = buckets.get(key);
  if (!hit || hit.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  hit.count += 1;
  if (hit.count > limit) {
    return { ok: false, retryAfter: Math.ceil((hit.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client identity behind Vercel's proxy. */
export function clientKey(req: Request, scope: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}

/**
 * Rejects cross-origin posts. The Kreator endpoints are only ever called by
 * our own pages, so anything with a foreign Origin is not a real visitor.
 * Requests with no Origin at all (server-side, curl) still pass — this is a
 * filter against drive-by abuse from other sites, not an auth mechanism.
 */
export function isForeignOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}
