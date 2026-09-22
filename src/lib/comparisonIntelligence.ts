import type { ComparisonDimension } from "@/data/comparisonDimensions";
import {
  getComparisonProfile,
  selectRelevantDimensions,
  compareLevels,
  FIT_LEVEL_LABEL,
  NOT_ENOUGH_VERIFIED_INFO,
  type FitLevel,
} from "./comparisonProfile";
import type { ParsedNeed } from "./needSignals";
import type { Tool } from "@/data/types";

/**
 * The decision-intelligence layer sitting on top of comparisonProfile.ts —
 * turns per-dimension evidence into the actual sections a comparison page
 * needs (key differences, quick take, personalized get/miss, pricing).
 * Every function here reads only real Tool fields (via the profile) or the
 * ParsedNeed the user already typed — nothing is invented, and nothing
 * here ever reads affiliate/deal data.
 */

export interface PersonalizedGetMiss {
  tool: Tool;
  get: { text: string; dimensionLabel: string }[];
  miss: { text: string; dimensionLabel: string }[];
  /** Set only when BOTH get and miss ended up empty — the one place the UI
   *  should show the required fallback string instead of an empty list. */
  insufficientData: boolean;
}

/**
 * "What you get" / "What you might miss", personalized to the dimensions
 * relevant to the stated need (or the category's default set with none
 * stated). strong/good evidence -> get; limited/notAvailable -> miss;
 * basic/unknown are genuinely inconclusive and go in neither bucket rather
 * than being forced into a false positive or negative.
 */
export function buildPersonalizedGetMiss(
  tool: Tool,
  allTools: Tool[],
  parsedNeed: ParsedNeed | null
): PersonalizedGetMiss {
  const dims = selectRelevantDimensions(allTools, parsedNeed, 12);
  const profile = getComparisonProfile(tool);
  const get: PersonalizedGetMiss["get"] = [];
  const miss: PersonalizedGetMiss["miss"] = [];

  for (const dim of dims) {
    const e = profile[dim.id];
    if (e.level === "strong" || e.level === "good") {
      get.push({ text: e.description, dimensionLabel: dim.label });
    } else if (e.level === "limited" || e.level === "notAvailable") {
      miss.push({ text: e.description, dimensionLabel: dim.label });
    }
  }

  return { tool, get, miss, insufficientData: get.length === 0 && miss.length === 0 };
}

export interface KeyDifference {
  dimension: ComparisonDimension;
  /** true when every compared tool landed at the same level tier — shown
   *  as "Both/all are strong fits here" rather than a manufactured gap. */
  isTie: boolean;
  /** One line per tool: name + level + short evidence-backed detail. */
  lines: { tool: Tool; level: FitLevel; text: string }[];
}

/**
 * "Key differences" — 3-5 dimensions where the compared tools' evidence
 * actually diverges, ranked by how large that gap is; genuine ties are
 * reported honestly ("Both are strong fits here") rather than invented.
 */
export function buildKeyDifferences(tools: Tool[], parsedNeed: ParsedNeed | null, limit = 5): KeyDifference[] {
  if (tools.length < 2) return [];
  const dims = selectRelevantDimensions(tools, parsedNeed, 12);
  const profiles = tools.map((t) => getComparisonProfile(t));

  const scored = dims.map((dim) => {
    const lines = tools.map((tool, i) => {
      const e = profiles[i][dim.id];
      return { tool, level: e.level, text: e.description };
    });
    const levels = lines.map((l) => l.level);
    const maxLevel = levels.reduce((a, b) => (compareLevels(b, a) > 0 ? b : a));
    const minLevel = levels.reduce((a, b) => (compareLevels(b, a) < 0 ? b : a));
    const gap = compareLevels(maxLevel, minLevel);
    return { dim, lines, gap, isTie: gap === 0 };
  });

  // Genuine divergences first (largest gap first), then honest ties —
  // never pad the list with manufactured differences.
  const sorted = [...scored].sort((a, b) => b.gap - a.gap);
  return sorted.slice(0, limit).map((s) => ({ dimension: s.dim, isTie: s.isTie, lines: s.lines }));
}

export interface QuickTakeRow {
  dimension: ComparisonDimension;
  betterTool: Tool;
  reason: string;
}

/**
 * "Quick take" — up to 2 short, dimension-grounded pointers so a reader
 * doesn't have to read the whole page. Only includes a dimension where one
 * tool has genuinely stronger evidence than the other(s) — never a coin
 * flip presented as a recommendation.
 */
export function buildQuickTake(tools: Tool[], parsedNeed: ParsedNeed | null, limit = 2): QuickTakeRow[] {
  if (tools.length < 2) return [];
  const dims = selectRelevantDimensions(tools, parsedNeed, 12);
  const profiles = tools.map((t) => getComparisonProfile(t));
  const rows: QuickTakeRow[] = [];

  for (const dim of dims) {
    const entries = tools.map((tool, i) => ({ tool, evidence: profiles[i][dim.id] }));
    const sorted = [...entries].sort((a, b) => compareLevels(b.evidence.level, a.evidence.level));
    const [top, second] = sorted;
    if (!second) continue;
    if (top.evidence.level === "unknown" || compareLevels(top.evidence.level, second.evidence.level) <= 0) continue;
    rows.push({
      dimension: dim,
      betterTool: top.tool,
      reason: top.evidence.description,
    });
    if (rows.length >= limit) break;
  }

  return rows;
}

export interface PricingRow {
  tool: Tool;
  model: Tool["pricing"]["model"];
  paidPlan?: string;
  startingPrice?: string;
  freePlan: boolean;
  lastVerified?: string;
}

/**
 * Pricing as its own decision-relevant section — direct passthrough of the
 * existing structured pricing fields (no derivation, no invented values).
 * lastVerified is undefined for every tool in this sample dataset, so the
 * UI shows "Pricing not verified" rather than a fabricated date.
 */
export function buildPricingComparison(tools: Tool[]): PricingRow[] {
  return tools.map((tool) => ({
    tool,
    model: tool.pricing.model,
    paidPlan: tool.pricing.paidPlan,
    startingPrice: tool.pricing.startingPrice,
    freePlan: tool.freePlan,
    lastVerified: tool.lastVerified,
  }));
}

export { FIT_LEVEL_LABEL, NOT_ENOUGH_VERIFIED_INFO };
