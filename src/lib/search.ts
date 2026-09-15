import { tools } from "@/data/tools";
import { categories } from "@/data/categories";
import type { Tool } from "@/data/types";

/**
 * Natural-language-ish keyword search over the tool database.
 *
 * Deliberately simple and deterministic (no external API): it tokenizes the
 * query, expands a few common synonyms/use-cases to category or tag hints,
 * then scores each tool by weighted field matches. Swap this module out for
 * a real semantic search later without touching any component code.
 */

const SYNONYMS: Record<string, string[]> = {
  "video editing": ["video", "editing", "capcut", "descript"],
  "edit video": ["video", "editing"],
  "ai writing": ["writing", "chatgpt", "claude", "jasper"],
  "write better emails": ["writing", "grammarly", "email"],
  "website builder": ["website", "webflow", "framer", "no-code"],
  "build a website": ["website", "webflow", "framer", "no-code"],
  "without coding": ["no-code"],
  "no code": ["no-code"],
  "coding assistant": ["coding", "copilot", "cursor"],
  "code assistant": ["coding", "copilot", "cursor"],
  "for students": ["students"],
  "tools for students": ["students"],
  "make presentations": ["presentations", "gamma", "slides"],
  "presentations with ai": ["presentations", "gamma"],
  "turn text into video": ["video", "runway", "text-to-video"],
  "text to video": ["video", "runway"],
  "instagram reels": ["video", "capcut", "short-form video", "social media"],
  "reels without editing": ["capcut", "video", "social media"],
  "project management": ["productivity", "clickup", "trello", "monday"],
  "team communication": ["slack", "business"],
  "voice generation": ["audio", "elevenlabs"],
  "image generation": ["image", "midjourney", "firefly"],
  "meeting notes": ["otter", "audio", "transcription"],
  seo: ["marketing", "semrush", "ahrefs"],
};

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function expandQuery(query: string): string[] {
  const lower = query.toLowerCase().trim();
  const expanded = new Set(tokenize(query));

  for (const [phrase, hints] of Object.entries(SYNONYMS)) {
    if (lower.includes(phrase)) {
      hints.forEach((h) => expanded.add(h));
    }
  }

  categories.forEach((c) => {
    if (lower.includes(c.name.toLowerCase()) || lower.includes(c.slug)) {
      expanded.add(c.slug);
    }
  });

  return Array.from(expanded);
}

const STOPWORDS = new Set([
  "a", "an", "the", "for", "to", "of", "and", "or", "with", "without",
  "that", "this", "my", "me", "i", "in", "on", "at", "is", "are", "be",
  "tool", "tools", "app", "apps", "software", "want", "need", "help",
  "make", "making", "best", "good",
]);

export interface SearchResult {
  tool: Tool;
  score: number;
}

export function searchTools(query: string, limit = 50): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const tokens = expandQuery(trimmed).filter((t) => !STOPWORDS.has(t));
  if (tokens.length === 0) return [];

  const results: SearchResult[] = [];

  for (const tool of tools) {
    let score = 0;
    const name = tool.name.toLowerCase();
    const tagline = tool.tagline.toLowerCase();
    const description = tool.description.toLowerCase();
    const category = tool.category.toLowerCase();
    const subcategory = tool.subcategory.toLowerCase();
    const tags = tool.tags.map((t) => t.toLowerCase());
    const audience = tool.targetAudience.map((a) => a.toLowerCase());

    for (const token of tokens) {
      if (name === token) score += 20;
      else if (name.includes(token)) score += 12;

      if (tags.includes(token)) score += 10;
      else if (tags.some((t) => t.includes(token))) score += 6;

      if (category === token) score += 9;
      if (subcategory.includes(token)) score += 6;
      if (audience.includes(token)) score += 5;
      if (tagline.includes(token)) score += 4;
      if (description.includes(token)) score += 2;
    }

    // Small boost for well-reviewed, popular tools when scores tie.
    if (score > 0) {
      score += tool.popularity * 0.03 + tool.rating;
      results.push({ tool, score });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

export const searchSuggestions = [
  "Create Instagram reels without editing",
  "Build a website without coding",
  "Make presentations with AI",
  "Write better emails",
  "Turn text into video",
];
