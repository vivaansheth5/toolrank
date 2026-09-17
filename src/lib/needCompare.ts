import { getNeedProfile } from "./needProfile";
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
 * fit label per tool, derived from its match percentage plus one explicit
 * experience-level check (the "more advanced than you need" case called
 * out in the spec).
 */
export function summarizeFit(tool: Tool, matchPercent: number, parsedNeed: ParsedNeed): ToolFitSummary {
  if (
    parsedNeed.experienceHint === "beginner" &&
    !tool.experienceLevel.includes("beginner") &&
    tool.experienceLevel.includes("advanced")
  ) {
    return { tool, matchPercent, emoji: "🟡", label: "More advanced than you need" };
  }
  if (matchPercent >= 65) return { tool, matchPercent, emoji: "🟢", label: "Strong fit" };
  if (matchPercent >= 35) return { tool, matchPercent, emoji: "🟡", label: "Partial fit" };
  return { tool, matchPercent, emoji: "🔴", label: "Weak fit" };
}

export interface GetVsMiss {
  tool: Tool;
  get: string[];
  miss: string[];
}

/**
 * "What you get" / "What you might miss" — get is the tool's real features
 * ranked by relevance to the parsed need (falling back to its curated pros
 * if fewer than 3 features are relevant), miss is always exactly
 * tool.cons. Nothing here is invented: every line already exists on the
 * tool record.
 */
export function getWhatYouGetAndMiss(tool: Tool, parsedNeed: ParsedNeed): GetVsMiss {
  const lowerChips = parsedNeed.chips.flatMap((c) => c.tagHints);
  const relevantFeatures = tool.features.filter((f) => {
    const lower = f.toLowerCase();
    return lowerChips.some((hint) => lower.includes(hint));
  });

  const get =
    relevantFeatures.length >= 3
      ? relevantFeatures.slice(0, 5)
      : Array.from(new Set([...relevantFeatures, ...tool.pros])).slice(0, 5);

  return { tool, get, miss: tool.cons };
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
