import { getDimensionsForCategory, type ComparisonDimension } from "@/data/comparisonDimensions";
import type { ParsedNeed } from "./needSignals";
import type { Tool } from "@/data/types";

/**
 * Normalized comparison strength — deliberately not a number. "unknown"
 * means the sample dataset has no evidence either way; "notAvailable" is
 * reserved for the one dimension (freePlanValue) backed by a real boolean
 * field, never inferred from missing keywords. unknown !== notAvailable.
 */
export type FitLevel = "strong" | "good" | "basic" | "limited" | "notAvailable" | "unknown";

export interface DimensionEvidence {
  dimension: ComparisonDimension;
  level: FitLevel;
  /** Short, decision-relevant sentence — always either the tool's own
   *  feature/pro/con text verbatim, or the required fallback string. Never
   *  invented. */
  description: string;
  /** The exact source text the description was drawn from (a real
   *  feature/pro/con/tag/description fragment), when a match was found. */
  evidence?: string;
  /** tool.lastVerified, carried through untouched — undefined (never a
   *  fabricated date) when the tool record doesn't have one. */
  lastVerified?: string;
}

export type ComparisonProfile = Record<string, DimensionEvidence>;

export const NOT_ENOUGH_VERIFIED_INFO = "We don't have enough verified information to make a specific claim here.";

function findMatch(texts: { text: string; source: string }[], keywords: string[]): string | undefined {
  for (const { text, source } of texts) {
    const lower = text.toLowerCase();
    if (keywords.some((k) => lower.includes(k))) return source;
  }
  return undefined;
}

/**
 * Classifies one tool against one dimension using only the tool's own
 * existing fields, in order of how confidently that field asserts a real
 * capability: features/pros (positive, structured claims) > tags/tagline/
 * description (general categorization) > cons (an explicitly stated
 * limitation, never spun as a strength). No match anywhere -> "unknown",
 * never silently "notAvailable" or "No".
 */
function classifyDimension(tool: Tool, dim: ComparisonDimension): DimensionEvidence {
  if (dim.id === "freePlanValue") return classifyFreePlan(tool, dim);
  if (dim.id === "easeOfUse" && tool.strengths.includes("ease-of-use")) {
    const evidence = tool.pros.find((p) => /easy|intuitive|approachable|simple/i.test(p)) ?? tool.tagline;
    return {
      dimension: dim,
      level: "strong",
      description: evidence,
      evidence,
      lastVerified: tool.lastVerified,
    };
  }

  const strongSources = [
    ...tool.features.map((text) => ({ text, source: text })),
    ...tool.pros.map((text) => ({ text, source: text })),
  ];
  const basicSources = [
    { text: tool.tagline, source: tool.tagline },
    { text: tool.description, source: tool.description },
    ...tool.tags.map((text) => ({ text, source: text })),
    { text: tool.subcategory, source: tool.subcategory },
  ];
  const limitedSources = tool.cons.map((text) => ({ text, source: text }));

  const strongHit = findMatch(strongSources, dim.strongKeywords);
  if (strongHit) {
    return { dimension: dim, level: "strong", description: strongHit, evidence: strongHit, lastVerified: tool.lastVerified };
  }

  const goodHit = dim.goodKeywords ? findMatch(strongSources, dim.goodKeywords) : undefined;
  if (goodHit) {
    return { dimension: dim, level: "good", description: goodHit, evidence: goodHit, lastVerified: tool.lastVerified };
  }

  const basicHit = findMatch(basicSources, [...dim.strongKeywords, ...(dim.goodKeywords ?? [])]);
  if (basicHit) {
    return { dimension: dim, level: "basic", description: basicHit, evidence: basicHit, lastVerified: tool.lastVerified };
  }

  const limitedHit = findMatch(limitedSources, [...dim.strongKeywords, ...(dim.goodKeywords ?? [])]);
  if (limitedHit) {
    return { dimension: dim, level: "limited", description: limitedHit, evidence: limitedHit, lastVerified: tool.lastVerified };
  }

  return { dimension: dim, level: "unknown", description: NOT_ENOUGH_VERIFIED_INFO, lastVerified: tool.lastVerified };
}

