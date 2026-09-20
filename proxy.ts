import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isLocale, type Locale } from "@/lib/i18n";

const LOCALE_COOKIE = "baluniak-lang";
const VERCEL_IP_COUNTRY_HEADER = "x-vercel-ip-country";

/** Countries served the German version by default. */
const GERMAN_SPEAKING = new Set(["DE", "AT", "CH", "LI"]);

/**
 * Geolocation-based locale: PL → /pl, the German-speaking countries → /de,
 * anything else → /en. The cookie (an explicit choice in the switcher) wins
 * over geolocation, so a visitor who picked a language is never bounced back.
 */
function getPreferredLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value?.toLowerCase();
  if (cookie && isLocale(cookie)) return cookie;

  const country = request.headers.get(VERCEL_IP_COUNTRY_HEADER)?.toUpperCase();
  if (country === "PL") return "pl";
  if (country && GERMAN_SPEAKING.has(country)) return "de";
  if (country) return "en";

  const acceptLang = request.headers.get("accept-language")?.toLowerCase();
  if (acceptLang?.includes("pl")) return "pl";
  if (acceptLang?.includes("de")) return "de";
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
  if (firstSegment && isLocale(firstSegment)) {
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
