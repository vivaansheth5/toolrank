import { PRICE_TIER_LABELS } from "./utils";
import type { Tool } from "@/data/types";

export interface QuestionAnswerRow {
  tool: Tool;
  value: string;
}

export interface QuestionAnswer {
  matched: boolean;
  title: string;
  rows: QuestionAnswerRow[];
  /** Shown for the unmatched fallback case. */
  note?: string;
}

/**
 * Deterministic handling for a fixed set of common comparison questions.
 * Pattern-matches the question text and answers from existing structured
 * tool data only — no AI call. The QuestionAnswer shape is intentionally
 * generic (title + rows) so this function's body can later be replaced
 * with an LLM call without the calling UI (AskAboutNeeds) changing at all.
 */
export function answerCommonComparisonQuestion(question: string, tools: Tool[]): QuestionAnswer {
  const q = question.toLowerCase();

  if (/\bmiss|missing|give up|trade.?off|downside|con(s)?\b/.test(q)) {
    return {
      matched: true,
      title: "What you might miss",
      rows: tools.map((tool) => ({
        tool,
        value: tool.cons.length > 0 ? tool.cons.join("; ") : "No known limitations on record.",
      })),
    };
  }

  if (/\bfree plan|free trial|free version|free tier\b/.test(q)) {
    return {
      matched: true,
      title: "Free plan availability",
      rows: tools.map((tool) => ({
        tool,
        value: tool.freePlan ? "Yes — has a free plan" : "No free plan",
      })),
    };
  }

  if (/\bcheap(er)?\b|\bprice\b|\bcost\b|\bafford(able)?\b|\bexpensive\b/.test(q)) {
    return {
      matched: true,
      title: "Pricing comparison",
      rows: tools.map((tool) => ({
        tool,
        value: `${PRICE_TIER_LABELS[tool.pricing.tier]}${
          tool.pricing.startingPrice ? ` — ${tool.pricing.startingPrice}` : ""
        }`,
      })),
    };
  }

  if (/\bbeginner(s)?\b|\bnew(bie)?\b|\bexperience level\b|\bskill level\b/.test(q)) {
    return {
      matched: true,
      title: "Experience level fit",
      rows: tools.map((tool) => ({
        tool,
        value: tool.experienceLevel.join(", "),
      })),
    };
  }

  if (/\beasi(er|est)\b|\beasy\b|\bsimple(st)?\b|\bintuitive\b/.test(q)) {
    return {
      matched: true,
      title: "Ease of use comparison",
      rows: tools.map((tool) => ({
        tool,
        value: tool.strengths.includes("ease-of-use") ? "Known for being easy to use" : "Standard learning curve",
      })),
    };
  }

  return {
    matched: false,
    title: "Detailed comparison",
    rows: [],
    note: "Here's the detailed comparison for the factors we have data for.",
  };
}
