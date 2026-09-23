/**
 * Deterministic tests for the currency DISPLAY localization layer
 * (lib/currency.ts) — country defaulting, vendor-price parsing, the
 * official > converted > original priority order, and independence from
 * ranking/affiliate logic. Run with:
 * npx tsx scripts/test-currency.ts
 */
import { readFileSync } from "fs";
import { join } from "path";
import { tools } from "../src/data/tools";
import { deals } from "../src/data/deals";
import {
  currencyForCountry,
  countryFromAcceptLanguage,
  parseVendorPriceString,
  convertFromUsd,
  formatMoney,
  localizeVendorPrice,
  getPriceTierLabel,
  SUPPORTED_CURRENCIES,
} from "../src/lib/currency";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${message}`);
  } else {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${message}`);
  }
}

function section(title: string) {
  console.log(`\n${title}`);
}

// ---------------------------------------------------------------------------
section("Country -> default currency (spec's exact defaults)");
{
  assert(currencyForCountry("IN") === "INR", "India -> INR");
  assert(currencyForCountry("US") === "USD", "United States -> USD");
  assert(currencyForCountry("GB") === "GBP", "United Kingdom -> GBP");
  assert(currencyForCountry("DE") === "EUR", "Germany (Eurozone) -> EUR");
  assert(currencyForCountry("FR") === "EUR", "France (Eurozone) -> EUR");
  assert(currencyForCountry("JP") === "USD", "Japan (unsupported) falls back to USD");
  assert(currencyForCountry("BR") === "USD", "Brazil (unsupported) falls back to USD");
  assert(currencyForCountry(undefined) === "USD", "no country signal at all -> USD");
  assert(currencyForCountry(null) === "USD", "null country -> USD");
  assert(currencyForCountry("in") === "INR", "country matching is case-insensitive");
}

// ---------------------------------------------------------------------------
section("Accept-Language fallback region parsing");
{
  assert(countryFromAcceptLanguage("en-IN,en;q=0.9") === "IN", "parses region from 'en-IN,en;q=0.9'");
  assert(countryFromAcceptLanguage("en-GB") === "GB", "parses region from a bare 'en-GB'");
  assert(countryFromAcceptLanguage("en") === undefined, "no region subtag -> undefined, not a guess");
  assert(countryFromAcceptLanguage(undefined) === undefined, "missing header -> undefined");
}

// ---------------------------------------------------------------------------
section("Vendor price string parsing — every real tool price in the dataset");
{
  let allParsed = true;
  for (const tool of tools) {
    if (!tool.pricing.startingPrice) continue;
    const parsed = parseVendorPriceString(tool.pricing.startingPrice);
    if (!parsed) {
      allParsed = false;
      console.log(`    unparsed: ${tool.id} -> "${tool.pricing.startingPrice}"`);
    }
  }
  assert(allParsed, "every tool's curated startingPrice string parses to a real numeric amount");

  const p1 = parseVendorPriceString("From $9/seat/month");
  assert(!!p1 && p1.prefix === "From " && p1.amount === 9 && p1.suffix === "/seat/month", "parses 'From $9/seat/month'");

  const p2 = parseVendorPriceString("$168/year");
  assert(!!p2 && p2.prefix === "" && p2.amount === 168 && p2.suffix === "/year", "parses '$168/year' with no prefix");

  const p3 = parseVendorPriceString("$0/month for 3 months");
  assert(!!p3 && p3.amount === 0 && p3.suffix === "/month for 3 months", "parses a $0 promo price with trailing text");

  assert(parseVendorPriceString("14-day trial") === null, "'14-day trial' has no amount -> null, never a fabricated number");
  assert(parseVendorPriceString("See website") === null, "'See website' -> null");
}

// ---------------------------------------------------------------------------
section("FX conversion + money formatting");
{
  assert(convertFromUsd(1, "USD") === 1, "USD -> USD is identity");
  assert(convertFromUsd(20, "INR") > 1000, "20 USD converts to a plausible INR amount (> 1000)");
  assert(formatMoney(20, "USD") === "$20", "formatMoney(20, USD) -> $20, no trailing .00 for a whole number");
  assert(formatMoney(19.99, "USD") === "$19.99", "formatMoney keeps 2 decimals for a non-whole USD amount");
  assert(/^₹[\d,]+$/.test(formatMoney(1660, "INR")), "INR is always shown as whole rupees with the ₹ symbol");
  assert(formatMoney(1000000, "INR").startsWith("₹1,000,000") || formatMoney(1000000, "INR") === "₹1,000,000", "large INR amounts are comma-grouped");
}

