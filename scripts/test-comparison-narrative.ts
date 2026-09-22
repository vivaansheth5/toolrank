/**
 * Deterministic tests for the V3 decision-support narrative layer
 * (lib/comparisonNarrative.ts) — the rebuild that replaces badges/table rows
 * with FACTS -> DIFFERENCES -> IMPLICATIONS -> USER-SPECIFIC TRADEOFFS ->
 * DECISION SUPPORT. Run with:
 * npx tsx scripts/test-comparison-narrative.ts
 */
import { tools } from "../src/data/tools";
import { parseNeed } from "../src/lib/needSignals";
import {
  buildUserContextSummary,
  buildProductContext,
  detectFundamentallyDifferentTypes,
  buildQuickTakeParagraph,
  buildOverlapSection,
  buildDifferencesSection,
  buildGetMissWithWhy,
  buildScenarios,
  buildTradeoffMap,
  buildWhatWouldChangeRecommendation,
} from "../src/lib/comparisonNarrative";
import { detectComparisonIntent } from "../src/lib/comparisonIntent";
import { readFileSync } from "fs";
import { join } from "path";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${message}`);
  } else {
    failed++;
    console.log(`  \x1b[31m✗\x1b[0m ${message}`);
  }
}

function section(title: string) {
  console.log(`\n${title}`);
}

const BANNED_WORDS = [/\bwinner\b/i, /\bbest\b/i, /\b#1\b/, /\d(\.\d)?\s*\/\s*10\b/, /\d{1,3}%\s*(better|match)?\s*$/i];
// "no (universal) winner" / "never a winner" / "isn't a winner" are the
// REQUIRED negations (spec: explicitly say there's no winner) — only a bare
// affirmative "winner"/"best" claim should fail this check.
const NEGATED_WINNER = /\b(no|never|not|isn't|n't)\b[^.!?]{0,20}\bwinner\b/i;

function findBannedWord(text: string): string | undefined {
  for (const re of BANNED_WORDS) {
    const m = text.match(re);
    if (!m) continue;
    if (/winner/i.test(m[0]) && NEGATED_WINNER.test(text)) continue;
    return m[0];
  }
  return undefined;
}

const chatgpt = tools.find((t) => t.slug === "chatgpt")!;
const claude = tools.find((t) => t.slug === "claude")!;
const canva = tools.find((t) => t.slug === "canva")!;
const framer = tools.find((t) => t.slug === "framer")!;
const webflow = tools.find((t) => t.slug === "webflow")!;
const capcut = tools.find((t) => t.slug === "capcut")!;
const runway = tools.find((t) => t.slug === "runway")!;

// ---------------------------------------------------------------------------
section("A. User context summary");
{
  const need = parseNeed(
    "I'm confused between buying ChatGPT Plus and Claude Code but yet I have to buy one, I need AI tool for my college course in DSAI"
  );
  const ctx = buildUserContextSummary(need);
  assert(ctx.rawText === need.rawText, "carries the raw text through untouched");
  assert(ctx.chips.length > 0, "extracts at least one chip from the DSAI text");
  assert(
    ctx.chips.some((c) => c.id === "data-science-coursework"),
    "extracts the data-science-coursework chip"
  );
}

// ---------------------------------------------------------------------------
section("B. Product context + fundamentally-different-type callout");
{
  const sameCategory = detectFundamentallyDifferentTypes([chatgpt, claude]);
  assert(sameCategory.show === false, "ChatGPT vs Claude (same category+subcategory) does not trigger the callout");

  const differentCategory = detectFundamentallyDifferentTypes([chatgpt, canva]);
  assert(differentCategory.show === true, "ChatGPT (writing) vs Canva (design) triggers the callout");
  assert(!!differentCategory.text && /aren't the same kind of tool/i.test(differentCategory.text), "callout text explains the category mismatch");

  const ctx = buildProductContext([chatgpt, claude]);
  assert(ctx.length === 2, "returns one entry per tool");
  assert(ctx[0].whatItIs.includes(chatgpt.tagline), "whatItIs is built from the tool's real tagline, not invented");

  const intent = detectComparisonIntent("Claude Code vs ChatGPT Plus for my DSAI coursework");
  const ctxWithAlias = buildProductContext([claude, chatgpt], intent.identifiedTools);
  const claudeEntry = ctxWithAlias.find((e) => e.tool.slug === "claude")!;
  assert(!!claudeEntry.aliasNote, "flags an honest alias note when the user named 'Claude Code' but the dataset only has one Claude record");
  assert(
    claudeEntry.aliasNote!.includes("Claude Code") && claudeEntry.aliasNote!.includes(claude.name),
    "alias note names both what the user said and the real record used"
  );
}

// ---------------------------------------------------------------------------
section("C. Quick take paragraph — no winner language, 3-5 sentences");
{
  const need = parseNeed("I need an AI tool for my DSAI college coursework, coding and research");
  const para = buildQuickTakeParagraph([chatgpt, claude], need);
  const sentenceCount = para.split(/(?<=[.!?])\s+/).filter(Boolean).length;
  assert(sentenceCount >= 3 && sentenceCount <= 5, `paragraph has 3-5 sentences (got ${sentenceCount})`);
  assert(!findBannedWord(para), `no banned winner/score language (found: ${findBannedWord(para)})`);
  assert(/no universal winner/i.test(para) || /depends on/i.test(para), "explicitly frames as fit-dependent, not a verdict");
}

// ---------------------------------------------------------------------------
section("D. Where they overlap — only real shared verified evidence");
{
  const need = parseNeed("I need an AI tool for DSAI coursework: coding, research and writing");
  const overlap = buildOverlapSection([chatgpt, claude], need);
  assert(overlap.length >= 1, "finds at least one real overlap area between ChatGPT and Claude");
  assert(
    overlap.every((o) => o.level !== "unknown" && o.level !== "notAvailable"),
    "never claims overlap on unverified/absent evidence"
  );
}

// ---------------------------------------------------------------------------
section("E. Where they differ — FACT / THAT MEANS / FOR YOU structure");
{
  const need = parseNeed(
    "I'm confused between ChatGPT Plus and Claude Code, I want a detailed comparison. I need an AI tool for my college course in DSAI - python coding, maths, research and file analysis with PDFs"
  );
  const diffs = buildDifferencesSection([chatgpt, claude], need);
  assert(diffs.length >= 3 && diffs.length <= 7, `returns 3-7 differences (got ${diffs.length})`);
  for (const d of diffs) {
    assert(d.fact.includes(chatgpt.name) && d.fact.includes(claude.name), `fact for ${d.dimension.id} names both tools`);
    assert(d.meansThat.length > 0, `meansThat for ${d.dimension.id} is non-empty`);
    assert(d.forYou.length > 0, `forYou for ${d.dimension.id} is non-empty`);
    assert(!findBannedWord(d.meansThat) && !findBannedWord(d.forYou), `no banned language in ${d.dimension.id}`);
  }
  const relevantDiff = diffs.find((d) => d.dimension.relatedChipIds.includes("python-coding"));
  if (relevantDiff) {
    assert(/you told us/i.test(relevantDiff.forYou), "personalizes forYou when the dimension matches a stated chip");
  }
}

// ---------------------------------------------------------------------------
section("F/G. What you get / what you might miss — with why-it-matters + real tradeoff");
{
  const need = parseNeed("I need an AI tool for my DSAI college coursework, python coding and research");
  const chatgptResult = buildGetMissWithWhy(chatgpt, [chatgpt, claude], need);
  const claudeResult = buildGetMissWithWhy(claude, [chatgpt, claude], need);

  assert(chatgptResult.get.every((g) => g.whyItMatters.length > 0), "every get item carries a whyItMatters sentence");
  assert(chatgptResult.miss.every((m) => m.tradeoff.length > 0), "every miss item carries a tradeoff sentence");
  assert(
    chatgptResult.miss.every((m) => !/fewer integrations/i.test(m.tradeoff)),
    "miss tradeoff text is never the generic 'fewer integrations' placeholder"
  );
  assert(
    [...chatgptResult.miss, ...claudeResult.miss].every((m) => /leaning away from|real limitation/i.test(m.tradeoff)),
    "tradeoff text is grounded in the actual comparison (leaning-away-from or a stated real-limitation framing)"
  );
}

// ---------------------------------------------------------------------------
section("H. Scenario comparison — category-adaptive, task-based");
{
  const codingNeed = parseNeed("I need an AI tool for DSAI coursework: python coding, maths and file analysis");
  const codingScenarios = buildScenarios([chatgpt, claude], codingNeed);
  assert(codingScenarios.length >= 3, `at least 3 scenarios for the writing/chatbot pair (got ${codingScenarios.length})`);
  assert(
    codingScenarios.every((s) => s.scenario.length > 0 && !/^[A-Z][a-z]+ \&/.test(s.scenario)),
    "every scenario is a real task phrase from the dimension schema"
  );
  assert(
    codingScenarios.some((s) => /debug|assignment|coursework|python|document/i.test(s.scenario)),
    "coding/DSAI-relevant scenarios surface for a coding/research need"
  );

  const videoNeed = parseNeed(
    "I'm a beginner YouTuber and want fast editing, automatic captions and an AI voice for my videos"
  );
  const videoScenarios = buildScenarios([capcut, runway], videoNeed);
  assert(videoScenarios.length >= 3, `at least 3 scenarios for the video pair (got ${videoScenarios.length})`);
  const videoScenarioText = videoScenarios.map((s) => s.scenario.toLowerCase()).join(" | ");
  assert(
    /caption|narration|dubbing|footage|template|cleanup/.test(videoScenarioText),
    "video-category scenarios are drawn from video-specific dimensions, not the coding/writing set"
  );

  const codingScenarioIds = new Set(codingScenarios.map((s) => s.dimension.id));
  const videoScenarioIds = new Set(videoScenarios.map((s) => s.dimension.id));
  assert(
    [...codingScenarioIds].every((id) => !videoScenarioIds.has(id) || id === "easeOfUse" || id === "freePlanValue"),
    "coding-category and video-category scenarios draw from different (category-specific) dimension sets"
  );
}

// ---------------------------------------------------------------------------
section("I. Tradeoff map — 'if your priority is X', never a global winner");
{
  const need = parseNeed("I need an AI tool for DSAI coursework: python coding, maths and research");
  const rows = buildTradeoffMap([chatgpt, claude], need);
  assert(rows.length >= 1, "produces at least one tradeoff row");
  for (const row of rows) {
    assert(!findBannedWord(row.dimension.label) && !findBannedWord(row.reason), `no banned language in ${row.dimension.id} tradeoff row`);
  }
  const dimIds = rows.map((r) => r.dimension.id);
  assert(new Set(dimIds).size === dimIds.length, "no duplicate dimension rows in the tradeoff map");
}

// ---------------------------------------------------------------------------
section("J. 'What would change your recommendation?' stays grounded in this comparison");
{
  const need = parseNeed("I need an AI tool for DSAI coursework: python coding and research");
  const text = buildWhatWouldChangeRecommendation([chatgpt, claude], need);
  assert(text.length > 0, "produces non-empty text");
  assert(!/discover|start over|find my tool/i.test(text), "never redirects the user back to generic discovery");
  const diffLabels = ["coding", "research", "reasoning", "file"].some((k) => text.toLowerCase().includes(k));
  assert(diffLabels, "references an actual dimension from this specific comparison");
}

// ---------------------------------------------------------------------------
section("Personalization: same two products, visibly different comparisons per user type");
{
  const dsaiNeed = parseNeed("I need an AI tool for DSAI coursework: python coding, maths, research and file analysis");
  const startupNeed = parseNeed("I run a startup and need help with team collaboration, automation and staying affordable");

  const dsaiScenarios = buildScenarios([chatgpt, claude], dsaiNeed).map((s) => s.dimension.id);
  const startupScenarios = buildScenarios([chatgpt, claude], startupNeed).map((s) => s.dimension.id);
  assert(
    JSON.stringify(dsaiScenarios) !== JSON.stringify(startupScenarios),
    "DSAI student and startup founder get different scenario ordering/selection for the same two tools"
  );

  const dsaiDiffs = buildDifferencesSection([chatgpt, claude], dsaiNeed).map((d) => d.dimension.id);
  const startupDiffs = buildDifferencesSection([chatgpt, claude], startupNeed).map((d) => d.dimension.id);
  assert(
    JSON.stringify(dsaiDiffs) !== JSON.stringify(startupDiffs),
    "DSAI student and startup founder get different key-difference ordering for the same two tools"
  );
}

// ---------------------------------------------------------------------------
section("Framer vs Webflow — design/SEO/scalability priorities surface for a startup website need");
{
  const need = parseNeed("Building a startup website, I care about design, SEO and scalability");
  const scenarios = buildScenarios([framer, webflow], need);
  const labels = scenarios.map((s) => s.dimension.id);
  assert(
    labels.some((id) => id === "visualEditing" || id === "cmsHosting" || id === "aiDesignTools"),
    "design-tool comparison surfaces visual editing / CMS / AI design dimensions for a startup website need"
  );
  assert(scenarios.every((s) => s.lines.length === 2), "every scenario has evidence lines for both compared tools");
}

// ---------------------------------------------------------------------------
section("Unknown data never renders as a negative 'No'");
{
  const need = parseNeed("I need something for DSAI coursework");
  const overlap = buildOverlapSection([chatgpt, claude], need);
  const diffs = buildDifferencesSection([chatgpt, claude], need);
  const allText = [...overlap.map((o) => o.note), ...diffs.map((d) => d.fact + d.meansThat + d.forYou)].join(" ");
  assert(!/\bNo\.\s|:\s*No\b/.test(allText), "no bare 'No' claims anywhere in overlap/differences text");
}

// ---------------------------------------------------------------------------
section("Affiliate independence: narrative layer never touches affiliate/deal fields");
{
  const src = readFileSync(join(__dirname, "../src/lib/comparisonNarrative.ts"), "utf8");
  assert(!/affiliate/i.test(src), "comparisonNarrative.ts source contains no reference to affiliate data");
  assert(
    !/from ["']@\/data\/deals["']|getBestDealForTool|\bDeal\b/.test(src),
    "comparisonNarrative.ts source never imports deal data or the Deal type"
  );
}

// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
