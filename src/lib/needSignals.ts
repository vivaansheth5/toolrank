import type { CategorySlug, ExperienceLevel, PriceTier, Strength, ToolType } from "@/data/types";

/**
 * A single recognizable "requirement" a user's free-text need can express —
 * e.g. "beginner-friendly" or "YouTube video creation". Each chip carries
 * its own matching hints (tagHints are checked against a tool's searchable
 * text from lib/needProfile.ts) so the whole pipeline stays deterministic
 * and explainable: no chip is ever invented for a tool that doesn't
 * genuinely mention it somewhere in its real, curated data.
 */
export interface RequirementChip {
  id: string;
  label: string;
  emoji: string;
  /** Lowercase substrings checked against a tool's searchable text. */
  tagHints: string[];
  categoryHint?: CategorySlug;
  typeHint?: ToolType;
  priorityHint?: Strength;
  experienceHint?: ExperienceLevel;
  budgetHint?: PriceTier;
}

/**
 * Phrase → chip dictionary. Deliberately the same shape as lib/search.ts's
 * SYNONYMS table — a hand-curated, deterministic map from natural language
 * to structured hints. No AI call; swap/extend this table (or replace
 * parseNeed's body) later to hand off to an LLM without touching any
 * component that consumes ParsedNeed.
 */
