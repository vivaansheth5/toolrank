import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { currencyForCountry, countryFromAcceptLanguage, DEFAULT_CURRENCY } from "@/lib/currency";

/**
 * Seeds the `td_currency` cookie from a coarse, country-level signal on a
 * visitor's FIRST request only — never overwrites a cookie that's already
 * there, so a manual pick (via CurrencySelector) always persists and is
 * never silently reset by re-detection on a later visit.
 *
 * Country-level only, never precise geolocation: `NextRequest`'s old
 * `geo`/`ip` fields were removed in Next.js 15, so this reads the
 * IP-country header a hosting edge sets (Vercel's `x-vercel-ip-country`,
 * or Cloudflare's `cf-ipcountry`) and falls back to the `Accept-Language`
 * region subtag when neither is present (e.g. local dev, other hosts) —
 * defaulting to USD when no signal is available at all.
 *
 * This only ever sets a cookie; it never reads `cookies()` in a Server
 * Component, so it doesn't force any page out of static generation.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has("td_currency")) {
    return NextResponse.next();
  }

  const countryCode =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    countryFromAcceptLanguage(request.headers.get("accept-language"));

  const currency = currencyForCountry(countryCode) ?? DEFAULT_CURRENCY;

  const response = NextResponse.next();
  response.cookies.set("td_currency", currency, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon|sitemap.xml|robots.txt).*)"],
};
