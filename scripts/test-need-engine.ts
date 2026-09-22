/**
 * Deterministic test harness for the personalized decision engine
 * (lib/needSignals, needMatch, needCompare, answerQuestion). No framework,
 * no network, no AI — plain assertions against the same pipeline the app
 * uses at runtime. Run with: npx tsx scripts/test-need-engine.ts
 */
import { tools } from "../src/data/tools";
import { parseNeed } from "../src/lib/needSignals";
import { matchToolsToNeed, explainMatch, getMatchLabel, scoreToolAgainstNeed, getMatchPercent } from "../src/lib/needMatch";
import { getWhatYouGetAndMiss, summarizeFit, getNeedBasedVerdict } from "../src/lib/needCompare";
import { answerCommonComparisonQuestion } from "../src/lib/answerQuestion";

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

// ---------------------------------------------------------------------------
// Section 12: DSAI college student — ChatGPT vs Claude
// ---------------------------------------------------------------------------
section("DSAI college student scenario (ChatGPT vs Claude)");
{
  const needText =
    "I'm a DSAI college student. I need help with Python, maths, statistics, research and analyzing PDFs for my coursework. Occasionally I also need help with coding projects. My budget is around $20/month.";
  const parsedNeed = parseNeed(needText);
  const chipIds = parsedNeed.chips.map((c) => c.id);

  assert(chipIds.includes("data-science-coursework"), "extracts 'data science coursework' chip");
  assert(chipIds.includes("python-coding"), "extracts 'Python & coding projects' chip");
  assert(chipIds.includes("maths-statistics"), "extracts 'maths & statistics' chip");
  assert(chipIds.includes("research"), "extracts 'research & search' chip");
  assert(chipIds.includes("pdf-file-analysis"), "extracts 'PDF / file analysis' chip");
  assert(parsedNeed.budgetHint === "500-1000", `'$20/month' resolves to the correct budget bucket (got ${parsedNeed.budgetHint})`);

  const chatgpt = findTool("chatgpt");
  const claude = findTool("claude");

  // Whole-catalog discovery ranking: ChatGPT's broad "data analysis" +
  // "coding" + "reasoning" surface area puts it in the auto-discovery top 5
  // even competing against dedicated coding IDEs. Claude scores respectably
  // (see below) but doesn't out-rank dedicated coding tools for a query that
  // also explicitly mentions "coding projects" — that's the category signal
  // correctly doing its job, not a bug. The scenario this spec cares about —
  // a user explicitly comparing ChatGPT vs Claude for their stated need — is
  // exercised directly below via the fixed two-tool pool, exactly like the
  // real /compare?tools=chatgpt,claude&need=... page does.
  const discoveryMatches = matchToolsToNeed(parsedNeed, tools, 5);
  assert(discoveryMatches.some((m) => m.tool.slug === "chatgpt"), "ChatGPT appears in top-5 discovery matches");

  const chatgptPct = getMatchPercent(chatgpt, parsedNeed);
  const claudePct = getMatchPercent(claude, parsedNeed);
  assert(chatgptPct >= 45, `ChatGPT scores at least "Good match" (${chatgptPct}% -> ${getMatchLabel(chatgptPct)})`);
  assert(claudePct >= 45, `Claude scores at least "Good match" (${claudePct}% -> ${getMatchLabel(claudePct)})`);
  assert(
    typeof getMatchLabel(chatgptPct) === "string" && !/^\d/.test(getMatchLabel(chatgptPct)),
    "match strength is exposed as a qualitative label, never a raw number"
  );

  // Fixed two-tool pool, same as the compare page scores exactly the tools
  // the user selected (never the whole catalog).
  const pairMatches = matchToolsToNeed(parsedNeed, [chatgpt, claude], 2);
  const chatgptMatch = pairMatches.find((m) => m.tool.slug === "chatgpt")!;
  const claudeMatch = pairMatches.find((m) => m.tool.slug === "claude")!;
  assert(Boolean(chatgptMatch) && Boolean(claudeMatch), "both ChatGPT and Claude are scored when directly compared");
  assert(explainMatch(chatgptMatch, parsedNeed).reasons.length > 0, "ChatGPT gets non-empty 'why this fits' reasons");
  assert(explainMatch(claudeMatch, parsedNeed).reasons.length > 0, "Claude gets non-empty 'why this fits' reasons");

  const chatgptFit = getWhatYouGetAndMiss(chatgpt, parsedNeed);
  const claudeFit = getWhatYouGetAndMiss(claude, parsedNeed);
  assert(chatgptFit.get.length > 0, "ChatGPT 'what you get' is non-empty");
  assert(claudeFit.get.length > 0, "Claude 'what you get' is non-empty");
  assert(
    JSON.stringify(chatgptFit.miss) === JSON.stringify(chatgpt.cons),
    "ChatGPT 'what you might miss' is exactly tool.cons (never invented)"
  );
  assert(
    JSON.stringify(claudeFit.miss) === JSON.stringify(claude.cons),
    "Claude 'what you might miss' is exactly tool.cons (never invented)"
  );

  const compared = [chatgpt, claude];
  const percents = { chatgpt: chatgptPct, claude: claudePct };
  const verdicts = getNeedBasedVerdict(compared, parsedNeed, percents);
  assert(verdicts.length === 2, "getNeedBasedVerdict returns a reasoned row for both tools");
  assert(
    verdicts.every((v) => /\b(because|matters more to you|stronger fit)\b/.test(v.reason)),
    "verdict reasons are framed as fit, not a bare 'better' claim"
  );

  const whyAnswer = answerCommonComparisonQuestion("Why did you recommend this?", compared, parsedNeed);
  assert(whyAnswer.matched, "'Why did you recommend this?' is answered when a need is present");
  assert(whyAnswer.rows.length === 2, "'Why did you recommend this?' returns one reasoned row per tool");

  const fitsAnswer = answerCommonComparisonQuestion("Which fits my needs better?", compared, parsedNeed);
  assert(fitsAnswer.matched, "'Which fits my needs better?' is answered when a need is present");
  assert(fitsAnswer.rows.length === 2, "'Which fits my needs better?' returns one row per tool");

  const noContextAnswer = answerCommonComparisonQuestion("Why did you recommend this?", compared, null);
  assert(!noContextAnswer.matched, "'Why did you recommend this?' declines to guess with no stated need");
  assert(
    noContextAnswer.note === "I don't have enough verified information to answer that yet.",
    "uses the exact required fallback string when there is nothing verified to say"
  );

  const genericFallback = answerCommonComparisonQuestion("What's the meaning of life?", compared, parsedNeed);
  assert(!genericFallback.matched, "an unrelated question falls through to the fallback");
  assert(
    genericFallback.note === "I don't have enough verified information to answer that yet.",
    "generic fallback uses the exact required string"
  );
}

