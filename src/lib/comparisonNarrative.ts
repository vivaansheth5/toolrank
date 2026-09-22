import { categories } from "@/data/categories";
import type { ComparisonDimension } from "@/data/comparisonDimensions";
import {
  getComparisonProfile,
  selectRelevantDimensions,
  compareLevels,
  type FitLevel,
} from "./comparisonProfile";
import { buildKeyDifferences } from "./comparisonIntelligence";
import type { ParsedNeed } from "./needSignals";
import type { MatchedToolMention } from "./comparisonIntent";
import { BUDGET_REFINEMENT_LABELS, EXPERIENCE_LABELS, STRENGTH_LABELS } from "./utils";
import type { Tool } from "@/data/types";

/**
 * V3 decision-support narrative layer, sitting on top of comparisonProfile
 * (facts) and comparisonIntelligence (dimension-level evidence). Every
 * sentence generated here is assembled from real Tool fields, dimension
 * metadata (label/whyItMatters/scenario) or the user's own ParsedNeed —
 * never freely authored per-tool-pair prose. The goal is FACTS ->
 * DIFFERENCES -> IMPLICATIONS -> USER-SPECIFIC TRADEOFFS -> DECISION
 * SUPPORT, not more badges or table rows.
 */

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

/** Every dimension's whyItMatters reads "Matters if/for <clause>." — strips
 *  that fixed prefix (and trailing period) down to the bare clause so it can
 *  be recomposed into a new sentence with our own connector, without ever
 *  inventing content beyond what the dimension's own text already says. */
function matterCondition(whyItMatters: string): string {
  return whyItMatters.replace(/^Matters\s+(if|for)\s+/i, "").replace(/\.$/, "");
}

