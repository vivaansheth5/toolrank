import { tools } from "@/data/tools";
import type { Tool } from "@/data/types";

/**
 * Curated short names / brand / plan-level variants that can't be derived
 * automatically from a tool's name or slug — keyed by Tool.id. Covers the
 * whole dataset, not just ChatGPT/Claude, so any tool the user names by a
 * common nickname or plan tier still resolves to its real data record.
 *
 * These are matching hints only, never new tool data: every alias still
 * resolves to the SAME existing Tool record (its real features/pricing/
 * pros/cons). Where the dataset only has one record for a brand (e.g.
 * "Claude" covers claude.ai chat, Claude Pro and Claude Code alike), the
 * alias still points at that one real record rather than inventing a
 * separate product — the user's own wording is preserved for display via
 * MatchedToolMention.displayLabel in lib/comparisonIntent.ts, not folded
 * into the data.
 */
const CURATED_ALIASES: Record<string, string[]> = {
  chatgpt: ["chatgpt plus", "chatgpt pro", "chatgpt free", "chatgpt team", "chatgpt enterprise", "openai chatgpt", "open ai", "gpt-4", "gpt4", "gpt"],
  claude: ["claude pro", "claude code", "claude free", "claude team", "claude enterprise", "anthropic claude", "claude ai", "claude.ai"],
  gemini: ["google gemini", "gemini pro", "gemini advanced", "gemini ai", "bard"],
  perplexity: ["perplexity ai", "perplexity pro"],
  canva: ["canva pro", "canva ai"],
  "adobe-firefly": ["firefly", "adobe firefly"],
  midjourney: ["mj"],
  runway: ["runwayml", "runway ml"],
  elevenlabs: ["eleven labs"],
  gamma: ["gamma app"],
  notion: ["notion.so"],
  "notion-ai": ["notion ai"],
  cursor: ["cursor ai", "cursor editor", "cursor ide"],
  "github-copilot": ["copilot", "gh copilot"],
  replit: ["repl.it", "replit agent"],
  grammarly: ["grammarly premium", "grammarly pro"],
  jasper: ["jasper ai"],
  "copy-ai": ["copy.ai", "copyai"],
  capcut: ["cap cut"],
  otter: ["otter ai", "otter.ai"],
  make: ["make.com", "integromat"],
  clickup: ["click up"],
  monday: ["monday.com", "monday dot com"],
  hubspot: ["hub spot"],
  "google-workspace": ["google workspace", "gsuite", "g suite"],
  "microsoft-365": ["microsoft 365", "office 365", "ms office", "office365"],
};

/** Words too generic/ambiguous to trust as a stand-alone tool alias even
 *  though they equal a tool's slug/name — excluded from auto-generated
 *  aliases to keep mention-detection from false-positiving on ordinary
 *  English ("make" the verb, "monday" the weekday, "slack" as in "cut some
 *  slack"). The curated multi-word variants above still work for these. */
const AMBIGUOUS_SOLO_WORDS = new Set(["make", "monday", "slack"]);

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

/**
 * All lowercase phrases that should resolve to this tool: its full name,
 * its slug written as words, and any curated short names/plan variants.
 * Deduplicated. Sorted longest-first by callers that need to prefer the
 * most specific match (e.g. "claude code" over bare "claude").
 */
export function getToolAliases(tool: Tool): string[] {
  const candidates = new Set<string>();
  const name = normalize(tool.name);
  const slugAsWords = normalize(tool.slug.replace(/-/g, " "));

  if (!AMBIGUOUS_SOLO_WORDS.has(name)) candidates.add(name);
  if (!AMBIGUOUS_SOLO_WORDS.has(slugAsWords)) candidates.add(slugAsWords);

  for (const alias of CURATED_ALIASES[tool.id] ?? []) {
    candidates.add(normalize(alias));
  }

  return Array.from(candidates);
}

export interface ToolAliasEntry {
  tool: Tool;
  alias: string;
}

/** Every (tool, alias) pair across the whole dataset, longest alias first —
 *  the order mention-detection should scan in so "chatgpt plus" is checked
 *  before the shorter "chatgpt" and never gets missed in favor of it. */
export function getAllToolAliasEntries(pool: Tool[] = tools): ToolAliasEntry[] {
  const entries: ToolAliasEntry[] = [];
  for (const tool of pool) {
    for (const alias of getToolAliases(tool)) {
      entries.push({ tool, alias });
    }
  }
  return entries.sort((a, b) => b.alias.length - a.alias.length);
}