/** The one dimension backed by a real structured boolean rather than
 *  keyword guessing, so it's the only one allowed to say "notAvailable". */
function classifyFreePlan(tool: Tool, dim: ComparisonDimension): DimensionEvidence {
  if (tool.freePlan) {
    const evidence = tool.pros.find((p) => /free/i.test(p)) ?? tool.features.find((f) => /free/i.test(f));
    return {
      dimension: dim,
      level: "strong",
      description: evidence ?? `${tool.name} has a free plan.`,
      evidence,
      lastVerified: tool.lastVerified,
    };
  }
  const evidence = tool.cons.find((c) => /free/i.test(c));
  return {
    dimension: dim,
    level: "notAvailable",
    description: evidence ?? `${tool.name} has no free plan.`,
    evidence,
    lastVerified: tool.lastVerified,
  };
}

/** Full comparison profile for a tool — every dimension defined for its
 *  category, classified from its own real data. Deterministic: same tool
 *  in, same profile out, every time. */
export function getComparisonProfile(tool: Tool): ComparisonProfile {
  const dims = getDimensionsForCategory(tool.category);
  const profile: ComparisonProfile = {};
  for (const dim of dims) {
    profile[dim.id] = classifyDimension(tool, dim);
  }
  return profile;
}

/**
 * Personalized dimension selection (spec: "Do NOT surface irrelevant
 * dimensions simply because they exist in the database"). Dimensions whose
 * relatedChipIds intersect the user's stated need are shown first; ease of
 * use and free-plan/value are always included as baseline decision axes.
 * With no stated need, falls back to the category's default (schema) order.
 *
 * When the compared tools span different categories (e.g. a design tool vs
 * an image tool), only dimension ids present in EVERY compared tool's own
 * category schema are used — every id returned here is guaranteed to exist
 * in getComparisonProfile() for all of `tools`, so callers can safely index
 * profile[dim.id] without an undefined check. easeOfUse/freePlanValue exist
 * identically in every category, so a mixed-category pair still gets a
 * real (if smaller) comparison rather than an empty/broken one.
 */
export function selectRelevantDimensions(
  tools: Tool[],
  parsedNeed: ParsedNeed | null,
  limit = 12
): ComparisonDimension[] {
  if (tools.length === 0) return [];
  const perToolIds = tools.map((t) => new Set(getDimensionsForCategory(t.category).map((d) => d.id)));
  const all = getDimensionsForCategory(tools[0].category).filter((d) => perToolIds.every((ids) => ids.has(d.id)));

  if (!parsedNeed || parsedNeed.chips.length === 0) {
    return all.slice(0, limit);
  }

  const chipIds = new Set(parsedNeed.chips.map((c) => c.id));
  const relevant = all.filter((d) => d.relatedChipIds.some((id) => chipIds.has(id)));
  const baseline = all.filter((d) => (d.id === "easeOfUse" || d.id === "freePlanValue") && !relevant.includes(d));
  const combined = [...relevant, ...baseline];
  return (combined.length > 0 ? combined : all).slice(0, limit);
}

const LEVEL_RANK: Record<FitLevel, number> = { strong: 4, good: 3, basic: 2, limited: 1, notAvailable: 0, unknown: -1 };

export function compareLevels(a: FitLevel, b: FitLevel): number {
  return LEVEL_RANK[a] - LEVEL_RANK[b];
}

export const FIT_LEVEL_LABEL: Record<FitLevel, string> = {
  strong: "Strong fit",
  good: "Good fit",
  basic: "Basic support",
  limited: "Limited",
  notAvailable: "Not available",
  unknown: "Unknown",
};
