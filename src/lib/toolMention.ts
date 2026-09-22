import { tools } from "@/data/tools";
import { getAllToolAliasEntries } from "./toolAliases";
import type { Tool } from "@/data/types";

export interface ToolMention {
  tool: Tool;
  /** The exact alias phrase matched, e.g. "claude code" — preserves plan
   *  context the user typed, never just the canonical tool name. */
  matchedAlias: string;
  /** The exact substring of the ORIGINAL (non-lowercased) text that
   *  matched, used to build a display label that keeps the user's casing. */
  matchedText: string;
  startIndex: number;
  endIndex: number;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Scans free text for known tool names/aliases, deterministically —
 * longest alias wins per tool (so "ChatGPT Plus" is captured whole rather
 * than matching bare "ChatGPT" and leaving "Plus" behind), one mention per
 * tool (its first, most specific hit), returned in the order they first
 * appear in the text. Every match is a real word-boundary substring match
 * against lib/toolAliases.ts — no fuzzy matching, no invented tools.
 */
export function findMentionedTools(rawText: string, pool: Tool[] = tools): ToolMention[] {
  const lower = rawText.toLowerCase();
  const claimed = new Map<string, ToolMention>(); // tool.id -> best mention so far

  for (const { tool, alias } of getAllToolAliasEntries(pool)) {
    if (claimed.has(tool.id)) continue; // longest-alias-first: first hit per tool wins
    const re = new RegExp(`\\b${escapeRegExp(alias)}\\b`, "i");
    const match = re.exec(lower);
    if (!match) continue;
    claimed.set(tool.id, {
      tool,
      matchedAlias: alias,
      matchedText: rawText.slice(match.index, match.index + match[0].length),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return Array.from(claimed.values()).sort((a, b) => a.startIndex - b.startIndex);
}

/** Builds a display label for a matched alias, preserving the tool's real
 *  name casing rather than blindly title-casing everything — "chatgpt
 *  plus" becomes "ChatGPT Plus" (not "Chatgpt Plus"), "claude code"
 *  becomes "Claude Code", and a bare name match just uses tool.name. */
export function toolMentionDisplayLabel(mention: ToolMention): string {
  const alias = mention.matchedAlias;
  const nameLower = mention.tool.name.toLowerCase();
  if (alias === nameLower) return mention.tool.name;
  if (alias.startsWith(`${nameLower} `)) {
    const rest = alias.slice(nameLower.length + 1);
    return `${mention.tool.name} ${rest.replace(/\b\w/g, (c) => c.toUpperCase())}`;
  }
  return alias.replace(/\b\w/g, (c) => c.toUpperCase());
}
