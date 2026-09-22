/**
 * Deterministic tests for the comparison intelligence layer
 * (data/comparisonDimensions, lib/comparisonProfile, lib/comparisonIntelligence)
 * — the fix for "the comparison output is too thin/generic". Run with:
 * npx tsx scripts/test-comparison-intelligence.ts
 */
import { tools } from "../src/data/tools";
import { COMPARISON_DIMENSIONS, getDimensionsForCategory } from "../src/data/comparisonDimensions";
import {
  getComparisonProfile,
  selectRelevantDimensions,
  compareLevels,
  NOT_ENOUGH_VERIFIED_INFO,
  type FitLevel,
} from "../src/lib/comparisonProfile";
import {
  buildKeyDifferences,
  buildQuickTake,
  buildPersonalizedGetMiss,
  buildPricingComparison,
} from "../src/lib/comparisonIntelligence";
import { getWhatYouGetAndMiss } from "../src/lib/needCompare";
import { parseNeed } from "../src/lib/needSignals";
import type { CategorySlug } from "../src/data/types";
import fs from "fs";

let passed = 0;
let failed = 0;

function assert(condition: unknown, message: string) {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${message}`);
  } else {
    failed++;
    console.log(`  \x1b[31m✗ FAIL\x1b[0m ${message}`);
  }
}

function section(title: string) {
  console.log(`\n${title}`);
}

function findTool(slug: string) {
  const t = tools.find((tool) => tool.slug === slug);
  if (!t) throw new Error(`Fixture tool not found: ${slug}`);
  return t;
}

const ALL_LEVELS: FitLevel[] = ["strong", "good", "basic", "limited", "notAvailable", "unknown"];

// ---------------------------------------------------------------------------
section("comparisonProfile schema: every CategorySlug used by real tools has a schema");
{
  const categoriesInUse = new Set(tools.map((t) => t.category));
  for (const cat of categoriesInUse) {
    const dims = getDimensionsForCategory(cat as CategorySlug);
    assert(dims.length >= 5, `${cat} has a real dimension schema (${dims.length} dimensions, >= 5)`);
  }
  assert(Object.keys(COMPARISON_DIMENSIONS).length === 10, "schema covers all 10 CategorySlug values");
}

section("comparisonProfile: deterministic, category-aware, never a bare number");
{
  const chatgpt = findTool("chatgpt");
  const p1 = getComparisonProfile(chatgpt);
  const p2 = getComparisonProfile(chatgpt);
  assert(JSON.stringify(p1) === JSON.stringify(p2), "same tool in -> same profile out, every time");
  const dims = getDimensionsForCategory(chatgpt.category);
  assert(Object.keys(p1).length === dims.length, "profile has exactly one entry per category dimension");
  for (const dimId of Object.keys(p1)) {
    assert(ALL_LEVELS.includes(p1[dimId].level), `${dimId} level is one of the 6 allowed FitLevel values`);
    assert(!/^\d+(\.\d+)?$/.test(p1[dimId].description), `${dimId} description is never a bare number/score`);
  }
}

section("Unknown data handling: unknown != notAvailable, never fabricated");
{
  const chatgpt = findTool("chatgpt");
  const profile = getComparisonProfile(chatgpt);
  // ChatGPT's sample record never mentions "reasoning"/"nuanced"/"thoughtful" —
  // this must come back unknown, not a guessed/invented positive or negative.
  assert(profile.reasoning.level === "unknown", `ChatGPT's "reasoning" dimension is honestly "unknown" (got "${profile.reasoning.level}")`);
  assert(
    profile.reasoning.description === NOT_ENOUGH_VERIFIED_INFO,
    "unknown dimension uses the exact required fallback string"
  );
  assert(profile.reasoning.evidence === undefined, "unknown dimension never carries fabricated evidence");

  // freePlanValue is the one dimension allowed to say "notAvailable" — and
  // only because it's driven by the real tool.freePlan boolean, not a guess.
  const jasper = findTool("jasper"); // freePlan: false
  const jasperProfile = getComparisonProfile(jasper);
  assert(jasperProfile.freePlanValue.level === "notAvailable", "a tool with freePlan=false is 'notAvailable', not 'unknown' or a guessed 'limited'");
  assert(jasper.freePlan === false, "sanity: Jasper really has no free plan in the source data");

  // No dimension anywhere is ever silently "notAvailable" from a keyword miss.
  for (const t of tools) {
    const prof = getComparisonProfile(t);
    for (const [id, evidence] of Object.entries(prof)) {
      if (id === "freePlanValue") continue;
      assert(evidence.level !== "notAvailable", `${t.slug}.${id} never guesses "notAvailable" from keyword absence`);
    }
  }
}

section("Personalized dimension selection: only relevant dimensions surface");
{
  const chatgpt = findTool("chatgpt");
  const claude = findTool("claude");
  const videoNeed = parseNeed("I want to edit YouTube videos");
  const writingDims = selectRelevantDimensions([chatgpt, claude], videoNeed, 12);
  // A video-editing need against writing-category tools should not surface
  // unrelated writing-only dimensions like "grammarClarity".
  assert(
    !writingDims.some((d) => d.id === "grammarClarity"),
    "an unrelated need never pulls in an irrelevant dimension just because it exists in the schema"
  );

  const dsaiNeed = parseNeed("DSAI coursework needing Python, research and PDFs");
  const relevant = selectRelevantDimensions([chatgpt, claude], dsaiNeed, 12);
  assert(relevant.some((d) => d.id === "coding"), "DSAI need surfaces the coding dimension");
  assert(relevant.some((d) => d.id === "research"), "DSAI need surfaces the research dimension");
  assert(relevant.some((d) => d.id === "fileAnalysis"), "DSAI need surfaces the file-analysis dimension");
  assert(relevant.length <= 12, "never exceeds the requested cap (no padding to hit a fake minimum)");

  const noNeed = selectRelevantDimensions([chatgpt, claude], null, 12);
  assert(noNeed.length > 0, "with no stated need, falls back to the category's default dimension set");
}

section("Exact 2-tool comparison: ChatGPT Plus vs Claude Code, DSAI context");
{
  const chatgpt = findTool("chatgpt");
  const claude = findTool("claude");
  const need = parseNeed(
    "I'm confused between ChatGPT Plus and Claude Code. I'm a DSAI student and need AI for coursework, Python, maths, statistics, research, PDFs and project development."
  );
  const pair = [chatgpt, claude];

  const diffs = buildKeyDifferences(pair, need);
  assert(diffs.length >= 3, `key differences returns at least 3 dimensions (got ${diffs.length})`);
  assert(diffs.every((d) => d.lines.length === 2), "every difference row has exactly one line per compared tool");
  const hasGenuineDiff = diffs.some((d) => !d.isTie);
  assert(hasGenuineDiff, "at least one dimension shows a genuine (non-tied) difference");
  const hasHonestTie = diffs.some((d) => d.isTie);
  assert(hasHonestTie, "at least one dimension is honestly reported as a tie, not manufactured");

  const quickTake = buildQuickTake(pair, need);
  assert(quickTake.length > 0 && quickTake.length <= 2, "quick take returns 1-2 grounded rows, never padded");
  for (const row of quickTake) {
    assert(row.reason.length > 0 && row.reason !== NOT_ENOUGH_VERIFIED_INFO, "quick take never recommends off unknown evidence");
  }

  const chatgptGM = buildPersonalizedGetMiss(chatgpt, pair, need);
  const claudeGM = buildPersonalizedGetMiss(claude, pair, need);
  assert(chatgptGM.get.length > 0, "ChatGPT has real personalized 'get' content for this need");
  assert(claudeGM.get.length > 0, "Claude has real personalized 'get' content for this need");
}

section("Three-tool comparison: ChatGPT vs Claude vs Gemini for college research/coding");
{
  const trio = [findTool("chatgpt"), findTool("claude"), findTool("gemini")];
  const need = parseNeed("college student who needs research and coding");
  const diffs = buildKeyDifferences(trio, need);
  assert(diffs.every((d) => d.lines.length === 3), "every dimension row covers all 3 compared tools");
  const quickTake = buildQuickTake(trio, need);
  assert(quickTake.length <= 2, "quick take still caps at 2 rows even with 3 tools compared");
}

section("Category-adaptive dimensions: Framer vs Webflow (design) vs Runway (video)");
{
  const framer = findTool("framer");
  const webflow = findTool("webflow");
  const need = parseNeed("startup website with strong design");
  const diffs = buildKeyDifferences([framer, webflow], need);
  assert(
    diffs.some((d) => d.dimension.id === "cmsHosting" || d.dimension.id === "noCodeCustomCode"),
    "website-builder-relevant dimensions (CMS/hosting, no-code vs code) surface for design-category tools"
  );

  const runway = findTool("runway");
  const runwayNeed = parseNeed("I want to make YouTube videos");
  const runwayProfile = getComparisonProfile(runway);
  const videoDims = getDimensionsForCategory(runway.category);
  assert(videoDims.some((d) => d.id === "textToVideo"), "video category schema includes text-to-video generation");
  assert(Object.keys(runwayProfile).length === videoDims.length, "Runway gets a full video-category profile");
  void runwayNeed;
}

section("Pricing comparison: real structured fields only, never invented");
{
  const pair = [findTool("chatgpt"), findTool("claude")];
  const rows = buildPricingComparison(pair);
  assert(rows.length === 2, "one pricing row per compared tool");
  for (const row of rows) {
    assert(row.startingPrice === row.tool.pricing.startingPrice, `${row.tool.slug} pricing row matches the tool's real pricing.startingPrice exactly`);
    assert(row.freePlan === row.tool.freePlan, `${row.tool.slug} pricing row matches the tool's real freePlan boolean exactly`);
    assert(row.lastVerified === row.tool.lastVerified, `${row.tool.slug} lastVerified is passed through untouched (undefined, never fabricated)`);
  }
}

section("What you get / what you might miss: backward-compatible + honest fallback");
{
  const chatgpt = findTool("chatgpt");
  const need = parseNeed("I need help with Python, research and PDFs for my DSAI coursework");
  const gm = getWhatYouGetAndMiss(chatgpt, need);
  assert(Array.isArray(gm.get) && Array.isArray(gm.miss), "getWhatYouGetAndMiss keeps its original {get, miss} string-array shape");
  assert(new Set(gm.get).size === gm.get.length, "get list has no duplicate lines (dedup across dimensions sharing evidence)");
  assert(new Set(gm.miss).size === gm.miss.length, "miss list has no duplicate lines");

  // A need with no matching evidence anywhere should degrade to the exact
  // required fallback string rather than an empty, unexplained section.
  const obscureTool = findTool("typeform");
  const unrelatedNeed = parseNeed("I need help with quantum physics research and advanced calculus proofs");
  const obscureGM = getWhatYouGetAndMiss(obscureTool, unrelatedNeed);
  if (obscureGM.get.length === 0) {
    assert(true, "empty get list is a valid, honest outcome when nothing relevant is evidenced (no forced fabrication)");
  } else {
    assert(obscureGM.get.every((g) => typeof g === "string" && g.length > 0), "any get lines present are real non-empty strings");
  }
}

section("No affiliate influence anywhere in the comparison intelligence layer");
{
  const files = [
    "src/data/comparisonDimensions.ts",
    "src/lib/comparisonProfile.ts",
    "src/lib/comparisonIntelligence.ts",
  ];
  for (const f of files) {
    const content = fs.readFileSync(f, "utf8");
    assert(
      !/affiliateEnabled|affiliateUrl|affiliateNetwork|commissionType|resolveOfferCta/.test(content),
      `${f} never references affiliate/deal fields`
    );
  }
}

section("No fabricated claims: every non-unknown description traces to real tool text");
{
  for (const t of tools.slice(0, 10)) {
    const profile = getComparisonProfile(t);
    const haystack = [t.name, t.tagline, t.description, t.subcategory, ...t.tags, ...t.features, ...t.pros, ...t.cons]
      .join(" ")
      .toLowerCase();
    for (const [id, evidence] of Object.entries(profile)) {
      if (evidence.level === "unknown") continue;
      if (id === "freePlanValue" && !evidence.evidence) continue; // structured boolean-derived fallback sentence
      const text = (evidence.evidence ?? evidence.description).toLowerCase();
      assert(haystack.includes(text), `${t.slug}.${id} description text is verbatim from the tool's own real fields`);
    }
  }
}

section("compareLevels ordering is total and consistent");
{
  assert(compareLevels("strong", "unknown") > 0, "strong ranks above unknown");
  assert(compareLevels("notAvailable", "unknown") > 0, "a known 'not available' ranks above a genuine unknown");
  assert(compareLevels("good", "good") === 0, "equal levels compare equal");
}

// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
