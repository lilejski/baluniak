import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALE_COOKIE = "baluniak-lang";
const SUPPORTED_LOCALES = ["pl", "en"] as const;
const VERCEL_IP_COUNTRY_HEADER = "x-vercel-ip-country";

/**
 * Geolocation-based locale: PL → /pl, non-PL or unknown → /en.
 * Cookie (explicit user choice) overrides geolocation to avoid redirect loops
 * when user has already chosen a language.
 */
function getPreferredLocale(request: NextRequest): "pl" | "en" {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value?.toLowerCase();
  if (cookie === "en" || cookie === "pl") return cookie;

  const country = request.headers.get(VERCEL_IP_COUNTRY_HEADER)?.toUpperCase();
  if (country === "PL") return "pl";
  if (country) return "en";

  const acceptLang = request.headers.get("accept-language");
  if (acceptLang?.toLowerCase().includes("pl")) return "pl";
  return "en";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API, static assets, and Next internals (no redirect)
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  // Already on a locale path → no redirect (prevents redirect loops)
  if (firstSegment && SUPPORTED_LOCALES.includes(firstSegment as "pl" | "en")) {
    return NextResponse.next();
  }

  const locale = getPreferredLocale(request);
  const newPath = `/${locale}${pathname === "/" ? "" : pathname}`;
  const url = request.nextUrl.clone();
  url.pathname = newPath;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
