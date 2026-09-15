import { tools } from "@/data/tools";
import type {
  Audience,
  CategorySlug,
  ExperienceLevel,
  PriceTier,
  Strength,
  Tool,
} from "@/data/types";

export interface QuestionnaireAnswers {
  category: CategorySlug;
  experience: ExperienceLevel;
  budget: PriceTier;
  audience: Audience;
  priority: Strength;
}

export interface Recommendation {
  tool: Tool;
  score: number;
  matchPercent: number;
  reasons: string[];
  label: string;
}

const TIER_ORDER: PriceTier[] = ["free", "under-500", "500-1000", "1000-plus"];

function tierRank(tier: PriceTier): number {
  return TIER_ORDER.indexOf(tier);
}

/**
 * Deterministic, explainable scoring — no external AI call.
 * Each answer contributes a fixed weight so the max possible score is 100,
 * which doubles directly as the displayed match percentage. Swap this
 * function out for a real ML/AI recommender later; the questionnaire and
 * result UI don't need to change.
 */
function scoreTool(tool: Tool, answers: QuestionnaireAnswers): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (tool.category === answers.category) {
    score += 40;
    reasons.push(`Matches what you're trying to do: ${answers.category}`);
  }

  if (tool.experienceLevel.includes(answers.experience)) {
    score += 15;
    reasons.push(`Great fit for ${answers.experience} users`);
  }

  const userTierRank = tierRank(answers.budget);
  const toolTierRank = tierRank(tool.pricing.tier);
  if (tool.pricing.tier === answers.budget) {
    score += 20;
    reasons.push("Fits your budget exactly");
  } else if (tool.freePlan && answers.budget !== "free") {
    score += 16;
    reasons.push("Has a free plan, so it fits any budget");
  } else if (toolTierRank <= userTierRank) {
    score += 10;
    reasons.push("Comfortably within your budget");
  }

  if (tool.targetAudience.includes(answers.audience)) {
    score += 15;
    reasons.push(`Built with ${answers.audience} in mind`);
  }

  if (tool.strengths.includes(answers.priority)) {
    const priorityLabel: Record<Strength, string> = {
      "ease-of-use": "easy to use",
      quality: "known for high output quality",
      price: "known for great value",
      features: "packed with features",
      speed: "fast to get results with",
    };
    score += 10;
    reasons.push(`Especially ${priorityLabel[answers.priority]}`);
  }

  return { score, reasons };
}

export function getRecommendations(
  answers: QuestionnaireAnswers,
  count = 5
): Recommendation[] {
  const scored = tools
    .map((tool) => {
      const { score, reasons } = scoreTool(tool, answers);
      return { tool, score, reasons };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.tool.rating - a.tool.rating)
    .slice(0, count);

  const labeled: Recommendation[] = scored.map((r, i) => ({
    tool: r.tool,
    score: r.score,
    matchPercent: Math.min(99, Math.max(55, r.score)),
    reasons: r.reasons,
    label: i === 0 ? "Best overall for you" : "Strong alternative",
  }));

  // Re-assign more specific labels where they clearly apply, without
  // duplicating a label and without touching the #1 overall pick.
  const usedIndices = new Set([0]);

  const freeIndex = labeled.findIndex(
    (r, i) => !usedIndices.has(i) && r.tool.freePlan
  );
  if (freeIndex !== -1) {
    labeled[freeIndex].label = "Best free option";
    usedIndices.add(freeIndex);
  }

  const advancedIndex = labeled.findIndex(
    (r, i) =>
      !usedIndices.has(i) && r.tool.experienceLevel.includes("advanced")
  );
  if (answers.experience === "advanced" && advancedIndex !== -1) {
    labeled[advancedIndex].label = "Best for advanced users";
    usedIndices.add(advancedIndex);
  }

  const cheapestIndex = labeled
    .map((r, i) => ({ i, tier: tierRank(r.tool.pricing.tier) }))
    .filter((x) => !usedIndices.has(x.i))
    .sort((a, b) => a.tier - b.tier)[0]?.i;
  if (cheapestIndex !== undefined) {
    labeled[cheapestIndex].label = "Best value for money";
    usedIndices.add(cheapestIndex);
  }

  return labeled;
}
