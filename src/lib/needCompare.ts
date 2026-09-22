import { getNeedProfile } from "./needProfile";
import { getMatchLabel } from "./needMatch";
import { buildPersonalizedGetMiss } from "./comparisonIntelligence";
import type { ParsedNeed, RequirementChip } from "./needSignals";
import type { Tool } from "@/data/types";
import { STRENGTH_PHRASES } from "./verdict";

export type FitLevel = "strong" | "partial" | "none";

function chipFit(chip: RequirementChip, tool: Tool, searchText: string): FitLevel {
  const directHit = chip.tagHints.some((hint) => searchText.includes(hint));
  if (directHit) return "strong";

  const categoryHit = chip.categoryHint && tool.category === chip.categoryHint;
  const typeHit = chip.typeHint && tool.type === chip.typeHint;
  const priorityHit = chip.priorityHint && tool.strengths.includes(chip.priorityHint);
  const experienceHit = chip.experienceHint && tool.experienceLevel.includes(chip.experienceHint);

  if (categoryHit || typeHit || priorityHit || experienceHit) return "partial";
  return "none";
}

export interface NeedComparisonRow {
  chip: RequirementChip;
  cells: { tool: Tool; fit: FitLevel }[];
}

/**
 * "Based on what you need" table: one row per requirement chip from the
 * parsed need, one cell per compared tool, using only real tool fields
 * (tags/features/category/type/strengths/experienceLevel) — never deal or
 * affiliate data.
 */
export function compareAgainstNeeds(toolsToCompare: Tool[], parsedNeed: ParsedNeed): NeedComparisonRow[] {
  return parsedNeed.chips.map((chip) => ({
    chip,
    cells: toolsToCompare.map((tool) => ({
      tool,
      fit: chipFit(chip, tool, getNeedProfile(tool).searchText),
    })),
  }));
}

export interface ToolFitSummary {
  tool: Tool;
  matchPercent: number;
  emoji: string;
  label: string;
}

/**
 * "How these tools fit your needs" summary card content — a plain-language
 * label per tool (the same Strong/Good/Possible match vocabulary used on
 * the results page), plus one explicit experience-level check (the "more
 * advanced than you need" case called out in the spec). The percentage is
 * never shown as a standalone number — only the label is.
 */
export function summarizeFit(tool: Tool, matchPercent: number, parsedNeed: ParsedNeed): ToolFitSummary {
  if (
    parsedNeed.experienceHint === "beginner" &&
    !tool.experienceLevel.includes("beginner") &&
    tool.experienceLevel.includes("advanced")
  ) {
    return { tool, matchPercent, emoji: "🟡", label: "More advanced than you need" };
  }
  const label = getMatchLabel(matchPercent);
  const emoji = label === "Strong match" ? "🟢" : label === "Good match" ? "🟡" : "🔴";
  return { tool, matchPercent, emoji, label };
}

export interface GetVsMiss {
  tool: Tool;
  get: string[];
  miss: string[];
}

/**
 * "What you get" / "What you might miss" — backed by lib/comparisonProfile
 * + comparisonIntelligence's category-aware, per-dimension evidence engine
 * rather than raw substring matching over a handful of feature strings.
 * "get" is every relevant dimension where the tool has strong/good real
 * evidence; "miss" is every relevant dimension with a stated limitation
 * (limited/notAvailable). A dimension with genuinely inconclusive evidence
 * lands in neither list rather than being forced into a false positive or
 * negative. Nothing here is invented — every line is the tool's own
 * feature/pro/con/description text; GetVsMissCard shows the required
 * "not enough verified information" fallback when a list ends up empty.
 */
export function getWhatYouGetAndMiss(tool: Tool, parsedNeed: ParsedNeed): GetVsMiss {
  const result = buildPersonalizedGetMiss(tool, [tool], parsedNeed);
  return {
    tool,
    // Two different dimensions can legitimately share the same underlying
    // evidence sentence (e.g. one feature covering both "coding" and
    // "reasoning") — de-duplicate by text so the UI never shows the same
    // line twice.
    get: Array.from(new Set(result.get.map((g) => g.text))),
    miss: Array.from(new Set(result.miss.map((m) => m.text))),
  };
}

/**
 * "Which one should you choose?" tied to the stated need, framed as fit —
 * never as one tool being objectively "better" — and never touching
 * affiliate/deal data.
 */
export function getNeedBasedVerdict(
  toolsToCompare: Tool[],
  parsedNeed: ParsedNeed,
  matchPercents: Record<string, number>
): { tool: Tool; reason: string }[] {
  const ranked = [...toolsToCompare].sort(
    (a, b) => (matchPercents[b.slug] ?? 0) - (matchPercents[a.slug] ?? 0)
  );

  return ranked.map((tool, i) => {
    const topPriority = tool.strengths.find((s) => parsedNeed.priorityHints.includes(s)) ?? tool.strengths[0];
    const priorityPhrase = topPriority ? STRENGTH_PHRASES[topPriority] : "how well it fits your priorities";

    if (i === 0) {
      const chipPhrase = parsedNeed.chips[0]?.label.toLowerCase();
      return {
        tool,
        reason: chipPhrase
          ? `Based on what you told us, ${tool.name} is the stronger fit because ${chipPhrase} and ${priorityPhrase} were among your priorities.`
          : `Based on what you told us, ${tool.name} is the stronger fit for what you're trying to do.`,
      };
    }

    return {
      tool,
      reason: `Choose ${tool.name} instead if ${priorityPhrase} matters more to you.`,
    };
  });
}
