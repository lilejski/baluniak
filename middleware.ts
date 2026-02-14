import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALE_COOKIE = "baluniak-lang";
const SUPPORTED_LOCALES = ["pl", "en"] as const;

function getPreferredLocale(request: NextRequest): "pl" | "en" {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value?.toLowerCase();
  if (cookie === "en" || cookie === "pl") return cookie;

  const acceptLang = request.headers.get("accept-language");
  if (acceptLang?.toLowerCase().includes("en")) return "en";
  return "pl";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API, static assets, and Next internals
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

  // Already has a valid locale
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