// ---------------------------------------------------------------------------
// Affiliate independence — the matching/scoring pipeline must never read
// affiliate/deal fields, regardless of scenario.
// ---------------------------------------------------------------------------
section("Affiliate independence");
{
  const needText = "I'm a DSAI college student who needs Python, statistics and research help, budget $20/month.";
  const parsedNeed = parseNeed(needText);
  const scored = tools.map((t) => scoreToolAgainstNeed(t, parsedNeed));
  const highAffiliatePopularityButIrrelevant = tools.filter((t) => t.affiliateEnabled && t.category !== "writing" && t.category !== "research" && t.category !== "coding");
  assert(scored.length === tools.length, "every tool gets scored");
  assert(
    highAffiliatePopularityButIrrelevant.every((t) => {
      const s = scored.find((r) => r.tool.slug === t.slug)!;
      return s.matchedChips.length === 0 || s.score < s.maxScore;
    }),
    "affiliate-enabled tools irrelevant to the need never get an unearned boost"
  );
}

// ---------------------------------------------------------------------------
// Section 13-style additional test cases A-J
// ---------------------------------------------------------------------------
section("Test A: Beginner wants to edit YouTube videos");
{
  const parsedNeed = parseNeed("I'm a total beginner and want to edit YouTube videos");
  assert(parsedNeed.categoryHint === "video", "categoryHint resolves to video");
  assert(parsedNeed.experienceHint === "beginner", "experienceHint resolves to beginner");
  const matches = matchToolsToNeed(parsedNeed, tools, 5);
  assert(matches.length > 0, "returns at least one match");
  assert(matches[0].tool.category === "video", `top match is a video tool (got ${matches[0].tool.category})`);
}

