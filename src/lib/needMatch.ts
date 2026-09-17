import { tools } from "@/data/tools";
import { getNeedProfile, tierRank } from "./needProfile";
import type { ParsedNeed, RequirementChip } from "./needSignals";
import type { Tool } from "@/data/types";

export interface NeedMatch {
  tool: Tool;
  /** Transparent 0–97 score: matched weight ÷ total weight available for
   *  this need, never padded with a fake minimum. */
  matchPercent: number;
  matchedChips: RequirementChip[];
  unmatchedChips: RequirementChip[];
}

function chipMatchesTool(chip: RequirementChip, searchText: string, tool: Tool): boolean {
  if (chip.tagHints.some((hint) => searchText.includes(hint))) return true;
  if (chip.categoryHint && tool.category === chip.categoryHint) return true;
  if (chip.typeHint && tool.type === chip.typeHint) return true;
  return false;
}

interface ToolScore {
  tool: Tool;
  score: number;
  maxScore: number;
  tieBreak: number;
  matchedChips: RequirementChip[];
  unmatchedChips: RequirementChip[];
}

/**
 * Scores a single tool against a ParsedNeed using only real, existing tool
 * fields (via needProfile). Never reads affiliateEnabled/affiliateUrl/deal
 * data — monetization has no path into this function. Budget only affects
 * scoring when parsedNeed.budgetHint is explicitly set (i.e. the user said
 * so), never inferred otherwise. Exported so callers that already have a
 * fixed tool list (e.g. the compare page's selected tools) can score them
 * directly without matchToolsToNeed's relevance filtering/ranking.
 */
export function scoreToolAgainstNeed(tool: Tool, parsedNeed: ParsedNeed): ToolScore {
  const profile = getNeedProfile(tool);
  let score = 0;
  let maxScore = 0;
  const matchedChips: RequirementChip[] = [];
  const unmatchedChips: RequirementChip[] = [];

  if (parsedNeed.categoryHint) {
    maxScore += 25;
    if (tool.category === parsedNeed.categoryHint) score += 25;
  }

  if (parsedNeed.typeHint) {
    maxScore += 10;
    if (tool.type === parsedNeed.typeHint) score += 10;
  }

  for (const chip of parsedNeed.chips) {
    maxScore += 20;
    if (chipMatchesTool(chip, profile.searchText, tool)) {
      score += 20;
      matchedChips.push(chip);
    } else {
      unmatchedChips.push(chip);
    }
  }

  if (parsedNeed.experienceHint) {
    maxScore += 15;
    if (tool.experienceLevel.includes(parsedNeed.experienceHint)) score += 15;
  }

  for (const priority of parsedNeed.priorityHints) {
    maxScore += 10;
    if (tool.strengths.includes(priority)) score += 10;
  }

  if (parsedNeed.budgetHint) {
    maxScore += 15;
    const userRank = tierRank(parsedNeed.budgetHint);
    const toolRank = tierRank(tool.pricing.tier);
    if (tool.pricing.tier === parsedNeed.budgetHint) score += 15;
    else if (tool.freePlan && parsedNeed.budgetHint !== "free") score += 12;
    else if (toolRank <= userRank) score += 8;
  }

  // Small, capped tie-breaker only — never the primary signal, and never
  // derived from popularity/affiliate status.
  const tieBreak = Math.min(tool.rating, 5) * 0.4;

  return { tool, score, maxScore, tieBreak, matchedChips, unmatchedChips };
}

function toNeedMatch(r: ToolScore): NeedMatch {
  return {
    tool: r.tool,
    matchPercent: r.maxScore > 0 ? Math.round(Math.min(97, (r.score / r.maxScore) * 100)) : 50,
    matchedChips: r.matchedChips,
    unmatchedChips: r.unmatchedChips,
  };
}

/** Transparent 0–97 match percentage for one tool — no pool filtering, no
 *  ranking, just this tool's own score. Used on the compare page where the
 *  tool list is already fixed by the user's selection. */
export function getMatchPercent(tool: Tool, parsedNeed: ParsedNeed): number {
  return toNeedMatch(scoreToolAgainstNeed(tool, parsedNeed)).matchPercent;
}

/**
 * Deterministic requirement matcher for a whole pool: scores every tool,
 * drops ones with zero relevance (falling back to the full pool if nothing
 * matched at all), then ranks and slices to `limit`.
 */
export function matchToolsToNeed(parsedNeed: ParsedNeed, pool: Tool[] = tools, limit = 5): NeedMatch[] {
  const scored = pool.map((tool) => scoreToolAgainstNeed(tool, parsedNeed));

  const relevant = scored.filter(
    (r) =>
      r.matchedChips.length > 0 ||
      (Boolean(parsedNeed.categoryHint) && r.tool.category === parsedNeed.categoryHint) ||
      (Boolean(parsedNeed.typeHint) && r.tool.type === parsedNeed.typeHint)
  );

  const finalPool = relevant.length > 0 ? relevant : scored;

  return finalPool
    .sort((a, b) => {
      const pctA = a.maxScore > 0 ? a.score / a.maxScore : 0;
      const pctB = b.maxScore > 0 ? b.score / b.maxScore : 0;
      return pctB - pctA || b.tieBreak - a.tieBreak;
    })
    .slice(0, limit)
    .map(toNeedMatch);
}

/**
 * Turns a NeedMatch into the "why this matches" reasons list and a
 * matched/total summary — generated entirely from parseNeed's chips, so it
 * can never claim a tool satisfies something it wasn't actually matched on.
 */
export function explainMatch(match: NeedMatch, parsedNeed: ParsedNeed): {
  reasons: string[];
  matchedCount: number;
  totalCount: number;
} {
  const reasons = match.matchedChips.map((chip) => `${chip.emoji} ${chip.label}`);
  if (parsedNeed.categoryHint && match.tool.category === parsedNeed.categoryHint && reasons.length === 0) {
    reasons.push(`Matches what you're trying to do`);
  }
  return {
    reasons,
    matchedCount: match.matchedChips.length,
    totalCount: parsedNeed.chips.length,
  };
}
