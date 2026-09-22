import { findMentionedTools, toolMentionDisplayLabel, type ToolMention } from "./toolMention";
import type { Tool } from "@/data/types";

export interface MatchedToolMention {
  tool: Tool;
  matchedAlias: string;
  displayLabel: string;
}

export interface ComparisonIntentResult {
  isComparisonIntent: boolean;
  /** Up to 3 tools, in the order the user named them. */
  identifiedTools: MatchedToolMention[];
}

const MAX_COMPARISON_TOOLS = 3;

/**
 * Explicit comparison phrasing — deliberately broad (this is the "compare
 * X and Y" / "X vs Y" / "confused between X and Y" family from the spec),
 * matched against the whole lowercased input. None of these alone imply a
 * comparison unless at least 2 known tools are also named (see below) —
 * "compare prices" in a need with no tool names never triggers this.
 */
const COMPARISON_KEYWORD_PATTERNS: RegExp[] = [
  /\bcompare\b/,
  /\bcomparison\b/,
  /\bvs\.?\b/,
  /\bversus\b/,
  /\bconfused between\b/,
  /\bdecid(e|ing) between\b/,
  /\bchoos(e|ing) between\b/,
  /\bwhich (one |tool )?(should|shall|do) i (buy|choose|get|pick|use)\b/,
  /\bshould i (get|buy|choose|pick)\b/,
  /\bwhether i should (use|choose|buy|get|pick)\b/,
  /\bwhich is better\b/,
  /\bwhich (one )?is (the )?better (choice|option|fit)\b/,
  /\bwhich should i buy\b/,
];

/** A light connector ("or"/"and"/"vs"/"&"/a comma) with nothing but
 *  whitespace/punctuation around it — used to confirm two tool mentions are
 *  actually being posed as a choice ("ChatGPT or Claude"), not just two
 *  tools that happen to both be named somewhere in a longer sentence. */
const CONNECTOR_ONLY = /^[\s,]*(or|and|vs\.?|versus|&)[\s,]*$/i;

function hasConnectorBetweenMentions(lowerText: string, mentions: ToolMention[]): boolean {
  for (let i = 0; i < mentions.length - 1; i++) {
    const between = lowerText.slice(mentions[i].endIndex, mentions[i + 1].startIndex);
    if (CONNECTOR_ONLY.test(between)) return true;
  }
  return false;
}

function toMatchedToolMention(mention: ToolMention): MatchedToolMention {
  return { tool: mention.tool, matchedAlias: mention.matchedAlias, displayLabel: toolMentionDisplayLabel(mention) };
}

/**
 * Detects "the user explicitly named two or more known tools and wants
 * them compared" — must run BEFORE the general need-based recommendation
 * engine, per the routing rule: exact tool names always override discovery.
 *
 * Deterministic, two-part rule:
 *  1. At least 2 distinct known tools are named in the text (via
 *     lib/toolMention.ts — real alias substring matches only).
 *  2. AND either an explicit comparison-phrasing keyword appears anywhere
 *     in the text, OR two of the named tools are joined by a bare
 *     or/and/vs/& connector ("ChatGPT or Claude").
 * Neither signal alone is enough — a text naming one tool with "compare"
 * in it (e.g. "compare pricing plans for ChatGPT") is not a comparison
 * intent because there's nothing to compare it against.
 */
export function detectComparisonIntent(rawText: string): ComparisonIntentResult {
  const mentions = findMentionedTools(rawText);
  if (mentions.length < 2) {
    return { isComparisonIntent: false, identifiedTools: mentions.map(toMatchedToolMention) };
  }

  const lower = rawText.toLowerCase();
  const hasKeyword = COMPARISON_KEYWORD_PATTERNS.some((re) => re.test(lower));
  const hasConnector = hasConnectorBetweenMentions(lower, mentions);

  return {
    isComparisonIntent: hasKeyword || hasConnector,
    identifiedTools: mentions.slice(0, MAX_COMPARISON_TOOLS).map(toMatchedToolMention),
  };
}