function article(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function joinNames(tools: Tool[]): string {
  if (tools.length === 2) return `${tools[0].name} and ${tools[1].name}`;
  return `${tools.slice(0, -1).map((t) => t.name).join(", ")} and ${tools[tools.length - 1].name}`;
}

// ---------------------------------------------------------------------------
// A. User context
// ---------------------------------------------------------------------------

export interface UserContextSummary {
  rawText: string;
  chips: { id: string; emoji: string; label: string }[];
  budgetLabel?: string;
  experienceLabel?: string;
  priorityLabels: string[];
}

/** Straight passthrough of the ParsedNeed the user already typed/refined —
 *  no interpretation, just labeled for display so the page can visibly
 *  recap "here's what we understood before we explain anything." */
export function buildUserContextSummary(parsedNeed: ParsedNeed): UserContextSummary {
  return {
    rawText: parsedNeed.rawText,
    chips: parsedNeed.chips.map((c) => ({ id: c.id, emoji: c.emoji, label: c.label })),
    budgetLabel: parsedNeed.budgetHint ? BUDGET_REFINEMENT_LABELS[parsedNeed.budgetHint] : undefined,
    experienceLabel: parsedNeed.experienceHint ? EXPERIENCE_LABELS[parsedNeed.experienceHint] : undefined,
    priorityLabels: parsedNeed.priorityHints.map((p) => STRENGTH_LABELS[p]),
  };
}

// ---------------------------------------------------------------------------
// B. Product context
// ---------------------------------------------------------------------------

export interface ProductContextEntry {
  tool: Tool;
  categoryLabel: string;
  whatItIs: string;
  /** Set only when the user's own wording (e.g. "Claude Code") named a
   *  plan/product variant that isn't a distinct record in the dataset —
   *  an honest caveat rather than pretending the alias is separately
   *  verified data. */
  aliasNote?: string;
}

/** Per-tool "what it is" — tagline + description, both real curated fields,
 *  never generated. */
export function buildProductContext(tools: Tool[], mentions?: MatchedToolMention[]): ProductContextEntry[] {
  return tools.map((tool) => {
    const mention = mentions?.find((m) => m.tool.slug === tool.slug);
    const aliasNote =
      mention && mention.displayLabel.toLowerCase() !== tool.name.toLowerCase()
        ? `You mentioned "${mention.displayLabel}" — we're comparing it using ${tool.name}'s verified data, the closest matching record we have.`
        : undefined;
    return {
      tool,
      categoryLabel: CATEGORY_LABEL[tool.category] ?? tool.category,
      whatItIs: `${tool.tagline} ${tool.description}`,
      aliasNote,
    };
  });
}

export interface DifferentTypeCallout {
  show: boolean;
  text?: string;
}

/** Spec requirement: "do not pretend they're identical categories just
 *  because both use AI." Only fires from real category/subcategory fields —
 *  never a guess about what a tool "really" is beyond its own data. */
export function detectFundamentallyDifferentTypes(tools: Tool[]): DifferentTypeCallout {
  if (tools.length < 2) return { show: false };

  const categorySet = new Set(tools.map((t) => t.category));
  if (categorySet.size > 1) {
    const text = `These aren't the same kind of tool: ${tools
      .map((t) => `${t.name} is a ${CATEGORY_LABEL[t.category] ?? t.category} tool (${t.subcategory})`)
      .join(", while ")}. Keep that in mind — some of what follows compares them on shared ground, but they aren't built for identical jobs.`;
    return { show: true, text };
  }

  const subcategorySet = new Set(tools.map((t) => t.subcategory));
  if (subcategorySet.size > 1) {
    const text = `Both are ${CATEGORY_LABEL[tools[0].category] ?? tools[0].category} tools, but they're not identical in kind: ${tools
      .map((t) => `${t.name} is specifically ${article(t.subcategory)} ${t.subcategory} tool`)
      .join(", while ")}. That's worth keeping in mind rather than comparing them feature-for-feature as if they were the same product.`;
    return { show: true, text };
  }

  return { show: false };
}

// ---------------------------------------------------------------------------
// C. Quick take (paragraph, not bullets)
// ---------------------------------------------------------------------------

function dimensionIsUserRelevant(dim: ComparisonDimension, parsedNeed: ParsedNeed | null): boolean {
  if (!parsedNeed) return false;
  const chipIds = new Set(parsedNeed.chips.map((c) => c.id));
  return dim.relatedChipIds.some((id) => chipIds.has(id));
}

/**
 * A 3-5 sentence contextual paragraph — no universal winner, no invented
 * facts. Built from: what kind of tools these are, the 1-2 biggest genuine
 * differences (from buildKeyDifferences), one area of real overlap, and a
 * closing line that explicitly frames this as fit-dependent, not a verdict.
 */
export function buildQuickTakeParagraph(tools: Tool[], parsedNeed: ParsedNeed | null): string {
  if (tools.length < 2) return "";
  const sentences: string[] = [];
  const typeCallout = detectFundamentallyDifferentTypes(tools);

  if (typeCallout.show) {
    sentences.push(
      `${joinNames(tools)} aren't quite the same kind of tool, so this comparison focuses on where they genuinely overlap and where they don't.`
    );
  } else {
    sentences.push(
      `${joinNames(tools)} are both ${(CATEGORY_LABEL[tools[0].category] ?? tools[0].category).toLowerCase()} tools, but they're built around different strengths.`
    );
  }

  const diffs = buildKeyDifferences(tools, parsedNeed, 8).filter((d) => !d.isTie);
  for (const diff of diffs.slice(0, 2)) {
    const sorted = [...diff.lines].sort((a, b) => compareLevels(b.level, a.level));
    const top = sorted[0];
    const relevant = dimensionIsUserRelevant(diff.dimension, parsedNeed);
    sentences.push(
      `On ${diff.dimension.label.toLowerCase()}, ${top.tool.name} has the more verified edge${
        relevant ? " — directly relevant to what you told us you need" : ""
      }.`
    );
  }

  const overlap = buildOverlapSection(tools, parsedNeed, 1);
  if (overlap.length > 0) {
    sentences.push(
      `Both hold up well on ${overlap[0].dimension.label.toLowerCase()}, so that's unlikely to be what decides this for you.`
    );
  }

  sentences.push("There's no universal winner here — which one fits depends on what you'll actually use it for.");

  return sentences.slice(0, 5).join(" ");
}

// ---------------------------------------------------------------------------
// D. Where they overlap
// ---------------------------------------------------------------------------

export interface OverlapItem {
  dimension: ComparisonDimension;
  level: FitLevel;
  note: string;
}

/** Dimensions where every compared tool lands at the same verified level
 *  (never "unknown"/"notAvailable" — an overlap claim needs real evidence
 *  on both sides, not two absences). Exists so the differences section
 *  doesn't read as more divergent than the tools actually are. */
export function buildOverlapSection(tools: Tool[], parsedNeed: ParsedNeed | null, limit = 6): OverlapItem[] {
  if (tools.length < 2) return [];
  const dims = selectRelevantDimensions(tools, parsedNeed, 12);
  const profiles = tools.map((t) => getComparisonProfile(t));
  const items: OverlapItem[] = [];

  for (const dim of dims) {
    const entries = tools.map((_, i) => profiles[i][dim.id]);
    const level = entries[0].level;
    const allSame = entries.every((e) => e.level === level);
    if (!allSame || level === "unknown" || level === "notAvailable") continue;
    const uniqueTexts = Array.from(new Set(entries.map((e) => e.description)));
    items.push({ dimension: dim, level, note: uniqueTexts.join(" ") });
    if (items.length >= limit) break;
  }

  return items;
}

// ---------------------------------------------------------------------------
// E. Where they differ — FACT / THAT MEANS / FOR YOU
// ---------------------------------------------------------------------------

export interface DifferenceItem {
  dimension: ComparisonDimension;
  fact: string;
  meansThat: string;
  forYou: string;
}

/** The most important section: for each genuine divergence, structure as
 *  FACT (verbatim evidence per tool) -> THAT MEANS (the dimension's own
 *  whyItMatters, grounding the implication in real data) -> FOR YOU
 *  (personalized only when the user's own chips actually name this
 *  dimension — never a fabricated personal connection). */
export function buildDifferencesSection(tools: Tool[], parsedNeed: ParsedNeed | null, limit = 7): DifferenceItem[] {
  if (tools.length < 2) return [];
  const diffs = buildKeyDifferences(tools, parsedNeed, 12).filter((d) => !d.isTie);

  return diffs.slice(0, Math.max(3, Math.min(limit, diffs.length))).map((d) => {
    const sorted = [...d.lines].sort((a, b) => compareLevels(b.level, a.level));
    const [top, ...rest] = sorted;

    const fact = sorted.map((l) => `${l.tool.name}: ${l.text}`).join(" ");
    const meansThat = `${top.tool.name} has the stronger, verified track record here compared to ${rest
      .map((l) => l.tool.name)
      .join(" and ")}. ${d.dimension.whyItMatters}`;

    const chipMatch = parsedNeed?.chips.find((c) => d.dimension.relatedChipIds.includes(c.id));
    const forYou = chipMatch
      ? `You told us "${chipMatch.label.toLowerCase()}" matters to you, so this difference should weigh directly into your decision.`
      : `If this isn't something you've flagged as a priority, treat it as a secondary factor rather than a dealbreaker.`;

    return { dimension: d.dimension, fact, meansThat, forYou };
  });
}

// ---------------------------------------------------------------------------
// F/G. What you get / what you might miss — with why-it-matters + tradeoff
// ---------------------------------------------------------------------------

export interface GetLine {
  text: string;
  dimensionLabel: string;
  whyItMatters: string;
}

export interface MissLine extends GetLine {
  /** A real, data-grounded tradeoff sentence — either "choosing this tool
   *  here means leaning away from <the other tool>'s stronger <dimension>"
   *  when the other tool genuinely has better evidence there, or an honest
   *  "this is a real limitation" framing when no compared tool does better
   *  either. Never the generic "fewer integrations" placeholder text. */
  tradeoff: string;
}

export interface PersonalizedGetMissV2 {
  tool: Tool;
  get: GetLine[];
  miss: MissLine[];
  insufficientData: boolean;
}

export function buildGetMissWithWhy(
  tool: Tool,
  allTools: Tool[],
  parsedNeed: ParsedNeed | null
): PersonalizedGetMissV2 {
  const dims = selectRelevantDimensions(allTools, parsedNeed, 12);
  const profile = getComparisonProfile(tool);
  const others = allTools.filter((t) => t.slug !== tool.slug);
  const otherProfiles = others.map((t) => getComparisonProfile(t));

  const get: GetLine[] = [];
  const miss: MissLine[] = [];

  for (const dim of dims) {
    const e = profile[dim.id];
    if (e.level === "strong" || e.level === "good") {
      get.push({ text: e.description, dimensionLabel: dim.label, whyItMatters: dim.whyItMatters });
      continue;
    }
    if (e.level !== "limited" && e.level !== "notAvailable") continue;

    let bestOtherIdx = -1;
    others.forEach((_, i) => {
      const oLevel = otherProfiles[i][dim.id]?.level;
      if (!oLevel || compareLevels(oLevel, e.level) <= 0) return;
      if (bestOtherIdx === -1 || compareLevels(oLevel, otherProfiles[bestOtherIdx][dim.id].level) > 0) {
        bestOtherIdx = i;
      }
    });

    const condition = matterCondition(dim.whyItMatters);
    const tradeoff =
      bestOtherIdx >= 0
        ? `Choosing ${tool.name} here likely means leaning away from ${others[bestOtherIdx].name}'s stronger ${dim.label.toLowerCase()} — worth it only if ${condition} isn't the main thing driving your decision.`
        : `This is a real limitation rather than just a missing checkbox — factor it in if ${condition}.`;

    miss.push({ text: e.description, dimensionLabel: dim.label, whyItMatters: dim.whyItMatters, tradeoff });
  }

  return { tool, get, miss, insufficientData: get.length === 0 && miss.length === 0 };
}

// ---------------------------------------------------------------------------
// H. Scenario comparison
// ---------------------------------------------------------------------------

export interface ScenarioItem {
  scenario: string;
  dimension: ComparisonDimension;
  lines: { tool: Tool; level: FitLevel; text: string }[];
}

/**
 * Compares tools against real-world tasks (dimension.scenario) rather than
 * abstract capability labels — category-adaptive because it's driven by
 * whichever dimensions actually apply to these tools' category(ies), and
 * personalized because chip-relevant scenarios are surfaced first. Skips
 * any dimension where every tool is "unknown" — a scenario needs at least
 * one side to have real evidence to be worth showing.
 */
export function buildScenarios(tools: Tool[], parsedNeed: ParsedNeed | null, max = 7): ScenarioItem[] {
  if (tools.length < 2) return [];
  const dims = selectRelevantDimensions(tools, parsedNeed, 12);
  const profiles = tools.map((t) => getComparisonProfile(t));
  const chipIds = new Set(parsedNeed?.chips.map((c) => c.id) ?? []);

  const scored = dims
    .map((dim) => {
      const lines = tools.map((tool, i) => {
        const e = profiles[i][dim.id];
        return { tool, level: e.level, text: e.description };
      });
      const hasEvidence = lines.some((l) => l.level !== "unknown");
      const relevant = dim.relatedChipIds.some((id) => chipIds.has(id));
      const levels = lines.map((l) => l.level);
      const gap = compareLevels(
        levels.reduce((a, b) => (compareLevels(b, a) > 0 ? b : a)),
        levels.reduce((a, b) => (compareLevels(b, a) < 0 ? b : a))
      );
      return { dim, lines, hasEvidence, relevant, gap };
    })
    .filter((s) => s.hasEvidence);

  const sorted = [...scored].sort((a, b) => Number(b.relevant) - Number(a.relevant) || b.gap - a.gap);

  return sorted.slice(0, max).map((s) => ({ scenario: s.dim.scenario, dimension: s.dim, lines: s.lines }));
}

// ---------------------------------------------------------------------------
// I. Tradeoff map
// ---------------------------------------------------------------------------

export interface TradeoffRow {
  dimension: ComparisonDimension;
  favoredTool: Tool;
  reason: string;
}

/** "Choose based on what you'll do most" — one row per dimension where a
 *  compared tool has a genuine, non-tied lead, framed as "if your priority
 *  is X" rather than a ranking. Never declares a single overall winner. */
export function buildTradeoffMap(tools: Tool[], parsedNeed: ParsedNeed | null, limit = 6): TradeoffRow[] {
  if (tools.length < 2) return [];
  const dims = selectRelevantDimensions(tools, parsedNeed, 12);
  const profiles = tools.map((t) => getComparisonProfile(t));
  const rows: TradeoffRow[] = [];

  for (const dim of dims) {
    const entries = tools.map((tool, i) => ({ tool, evidence: profiles[i][dim.id] }));
    const sorted = [...entries].sort((a, b) => compareLevels(b.evidence.level, a.evidence.level));
    const [top, second] = sorted;
    if (!second || top.evidence.level === "unknown") continue;
    if (compareLevels(top.evidence.level, second.evidence.level) <= 0) continue;

    rows.push({ dimension: dim, favoredTool: top.tool, reason: top.evidence.description });
    if (rows.length >= limit) break;
  }

  return rows;
}

// ---------------------------------------------------------------------------
// J. "Still deciding?" — what would change your recommendation
// ---------------------------------------------------------------------------

/** Deterministic, comparison-grounded prompt for the required new
 *  question — points back at the actual differences found for THIS
 *  comparison rather than sending the user back to generic discovery. */
export function buildWhatWouldChangeRecommendation(tools: Tool[], parsedNeed: ParsedNeed | null): string {
  const diffs = buildKeyDifferences(tools, parsedNeed, 3).filter((d) => !d.isTie);
  if (diffs.length === 0) {
    return "Nothing decisive separates these tools in the areas we could verify — the choice likely comes down to which one you enjoy using day to day.";
  }
  const labels = diffs.map((d) => d.dimension.label.toLowerCase());
  const condition = matterCondition(diffs[0].dimension.whyItMatters);
  return `Our recommendation leans on ${labels.join(", ")}. If your priorities on those specific points changed — for example, if ${condition} stopped mattering to you — the better fit could flip.`;
}

export { buildKeyDifferences, buildQuickTake, buildPricingComparison } from "./comparisonIntelligence";