const NEED_SIGNALS: { pattern: RegExp; chip: RequirementChip }[] = [
  {
    pattern: /\byoutube\b/,
    chip: {
      id: "youtube-video",
      label: "YouTube video creation",
      emoji: "🎥",
      tagHints: ["video editing", "video generation", "short-form video", "vfx"],
      categoryHint: "video",
    },
  },
  {
    pattern: /\bvideo(s)?\b|\bediting\b.*\bvideo\b|\bvlog/,
    chip: {
      id: "video-editing",
      label: "Video editing",
      emoji: "🎥",
      tagHints: ["video editing", "video generation", "short-form video", "vfx", "podcast editing"],
      categoryHint: "video",
    },
  },
  {
    pattern: /\bwebsite\b|\blanding page\b|\bportfolio site\b/,
    chip: {
      id: "website-builder",
      label: "Website building",
      emoji: "💻",
      tagHints: ["website builder", "landing pages", "cms", "no-code"],
      categoryHint: "design",
    },
  },
  {
    pattern: /\bpresentation(s)?\b|\bslide(s|deck)?\b|\bpitch deck\b/,
    chip: {
      id: "presentations",
      label: "Presentations",
      emoji: "📊",
      tagHints: ["presentations", "ai slides", "pitch decks", "documents"],
      categoryHint: "productivity",
    },
  },
  {
    pattern: /\bmanage(ment)?\b.*\b(team|project|tasks?)\b|\bteam('s)?\b.*\bproject/,
    chip: {
      id: "team-management",
      label: "Team & project management",
      emoji: "👥",
      tagHints: ["project management", "task management", "kanban", "team chat", "work os", "collaboration"],
      categoryHint: "productivity",
    },
  },
  {
    pattern: /\bwrit(e|ing)\b(?!.*\bcod)|\bcontent\b|\bblog\b|\bcopy\b(writing)?/,
    chip: {
      id: "writing-content",
      label: "Writing content",
      emoji: "✍️",
      tagHints: ["ai writing", "writing assistant", "grammar checker", "copywriting"],
      categoryHint: "writing",
    },
  },
  {
    pattern: /\bdesign\b|\bgraphics?\b|\bvisual(s)?\b/,
    chip: {
      id: "design",
      label: "Design",
      emoji: "🎨",
      tagHints: ["ui design", "graphic design", "design systems", "prototyping", "templates"],
      categoryHint: "design",
    },
  },
  {
    pattern: /\bcod(e|ing)\b|\bprogramming\b|\bdeveloper\b|\bsoftware engineer/,
    chip: {
      id: "coding",
      label: "Coding help",
      emoji: "💻",
      tagHints: ["ai coding", "code editor", "developer tools", "ide", "version control"],
      categoryHint: "coding",
    },
  },
  {
    pattern: /\bgrow (my|our|the) business\b|\bmarketing\b|\bseo\b|\bleads?\b|\bsales\b/,
    chip: {
      id: "marketing-growth",
      label: "Marketing & growth",
      emoji: "📈",
      tagHints: ["seo", "marketing", "keyword research", "crm", "email marketing", "backlinks"],
      categoryHint: "marketing",
    },
  },
  {
    pattern: /\bwork with ai\b|\bai tool(s)?\b|\bartificial intelligence\b/,
    chip: {
      id: "ai-powered",
      label: "AI-powered",
      emoji: "🤖",
      tagHints: [],
      typeHint: "AI",
    },
  },
  {
    pattern: /\banaly(s|z)e data\b|\banalytics\b|\bdata\b.*\bdashboard\b|\breporting\b/,
    chip: {
      id: "data-analysis",
      label: "Data analysis",
      emoji: "📊",
      tagHints: ["analytics", "backlinks", "competitor analysis", "reporting", "keyword research"],
    },
  },
  {
    pattern: /\bcaption(s|ing)?\b|\bsubtitle(s)?\b/,
    chip: {
      id: "captions",
      label: "Automatic captions / subtitles",
      emoji: "💬",
      tagHints: ["captions", "subtitles", "transcription"],
    },
  },
  {
    pattern: /\btranscri(be|ption|pt)\b|\bmeeting notes?\b/,
    chip: {
      id: "transcription",
      label: "Transcription",
      emoji: "🎙️",
      tagHints: ["transcription", "meeting notes"],
    },
  },
  {
    pattern: /\bimage(s)?\b|\billustration\b|\bartwork\b|\bconcept art\b/,
    chip: {
      id: "image-generation",
      label: "Image generation",
      emoji: "🖼️",
      tagHints: ["ai image", "art", "illustration", "generative fill", "concept art"],
      categoryHint: "image",
    },
  },
  {
    pattern: /\bvoice\b|\baudio\b|\bpodcast\b|\bdubbing\b|\bvoiceover\b/,
    chip: {
      id: "voice-audio",
      label: "Voice & audio",
      emoji: "🎧",
      tagHints: ["ai voice", "text to speech", "dubbing", "voice cloning", "audio"],
      categoryHint: "audio",
    },
  },
  {
    pattern: /\bno.?code\b|\bwithout coding\b|\bnon.?technical\b/,
    chip: {
      id: "no-code",
      label: "No-code / non-technical",
      emoji: "🧩",
      tagHints: ["no-code"],
    },
  },
  {
    pattern: /\bautomat(e|ion)\b|\bworkflow(s)?\b|\bintegrat(e|ion)/,
    chip: {
      id: "automation",
      label: "Automation",
      emoji: "⚙️",
      tagHints: ["automation", "workflow", "integrations"],
      categoryHint: "productivity",
    },
  },
  {
    pattern: /\bresearch\b|\bcited?\b|\bfact.?check/,
    chip: {
      id: "research",
      label: "Research & search",
      emoji: "🔎",
      tagHints: ["ai search", "research", "citations", "fact-checking"],
      categoryHint: "research",
    },
  },
  {
    pattern: /\bbeginner\b|\bnew to this\b|\bnever used\b|\bnon.?technical\b|\bsimple\b|\bsimplest\b/,
    chip: {
      id: "beginner-friendly",
      label: "Beginner-friendly",
      emoji: "👶",
      tagHints: [],
      experienceHint: "beginner",
      priorityHint: "ease-of-use",
    },
  },
  {
    pattern: /\bprofessional\b|\badvanced\b|\bexpert\b|\bpower user\b/,
    chip: {
      id: "advanced",
      label: "Professional / advanced",
      emoji: "🏆",
      tagHints: [],
      experienceHint: "advanced",
    },
  },
  {
    pattern: /\bfast\b|\bquick(ly)?\b|\bspeed\b|\brapid\b/,
    chip: {
      id: "fast-workflow",
      label: "Fast workflow",
      emoji: "⚡",
      tagHints: [],
      priorityHint: "speed",
    },
  },
  {
    pattern: /\bfree\b(?!\s*trial)|\bno cost\b|\bzero budget\b/,
    chip: {
      id: "free-budget",
      label: "Free / no cost",
      emoji: "🆓",
      tagHints: [],
      budgetHint: "free",
      priorityHint: "price",
    },
  },
  {
    pattern: /\baffordable\b|\bcheap(er)?\b|\bbudget\b|\blow.?cost\b|\bdon'?t want to spend\b/,
    chip: {
      id: "affordable",
      label: "Affordable",
      emoji: "💰",
      tagHints: [],
      priorityHint: "price",
    },
  },
  {
    pattern: /\bstartup\b|\bmy business\b|\bsmall business\b/,
    chip: {
      id: "startup",
      label: "For a startup / small business",
      emoji: "🚀",
      tagHints: ["crm", "marketing", "website builder", "landing pages"],
    },
  },
  {
    pattern: /\bcomplicated\b|\bdon'?t want.*complicat/,
    chip: {
      id: "not-complicated",
      label: "Not complicated",
      emoji: "⚡",
      tagHints: [],
      priorityHint: "ease-of-use",
    },
  },
  {
    pattern: /\bdata science\b|\bdsai\b|\bmachine learning\b|\bcollege (student|coursework|assignment)/,
    chip: {
      id: "data-science-coursework",
      label: "Data science coursework",
      emoji: "🧪",
      tagHints: ["data analysis", "coding", "reasoning"],
      typeHint: "AI",
    },
  },
  {
    pattern: /\bpython\b|\bpandas\b|\bnumpy\b|\bjupyter\b|\bcoding project(s)?\b|\bscript(s|ing)?\b/,
    chip: {
      id: "python-coding",
      label: "Python & coding projects",
      emoji: "🐍",
      tagHints: ["coding", "code editor", "developer tools"],
      categoryHint: "coding",
    },
  },
  {
    pattern: /\bmath(s)?\b|\bstatistic(s)?\b|\bstats\b|\bcalculus\b|\balgebra\b|\bquantitative\b/,
    chip: {
      id: "maths-statistics",
      label: "Maths & statistics help",
      emoji: "📐",
      tagHints: ["reasoning"],
      typeHint: "AI",
    },
  },
  {
    pattern: /\bpdf(s)?\b|\bfile analysis\b|\banalyz(e|ing) (a |my )?file(s)?\b|\bupload(ing)? (a |my )?(file|document)(s)?\b|\bdocument(s)? analysis\b/,
    chip: {
      id: "pdf-file-analysis",
      label: "PDF / file analysis",
      emoji: "📄",
      tagHints: ["data analysis", "long documents", "pdf", "file"],
    },
  },
  {
    pattern: /\bscalab(le|ility)\b|\bgrows? with (my|our|the) (business|team|site|traffic)\b/,
    chip: {
      id: "scalability",
      label: "Scalability",
      emoji: "📈",
      tagHints: ["scalable", "enterprise", "cms", "hosting"],
    },
  },
];

/**
 * Bucketed USD budget extracted straight from a "$X/month" style phrase in
 * the raw text, e.g. "around $20/month" or "$20 budget". Only ever set from
 * an explicit dollar figure the user typed — never inferred from anything
 * else — same "explicit signal only" rule as every other budgetHint.
 */
function extractDollarBudgetHint(lower: string): PriceTier | undefined {
  const match = lower.match(/\$\s?(\d+(?:\.\d+)?)/);
  if (!match) return undefined;
  const amount = parseFloat(match[1]);
  if (amount <= 0) return "free";
  if (amount <= 10) return "under-500";
  if (amount <= 20) return "500-1000";
  return "1000-plus";
}

export interface ParsedNeed {
  rawText: string;
  chips: RequirementChip[];
  categoryHint?: CategorySlug;
  typeHint?: ToolType;
  experienceHint?: ExperienceLevel;
  /** Only ever set from an explicit signal (text phrase, "$X/month" figure,
   *  or refinement chip the user picked) — never inferred, per the "budget
   *  only influences recommendations when explicitly expressed"
   *  requirement. */
  budgetHint?: PriceTier;
  priorityHints: Strength[];
  /** Dollar figure parsed from the raw text (if any), carried forward so
   *  refineParsedNeed doesn't lose it when it recomputes from chips alone. */
  textBudgetHint?: PriceTier;
}

export interface NeedRefinements {
  experience?: ExperienceLevel;
  budget?: PriceTier;
  priority?: Strength;
}

/**
 * Deterministic free-text need parser. No AI call: runs every NEED_SIGNALS
 * pattern against the lowercased input and unions the matched chips with
 * any explicit refinements the user picked afterward. Replace this
 * function's body with an LLM call later — everything downstream
 * (matchToolsToNeed, compareAgainstNeeds, explainMatch) only depends on the
 * ParsedNeed shape, not on how it was produced.
 */
export function parseNeed(rawText: string, refinements: NeedRefinements = {}): ParsedNeed {
  const lower = rawText.toLowerCase();
  const chips: RequirementChip[] = [];
  const seen = new Set<string>();

  for (const { pattern, chip } of NEED_SIGNALS) {
    if (pattern.test(lower) && !seen.has(chip.id)) {
      chips.push(chip);
      seen.add(chip.id);
    }
  }

  const categoryHint = chips.find((c) => c.categoryHint)?.categoryHint;
  const typeHint = chips.find((c) => c.typeHint)?.typeHint;
  const experienceHint = refinements.experience ?? chips.find((c) => c.experienceHint)?.experienceHint;
  const textBudgetHint = extractDollarBudgetHint(lower);
  const budgetHint = refinements.budget ?? textBudgetHint ?? chips.find((c) => c.budgetHint)?.budgetHint;

  const priorityHints = Array.from(
    new Set([
      ...chips.map((c) => c.priorityHint).filter((p): p is Strength => Boolean(p)),
      ...(refinements.priority ? [refinements.priority] : []),
    ])
  );

  return { rawText, chips, categoryHint, typeHint, experienceHint, budgetHint, priorityHints, textBudgetHint };
}

/**
 * Rebuilds a ParsedNeed after the user removes a misread chip or picks
 * explicit refinements, without re-parsing the raw text. Category/type/
 * experience/budget/priority hints are recomputed from whatever chips
 * remain, same as parseNeed does the first time.
 */
export function refineParsedNeed(
  parsedNeed: ParsedNeed,
  options: { excludeChipIds?: Set<string>; refinements?: NeedRefinements } = {}
): ParsedNeed {
  const { excludeChipIds, refinements = {} } = options;
  const chips = excludeChipIds ? parsedNeed.chips.filter((c) => !excludeChipIds.has(c.id)) : parsedNeed.chips;

  const categoryHint = chips.find((c) => c.categoryHint)?.categoryHint;
  const typeHint = chips.find((c) => c.typeHint)?.typeHint;
  const experienceHint = refinements.experience ?? chips.find((c) => c.experienceHint)?.experienceHint;
  const budgetHint = refinements.budget ?? parsedNeed.textBudgetHint ?? chips.find((c) => c.budgetHint)?.budgetHint;

  const priorityHints = Array.from(
    new Set([
      ...chips.map((c) => c.priorityHint).filter((p): p is Strength => Boolean(p)),
      ...(refinements.priority ? [refinements.priority] : []),
    ])
  );

  return {
    rawText: parsedNeed.rawText,
    chips,
    categoryHint,
    typeHint,
    experienceHint,
    budgetHint,
    priorityHints,
    textBudgetHint: parsedNeed.textBudgetHint,
  };
}

export const QUICK_START_NEEDS: { emoji: string; label: string; needText: string }[] = [
  { emoji: "🎥", label: "Make videos", needText: "I want to make videos" },
  { emoji: "✍️", label: "Write content", needText: "I want to write content" },
  { emoji: "🎨", label: "Design", needText: "I want to design something" },
  { emoji: "💻", label: "Build a website", needText: "I need to build a website" },
  { emoji: "📈", label: "Grow my business", needText: "I want to grow my business" },
  { emoji: "🤖", label: "Work with AI", needText: "I want to work with AI tools" },
  { emoji: "📊", label: "Analyze data", needText: "I need to analyze data" },
  { emoji: "👥", label: "Manage a team", needText: "I need to manage my team's projects" },
];
