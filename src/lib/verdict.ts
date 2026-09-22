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

export const STRENGTH_PHRASES: Record<Strength, string> = {
  "ease-of-use": "ease of use",
  quality: "output quality",
  price: "price",
  features: "feature depth",
  speed: "speed",
};

/**
 * Deterministic per-tool fit summaries for a set of compared tools, built
 * entirely from existing tool metadata (rating, pricing tier, free plan,
 * strengths, tagline). No AI call — mirrors the same transparent,
 * explainable approach used by lib/recommend.ts.
 *
 * Deliberately never declares a "Best overall" / "Best value" winner: each
 * tool gets its own fact-grounded label ("Highest-rated", "Lowest starting
 * price", "Known for X") so the reader can weigh the actual tradeoff rather
 * than be handed a single global pick.
 *
 * IMPORTANT: this must never read affiliate/deal data. Recommendation and
 * monetization are deliberately independent — whether a tool has an offer
 * never changes anything here.
 */
export function getCompareVerdicts(tools: Tool[]): CompareVerdict[] {
  if (tools.length < 2) return [];

  const highestRated = [...tools].sort((a, b) => b.rating - a.rating || b.popularity - a.popularity)[0];
  const lowestPrice = [...tools].sort((a, b) => {
    const tierDiff = tierRank(a.pricing.tier) - tierRank(b.pricing.tier);
    if (tierDiff !== 0) return tierDiff;
    if (a.freePlan !== b.freePlan) return a.freePlan ? -1 : 1;
    return b.rating - a.rating;
  })[0];

  return tools.map((tool) => {
    const primaryStrength = tool.strengths[0];
    const strengthLabel = primaryStrength ? STRENGTH_PHRASES[primaryStrength] : undefined;
    const notes: string[] = [];

    if (tool.slug === highestRated.slug) {
      notes.push(`is the highest-rated in this group at ${tool.rating.toFixed(1)}/5`);
    }
    if (tool.slug === lowestPrice.slug) {
      notes.push(
        tool.freePlan ? "has a free plan and the lowest cost to start here" : "has the lowest starting price here"
      );
    }
    if (strengthLabel) {
      notes.push(`stands out for ${strengthLabel}`);
    }

    let label = "Also worth a look";
    if (tool.slug === highestRated.slug) label = "Highest-rated";
    else if (tool.slug === lowestPrice.slug) label = "Lowest starting price";
    else if (strengthLabel) label = `Known for ${strengthLabel}`;

    return {
      tool,
      label,
      reason:
        notes.length > 0
          ? `${tool.name} ${notes.join(" and ")} — worth it if that's what matters most to you.`
          : `${tool.name}: ${tool.tagline}`,
    };
  });
}