// ---------------------------------------------------------------------------
section("localizeVendorPrice — priority order: official > converted > original");
{
  const usd = localizeVendorPrice("From $20/month", "USD");
  assert(!!usd && usd.primary === "From $20/month", "target currency === vendor currency -> shown verbatim, unmodified");
  assert(!!usd && !usd.isApproximate && !usd.isOfficial, "same-currency display is neither 'approximate' nor 'official'");
  assert(!!usd && !usd.secondary, "no redundant secondary caption when nothing was converted");

  const inr = localizeVendorPrice("From $20/month", "INR");
  assert(!!inr && /^Approx\./.test(inr.primary), "a real conversion is always labeled 'Approx.'");
  assert(!!inr && inr.primary.includes("₹"), "converted primary is denominated in the target currency");
  assert(!!inr && inr.isApproximate === true && inr.isOfficial === false, "conversion is flagged approximate, never official");
  assert(!!inr && inr.secondary === "From $20/month", "original vendor price is always still shown alongside a conversion");

  const withOfficial = localizeVendorPrice("From $20/month", "INR", {
    countryPrice: { amount: 1499, currency: "INR", official: true },
  });
  assert(!!withOfficial && withOfficial.primary === "₹1,499", "a verified official local price wins over FX conversion");
  assert(!!withOfficial && withOfficial.isOfficial === true && withOfficial.isApproximate === false, "official price is never mislabeled approximate");
  assert(!!withOfficial && withOfficial.secondary === "From $20/month", "the real vendor price is still available even next to an official local price");

  // An official price for a DIFFERENT currency than what's being requested
  // must not be used — priority is per-currency, never a generic override.
  const officialForWrongCurrency = localizeVendorPrice("From $20/month", "GBP", {
    countryPrice: { amount: 1499, currency: "INR", official: true },
  });
  assert(!!officialForWrongCurrency && officialForWrongCurrency.isOfficial === false, "an INR official price never leaks into a GBP request");

  const trial = localizeVendorPrice("14-day trial", "INR");
  assert(!!trial && trial.primary === "14-day trial", "an unparseable vendor string is shown as-is — never a fabricated conversion");
  assert(!!trial && !trial.isApproximate, "no fabricated amount means never flagged approximate either");

  assert(localizeVendorPrice(undefined, "INR") === undefined, "no vendor price at all -> undefined (caller shows its own fallback)");
}

// ---------------------------------------------------------------------------
section("Never invents countryPrices — sample dataset has zero fabricated local prices");
{
  const anyFabricated = tools.some((t) => t.pricing.countryPrices && Object.keys(t.pricing.countryPrices).length > 0);
  assert(!anyFabricated, "no tool in the current dataset has a countryPrices entry — none are verified yet, so none are invented");
}

// ---------------------------------------------------------------------------
section("Deal prices localize the same way, using the deal's own currency");
{
  for (const deal of deals) {
    if (deal.offerPrice) {
      const localized = localizeVendorPrice(deal.offerPrice, "INR", { vendorCurrency: deal.currency });
      assert(!!localized, `deal ${deal.id}'s offerPrice localizes without throwing`);
    }
  }
  const semrushTrial = deals.find((d) => d.id === "deal-semrush")!;
  const localizedTrial = localizeVendorPrice(semrushTrial.offerPrice, "EUR", { vendorCurrency: semrushTrial.currency });
  assert(!!localizedTrial && localizedTrial.primary === "14-day trial", "a non-monetary deal ('14-day trial') is never converted into a fake price");
}

// ---------------------------------------------------------------------------
section("Price-tier labels are currency-aware and consistent across all 4 currencies");
{
  for (const currency of SUPPORTED_CURRENCIES) {
    assert(getPriceTierLabel("free", currency) === "Free", `"free" tier reads "Free" in ${currency}`);
    const under500 = getPriceTierLabel("under-500", currency);
    const under1000 = getPriceTierLabel("500-1000", currency);
    const plus = getPriceTierLabel("1000-plus", currency);
    assert(under500 !== under1000 && under1000 !== plus, `${currency} tier labels are distinct across buckets`);
  }
  const usdLabel = getPriceTierLabel("under-500", "USD");
  const inrLabel = getPriceTierLabel("under-500", "INR");
  assert(usdLabel !== inrLabel, "USD and INR bucket labels are genuinely different (the pre-existing bug this closes)");
  assert(inrLabel.includes("₹"), "INR tier label uses the rupee symbol");
  assert(usdLabel.includes("$"), "USD tier label uses the dollar symbol");
}

// ---------------------------------------------------------------------------
section("Currency never influences ranking, matching, or affiliate/commission logic");
{
  const rankingFiles = [
    "../src/lib/recommend.ts",
    "../src/lib/needMatch.ts",
    "../src/lib/needProfile.ts",
    "../src/lib/verdict.ts",
    "../src/lib/offers.ts",
  ];
  for (const relPath of rankingFiles) {
    const src = readFileSync(join(__dirname, relPath), "utf8");
    assert(
      !/lib\/currency|useCurrency|CurrencyCode|localizeVendorPrice/.test(src),
      `${relPath.split("/").pop()} never imports/reads the currency layer`
    );
  }
}

// ---------------------------------------------------------------------------
section("PriceTier enum itself is unaffected — same 4 buckets used for matching everywhere");
{
  const tierValues = new Set(tools.map((t) => t.pricing.tier));
  const expected: string[] = ["free", "under-500", "500-1000", "1000-plus"];
  assert(
    [...tierValues].every((t) => expected.includes(t)),
    "every tool's pricing.tier is still one of the original 4 currency-agnostic buckets"
  );
}

// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
