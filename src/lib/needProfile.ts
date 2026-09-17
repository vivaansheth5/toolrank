import type { ExperienceLevel, PriceTier, Strength, Tool } from "@/data/types";

/**
 * A "need profile" is a structured, matching-friendly view of a Tool built
 * entirely from fields that already exist on it (tags, features, pros,
 * cons, strengths, experienceLevel, pricing.tier, targetAudience). It adds
 * no new data — it just names the existing fields the way the need-based
 * discovery flow (lib/needMatch.ts, lib/needCompare.ts) wants to read them,
 * so nothing here can fabricate a capability, limitation or price a tool
 * doesn't already have on record.
 */
export interface NeedProfile {
  tool: Tool;
  /** Searchable text surface for "does this tool relate to X" checks —
   *  name, tagline, description, subcategory, tags and features joined and
   *  lowercased. */
  searchText: string;
  /** = tool.features. What the tool can actually do, in its own words. */
  capabilities: string[];
  /** = tool.pros. Real curated upsides. */
  bestFor: string[];
  /** = tool.cons. Real curated limitations — the only source ever used for
   *  "what you might miss". */
  limitations: string[];
  /** = tool.strengths. Doubles as the tool's declared priorities. */
  priorities: Strength[];
  experienceLevel: ExperienceLevel[];
  pricingTier: PriceTier;
}

export function getNeedProfile(tool: Tool): NeedProfile {
  const searchText = [
    tool.name,
    tool.tagline,
    tool.description,
    tool.subcategory,
    ...tool.tags,
    ...tool.features,
  ]
    .join(" ")
    .toLowerCase();

  return {
    tool,
    searchText,
    capabilities: tool.features,
    bestFor: tool.pros,
    limitations: tool.cons,
    priorities: tool.strengths,
    experienceLevel: tool.experienceLevel,
    pricingTier: tool.pricing.tier,
  };
}

export const TIER_ORDER: PriceTier[] = ["free", "under-500", "500-1000", "1000-plus"];

export function tierRank(tier: PriceTier): number {
  return TIER_ORDER.indexOf(tier);
}
