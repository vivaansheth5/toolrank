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

const STRENGTH_LABELS: Record<Strength, { label: string; blurb: string }> = {
  "ease-of-use": { label: "Easiest to use", blurb: "the easiest of the group to pick up" },
  quality: { label: "Best quality", blurb: "known for the highest-quality output" },
  price: { label: "Most affordable", blurb: "known for strong value at its price point" },
  features: { label: "Most features", blurb: "packed with the most features of the group" },
  speed: { label: "Fastest results", blurb: "known for getting you results the fastest" },
};

/**
 * Deterministic "which one should you choose" verdicts for a set of
 * compared tools, built entirely from existing tool metadata (rating,
 * pricing tier, free plan, strengths). No AI call — mirrors the same
 * transparent, explainable approach used by lib/recommend.ts.
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
    reason: `Rated ${overall.rating.toFixed(1)}/5 — the strongest all-round pick of the group.`,
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
        ? "Has a free plan and the lowest starting price of the group."
        : "The lowest starting price of the group.",
    });
    remaining.splice(remaining.indexOf(value), 1);
  }

  for (const tool of remaining) {
    const meta = tool.strengths.map((s) => STRENGTH_LABELS[s]).find(Boolean);
    verdicts.push({
      tool,
      label: meta?.label ?? "Worth a look",
      reason: meta ? `${tool.name} is ${meta.blurb}.` : `A solid alternative worth considering.`,
    });
  }

  return verdicts;
}