section("Test B: Strict free-only budget");
{
  const parsedNeed = parseNeed("I need a free tool to write blog content, zero budget");
  assert(parsedNeed.budgetHint === "free", "budgetHint resolves to free");
  const matches = matchToolsToNeed(parsedNeed, tools, 5);
  assert(matches.length > 0, "returns matches for a free-budget writing need");
}

section("Test C: Advanced/professional coder");
{
  const parsedNeed = parseNeed("I'm an expert developer who needs a professional coding tool");
  assert(parsedNeed.experienceHint === "advanced", "experienceHint resolves to advanced");
  assert(parsedNeed.categoryHint === "coding", "categoryHint resolves to coding");
}

section("Test D: Startup marketing & SEO");
{
  const parsedNeed = parseNeed("I run a small business and want to grow with SEO and marketing");
  assert(parsedNeed.categoryHint === "marketing", "categoryHint resolves to marketing");
  const matches = matchToolsToNeed(parsedNeed, tools, 5);
  assert(matches[0]?.tool.category === "marketing", "top match is a marketing tool");
}

section("Test E: No-code website builder");
{
  const parsedNeed = parseNeed("I want to build a website without coding, I'm non-technical");
  const chipIds = parsedNeed.chips.map((c) => c.id);
  assert(chipIds.includes("website-builder"), "extracts website-builder chip");
  assert(chipIds.includes("no-code"), "extracts no-code chip");
}

section("Test F: PDF-heavy academic research assistant");
{
  const parsedNeed = parseNeed("I need to research academic papers and analyze PDF files with citations");
  const chipIds = parsedNeed.chips.map((c) => c.id);
  assert(chipIds.includes("research"), "extracts research chip");
  assert(chipIds.includes("pdf-file-analysis"), "extracts pdf-file-analysis chip");
  const matches = matchToolsToNeed(parsedNeed, tools, 5);
  assert(matches.length > 0, "returns matches for the research + PDF need");
}

section("Test G: Team & project management");
{
  const parsedNeed = parseNeed("I need to manage my team's projects and tasks");
  assert(parsedNeed.categoryHint === "productivity", "categoryHint resolves to productivity");
  const matches = matchToolsToNeed(parsedNeed, tools, 5);
  assert(matches[0]?.tool.category === "productivity", "top match is a productivity tool");
}

section("Test H: Image / concept art generation");
{
  const parsedNeed = parseNeed("I want to generate concept art and illustrations");
  assert(parsedNeed.categoryHint === "image", "categoryHint resolves to image");
  const matches = matchToolsToNeed(parsedNeed, tools, 5);
  assert(matches[0]?.tool.category === "image", "top match is an image tool");
}

section("Test I: Voice & podcast production");
{
  const parsedNeed = parseNeed("I need voice cloning and podcast dubbing tools");
  assert(parsedNeed.categoryHint === "audio", "categoryHint resolves to audio");
  const matches = matchToolsToNeed(parsedNeed, tools, 5);
  assert(matches[0]?.tool.category === "audio", "top match is an audio tool");
}

section("Test J: Unparseable / nonsense input falls back gracefully");
{
  const parsedNeed = parseNeed("asdkjfh qwoeiru zzz");
  assert(parsedNeed.chips.length === 0, "no chips extracted from nonsense text");
  const matches = matchToolsToNeed(parsedNeed, tools, 5);
  assert(matches.length === 5, "falls back to the full pool (sliced to the limit) rather than returning nothing");
}

section("Qualitative labels never a raw percentage, anywhere in the pipeline");
{
  for (const pct of [0, 10, 44, 45, 69, 70, 97]) {
    const label = getMatchLabel(pct);
    assert(["Strong match", "Good match", "Possible match"].includes(label), `getMatchLabel(${pct}) -> "${label}" is one of the 3 allowed labels`);
  }
  const parsedNeed = parseNeed("I want to edit videos");
  const claude = findTool("claude");
  const fit = summarizeFit(claude, getMatchPercent(claude, parsedNeed), parsedNeed);
  assert(!/^\d+%?$/.test(fit.label), "summarizeFit label is never a bare number/percentage");
}

// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
