import type { PriceTier, Strength, Tool } from "@/data/types";

export interface CompareVerdict {
  tool: Tool;
  label: string;
  reason: string;
}

const TIER_ORDER: PriceTier[] = ["free", "under-500", "500-1000", "1000-plus"];

function tierRank(tier: PriceTier): number {
  return TIER_ORDER.indexOf(tier);
}

const STRENGTH_LABELS: Record<Strength, string> = {
  "ease-of-use": "ease of use",
  quality: "output quality",
  price: "price",
  features: "feature depth",
  speed: "speed",
};

/**
 * Deterministic "which one should you choose" verdicts for a set of
 * compared tools, built entirely from existing tool metadata (rating,
 * pricing tier, free plan, strengths, tagline). No AI call — mirrors the
 * same transparent, explainable approach used by lib/recommend.ts.
 *
 * IMPORTANT: this must never read affiliate/deal data. Recommendation and
 * monetization are deliberately independent — whether a tool has an offer
 * never changes its verdict or ranking here.
 */
export function getCompareVerdicts(tools: Tool[]): CompareVerdict[] {
  if (tools.length < 2) return [];

  const remaining = [...tools];
  const verdicts: CompareVerdict[] = [];

  const overall = [...remaining].sort(
    (a, b) => b.rating - a.rating || b.popularity - a.popularity
  )[0];
  verdicts.push({
    tool: overall,
    label: "Best overall",
    reason: `Choose ${overall.name} if you want the strongest all-round pick — rated ${overall.rating.toFixed(1)}/5, the highest of the group.`,
  });
  remaining.splice(remaining.indexOf(overall), 1);

  if (remaining.length > 0) {
    const value = [...remaining].sort((a, b) => {
      const tierDiff = tierRank(a.pricing.tier) - tierRank(b.pricing.tier);
      if (tierDiff !== 0) return tierDiff;
      if (a.freePlan !== b.freePlan) return a.freePlan ? -1 : 1;
      return b.rating - a.rating;
    })[0];
    verdicts.push({
      tool: value,
      label: "Best value",
      reason: value.freePlan
        ? `Choose ${value.name} if price is the deciding factor: it has a free plan and the lowest cost to start of the group.`
        : `Choose ${value.name} if price is the deciding factor: it has the lowest starting price of the group.`,
    });
    remaining.splice(remaining.indexOf(value), 1);
  }

  for (const tool of remaining) {
    const primaryStrength = tool.strengths[0];
    const strengthLabel = primaryStrength ? STRENGTH_LABELS[primaryStrength] : undefined;
    verdicts.push({
      tool,
      label: strengthLabel ? `Best for ${strengthLabel}` : "Worth a look",
      reason: strengthLabel
        ? `Choose ${tool.name} if your priority is ${strengthLabel}: ${tool.tagline}`
        : `Choose ${tool.name} as a solid alternative: ${tool.tagline}`,
    });
  }

  return verdicts;
}
