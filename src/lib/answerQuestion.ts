import { PRICE_TIER_LABELS } from "./utils";
import { getMatchPercent, getMatchLabel } from "./needMatch";
import { getNeedBasedVerdict } from "./needCompare";
import { buildWhatWouldChangeRecommendation } from "./comparisonNarrative";
import type { ParsedNeed } from "./needSignals";
import type { Tool } from "@/data/types";

/** Required verbatim whenever we genuinely have nothing verified to say. */
const NOT_ENOUGH_INFO = "I don't have enough verified information to answer that yet.";

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
  /** A single grounded paragraph rather than a per-tool row list — used for
   *  questions whose answer is inherently about the comparison as a whole
   *  (e.g. "what would change your recommendation?"), never a redirect back
   *  to generic discovery. */
  summary?: string;
}

/**
 * Deterministic handling for a fixed set of common comparison questions.
 * Pattern-matches the question text and answers from existing structured
 * tool data only — no AI call. The QuestionAnswer shape is intentionally
 * generic (title + rows) so this function's body can later be replaced
 * with an LLM call without the calling UI (AskAboutNeeds) changing at all.
 */
export function answerCommonComparisonQuestion(
  question: string,
  tools: Tool[],
  parsedNeed?: ParsedNeed | null
): QuestionAnswer {
  const q = question.toLowerCase();

  if (/\bwhy (did|do|would|does) you recommend\b|\bwhy (is|are|was) (this|these|it) recommend/.test(q)) {
    if (!parsedNeed || tools.length === 0) {
      return { matched: false, title: "Why this was recommended", rows: [], note: NOT_ENOUGH_INFO };
    }
    const percents = Object.fromEntries(tools.map((t) => [t.slug, getMatchPercent(t, parsedNeed)] as const));
    const verdicts = getNeedBasedVerdict(tools, parsedNeed, percents);
    return {
      matched: true,
      title: "Why this was recommended",
      rows: verdicts.map((v) => ({ tool: v.tool, value: v.reason })),
    };
  }

  if (
    /\bwhich (one |tool )?fits? (my|your|our) needs? better\b|\bwhich (one|tool) is (the )?better fit\b|\bwhich (one|tool) should i (choose|pick)\b/.test(
      q
    )
  ) {
    if (!parsedNeed || tools.length === 0) {
      return { matched: false, title: "Which fits your needs better", rows: [], note: NOT_ENOUGH_INFO };
    }
    const percents = Object.fromEntries(tools.map((t) => [t.slug, getMatchPercent(t, parsedNeed)] as const));
    const ranked = [...tools].sort((a, b) => (percents[b.slug] ?? 0) - (percents[a.slug] ?? 0));
    return {
      matched: true,
      title: "Which fits your needs better",
      rows: ranked.map((tool, i) => ({
        tool,
        value:
          i === 0
            ? `Best fit based on what you told us — ${getMatchLabel(percents[tool.slug] ?? 0)}.`
            : `${getMatchLabel(percents[tool.slug] ?? 0)} for what you told us.`,
      })),
    };
  }

  if (/\bwhat would change\b|\bwhat could change\b|\bunder what (circumstances|conditions)\b/.test(q)) {
    if (tools.length < 2) {
      return { matched: false, title: "What would change this recommendation", rows: [], note: NOT_ENOUGH_INFO };
    }
    return {
      matched: true,
      title: "What would change this recommendation",
      rows: [],
      summary: buildWhatWouldChangeRecommendation(tools, parsedNeed ?? null),
    };
  }

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
    note: NOT_ENOUGH_INFO,
  };
}
