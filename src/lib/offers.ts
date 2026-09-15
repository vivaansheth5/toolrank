import type { Deal, Tool } from "@/data/types";

export interface ResolvedCta {
  href: string;
  label: "Get Offer" | "Visit Official Site";
  isAffiliate: boolean;
}

/**
 * The single place that decides where a monetization CTA points and what
 * it says. "Get Offer" only ever appears — and only ever links to
 * affiliateUrl — when a deal actually has a verified affiliate link.
 * Everything else, including every current demo/sample offer, is honestly
 * labeled "Visit Official Site" and points at the tool's own officialUrl.
 * Never falls back to officialUrl for affiliateUrl or vice versa.
 */
export function resolveOfferCta(tool: Tool, deal?: Deal): ResolvedCta {
  if (deal?.affiliateUrl) {
    return { href: deal.affiliateUrl, label: "Get Offer", isAffiliate: true };
  }
  return { href: tool.officialUrl, label: "Visit Official Site", isAffiliate: false };
}
