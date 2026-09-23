import type { CurrencyCode, PriceTier } from "@/data/types";

/**
 * Currency DISPLAY localization — a presentation layer only.
 *
 * Every tool/deal price in the dataset is curated and stored in USD (see
 * data/tools.ts, data/deals.ts — every `startingPrice`/`offerPrice`/
 * `originalPrice` is a "$X/period" string, every `currency` field is
 * "USD"). That's the actual reason USD shows up everywhere today: there
 * was never a second currency in the data model, so nothing downstream
 * had anything else to render. This file adds that second layer —
 * converting/formatting for display — without changing what's stored.
 *
 * Nothing here may influence ranking, matching, or affiliate/commission
 * logic: those all key off `Tool.pricing.tier` (a currency-agnostic
 * enum) or real USD amounts, never off the display currency.
 */

export type { CurrencyCode };

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ["USD", "INR", "GBP", "EUR"];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export const CURRENCY_META: Record<CurrencyCode, { symbol: string; label: string }> = {
  USD: { symbol: "$", label: "US Dollar" },
  INR: { symbol: "₹", label: "Indian Rupee" },
  GBP: { symbol: "£", label: "British Pound" },
  EUR: { symbol: "€", label: "Euro" },
};

export function isCurrencyCode(value: string | null | undefined): value is CurrencyCode {
  return !!value && (SUPPORTED_CURRENCIES as string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Country -> default currency
// ---------------------------------------------------------------------------

/** ISO 3166-1 alpha-2 codes for the 20 Eurozone member states. */
const EUROZONE_COUNTRIES = new Set([
  "AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE",
  "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

/**
 * Country -> default currency, per the spec's defaults. Deliberately
 * coarse (country-level only, never precise geolocation) and small: four
 * supported currencies, everything else falls back to USD until more are
 * added.
 */
export function currencyForCountry(countryCode?: string | null): CurrencyCode {
  if (!countryCode) return DEFAULT_CURRENCY;
  const cc = countryCode.trim().toUpperCase();
  if (cc === "IN") return "INR";
  if (cc === "US") return "USD";
  if (cc === "GB" || cc === "UK") return "GBP";
  if (EUROZONE_COUNTRIES.has(cc)) return "EUR";
  return DEFAULT_CURRENCY;
}

/** Best-effort region parse from an Accept-Language header value, e.g.
 *  "en-IN,en;q=0.9" -> "IN". Used only as a fallback signal when no
 *  IP-country header is present (e.g. non-Vercel/Cloudflare hosting). */
export function countryFromAcceptLanguage(acceptLanguage?: string | null): string | undefined {
  if (!acceptLanguage) return undefined;
  const first = acceptLanguage.split(",")[0]?.trim();
  const match = first?.match(/-([A-Za-z]{2})$/);
  return match?.[1]?.toUpperCase();
}

// ---------------------------------------------------------------------------
// FX conversion — static, approximate rates
// ---------------------------------------------------------------------------

/**
 * Static illustrative FX rates (USD -> target), reviewed at commit time.
 * There is no live-rate provider wired up, so every converted price is
 * inherently approximate and must always be labeled as such — never
 * presented as an official price. Replace with a live feed before this
 * matters for real transactions.
 */
const USD_RATE: Record<CurrencyCode, number> = {
  USD: 1,
  INR: 83,
  GBP: 0.79,
  EUR: 0.92,
};

export function convertFromUsd(amountUsd: number, to: CurrencyCode): number {
  return amountUsd * USD_RATE[to];
}

function convert(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  const amountUsd = amount / USD_RATE[from];
  return convertFromUsd(amountUsd, to);
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/** INR is conventionally shown as whole rupees; the others as whole units
 *  when the amount is round, otherwise 2 decimal places. */
export function formatMoney(amount: number, currency: CurrencyCode): string {
  const { symbol } = CURRENCY_META[currency];
  const rounded = currency === "INR" ? Math.round(amount) : Math.round(amount * 100) / 100;
  const decimals = currency === "INR" || Number.isInteger(rounded) ? 0 : 2;
  const formatted = rounded.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${formatted}`;
}

// ---------------------------------------------------------------------------
// Vendor price string parsing — every tool/deal price in this dataset is a
// free-text "$X/period" string (e.g. "From $9/seat/month", "$168/year").
// This parses out the numeric amount and the surrounding text without
// discarding it, so the original vendor string is always still available.
// ---------------------------------------------------------------------------

export interface ParsedVendorPrice {
  /** Text before the amount, e.g. "From " (or "" when absent). */
  prefix: string;
  amount: number;
  /** Text after the amount, e.g. "/month", "/seat/month", " for 3 months". */
  suffix: string;
}

const VENDOR_PRICE_RE = /^(From\s+)?[$£€₹]\s?(\d+(?:\.\d+)?)(.*)$/;

/** Returns null for strings with no parseable currency amount (e.g. "See
 *  website", "14-day trial") — callers must show those verbatim rather
 *  than inventing a number. */
export function parseVendorPriceString(str: string): ParsedVendorPrice | null {
  const match = str.match(VENDOR_PRICE_RE);
  if (!match) return null;
  const [, prefix = "", amountStr, suffix] = match;
  return { prefix, amount: parseFloat(amountStr), suffix };
}

// ---------------------------------------------------------------------------
// The main entry point every price-rendering component should use.
// ---------------------------------------------------------------------------

export interface CountryPriceEntry {
  amount: number;
  currency: CurrencyCode;
  /** Always true — this type only ever represents a verified, checked
   *  local price. There's no "unofficial countryPrice"; an unverified
   *  number belongs in the FX-conversion path instead. */
  official: true;
}

export interface LocalizedPrice {
  /** The prominent, primary price to show. */
  primary: string;
  /** The original vendor price string, shown alongside `primary` whenever
   *  `primary` isn't itself the vendor's own, unmodified price — so the
   *  real currency the vendor charges in is never hidden. */
  secondary?: string;
  /** True only for a verified official country-specific price — never for
   *  an FX conversion, however precise-looking. */
  isOfficial: boolean;
  /** True when `primary` is a static-rate conversion for display purposes
   *  only, and must be visibly labeled "Approx."/"≈" — never presented as
   *  what the vendor actually charges. */
  isApproximate: boolean;
}

/**
 * Localizes one vendor price string for display, following the required
 * priority order:
 *   1. Verified official country-specific price (`countryPrice`)
 *   2. Converted display price (approximate, clearly labeled)
 *   3. Original vendor currency (when nothing else applies, or the string
 *      isn't a parseable amount at all — e.g. "14-day trial")
 *
 * `vendorCurrency` defaults to "USD" because that's what every price in
 * this dataset is curated in today; a future non-USD-native record can
 * pass its own real currency here without this function changing.
 */
export function localizeVendorPrice(
  vendorPriceString: string | undefined,
  targetCurrency: CurrencyCode,
  options: { vendorCurrency?: CurrencyCode; countryPrice?: CountryPriceEntry } = {}
): LocalizedPrice | undefined {
  if (!vendorPriceString) return undefined;
  const vendorCurrency = options.vendorCurrency ?? "USD";

  // Priority 1: a real, verified official price for this exact currency —
  // never overridden by a generic FX conversion.
  if (options.countryPrice && options.countryPrice.currency === targetCurrency) {
    return {
      primary: formatMoney(options.countryPrice.amount, options.countryPrice.currency),
      secondary: vendorPriceString,
      isOfficial: true,
      isApproximate: false,
    };
  }

  const parsed = parseVendorPriceString(vendorPriceString);

  // Priority 3 (nothing to convert): not a parseable amount, or already in
  // the requested currency — show the real vendor string verbatim.
  if (!parsed || vendorCurrency === targetCurrency) {
    return { primary: vendorPriceString, isOfficial: false, isApproximate: false };
  }

  // Priority 2: approximate conversion, always labeled and always paired
  // with the untouched original.
  const convertedAmount = convert(parsed.amount, vendorCurrency, targetCurrency);
  const primary = `Approx. ${formatMoney(convertedAmount, targetCurrency)}${parsed.suffix}`;
  return { primary, secondary: vendorPriceString, isOfficial: false, isApproximate: true };
}

// ---------------------------------------------------------------------------
// Budget-tier labels — replaces the old hardcoded, currency-inconsistent
// PRICE_TIER_LABELS/BUDGET_REFINEMENT_LABELS maps in lib/utils.ts (one was
// INR, the other USD, for the exact same PriceTier enum — a real bug this
// task closes). Bucket boundaries are independent per-currency choices
// (friendly round numbers), not FX-converted from one another; the
// underlying PriceTier enum used for matching/ranking never changes.
// ---------------------------------------------------------------------------

const PRICE_TIER_LABELS_BY_CURRENCY: Record<CurrencyCode, Record<PriceTier, string>> = {
  USD: {
    free: "Free",
    "under-500": "Under $10/month",
    "500-1000": "Under $20/month",
    "1000-plus": "Under $50/month",
  },
  GBP: {
    free: "Free",
    "under-500": "Under £10/month",
    "500-1000": "Under £20/month",
    "1000-plus": "Under £50/month",
  },
  EUR: {
    free: "Free",
    "under-500": "Under €10/month",
    "500-1000": "Under €20/month",
    "1000-plus": "Under €50/month",
  },
  INR: {
    free: "Free",
    "under-500": "Under ₹1,000/month",
    "500-1000": "Under ₹2,000/month",
    "1000-plus": "Under ₹5,000/month",
  },
};

export function getPriceTierLabel(tier: PriceTier, currency: CurrencyCode): string {
  return PRICE_TIER_LABELS_BY_CURRENCY[currency][tier];
}
