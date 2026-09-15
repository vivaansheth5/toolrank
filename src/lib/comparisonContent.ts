import type { Tool } from "@/data/types";
import { getCategory } from "@/data/categories";
import { getCompareVerdicts, STRENGTH_PHRASES } from "./verdict";
import { AUDIENCE_LABELS } from "./utils";

export interface ComparisonFaq {
  question: string;
  answer: string;
}

export interface ComparisonEditorial {
  title: string;
  quickVerdict: string;
  keyDifferences: string[];
  bestFor: { tool: Tool; text: string }[];
  pricingOverview: { tool: Tool; text: string }[];
  easeOfUse: { tool: Tool; text: string }[];
  strengths: { tool: Tool; items: string[] }[];
  limitations: { tool: Tool; items: string[] }[];
  whoShouldChoose: { tool: Tool; text: string }[];
  faqs: ComparisonFaq[];
}

export function joinNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

function pluralVerb(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

function stripLeadingFrom(price: string): string {
  return price.replace(/^From\s+/i, "");
}

function audienceList(tool: Tool): string {
  return tool.targetAudience.map((a) => AUDIENCE_LABELS[a]).join(", ");
}

function pricingSentence(tool: Tool): string {
  const start = tool.pricing.startingPrice ? stripLeadingFrom(tool.pricing.startingPrice) : undefined;
  if (tool.freePlan && start) {
    return `${tool.pricing.model} — includes a free plan; paid plans start at ${start}.`;
  }
  if (tool.freePlan) {
    return `${tool.pricing.model} — includes a free plan.`;
  }
  if (start) {
    return `${tool.pricing.model} — no free plan, starts at ${start}.`;
  }
  return `${tool.pricing.model} — no free plan.`;
}

function easeOfUseSentence(tool: Tool): string {
  return tool.strengths.includes("ease-of-use")
    ? `${tool.name} is one of the easier tools in its category to pick up.`
    : `${tool.name} is reasonably approachable, though it has more of a learning curve than tools built specifically around simplicity.`;
}

// Negative lookbehind excludes "no-code"/"no code" (Webflow, Framer, Zapier,
// Make, ...) which is about NOT writing code, the opposite signal.
const CODING_KEYWORD = /(?<!no[\s-])\bcod(e|ing)\b/i;

function isCodingRelevant(tool: Tool): boolean {
  return (
    tool.category === "coding" ||
    tool.tags.some((t) => CODING_KEYWORD.test(t)) ||
    tool.features.some((f) => CODING_KEYWORD.test(f))
  );
}

function buildFaqs(tools: Tool[]): ComparisonFaq[] {
  const names = tools.map((t) => t.name);
  const faqs: ComparisonFaq[] = [];

  faqs.push({
    question: `What's the difference between ${joinNames(names)}?`,
    answer: tools
      .map(
        (t) =>
          `${t.name} — ${t.subcategory} in the ${getCategory(t.category)?.name ?? t.category} category, rated ${t.rating.toFixed(1)}/5.`
      )
      .join(" "),
  });

  const withFreePlan = tools.filter((t) => t.freePlan);
  const withoutFreePlan = tools.filter((t) => !t.freePlan);
  faqs.push({
    question: "Which has a free plan?",
    answer:
      withoutFreePlan.length === 0
        ? `${joinNames(names)} all offer a free plan.`
        : withFreePlan.length === 0
        ? `${joinNames(names)} — none currently offer a free plan.`
        : `${joinNames(withFreePlan.map((t) => t.name))} ${pluralVerb(withFreePlan.length, "offers", "offer")} a free plan; ${joinNames(withoutFreePlan.map((t) => t.name))} ${pluralVerb(withoutFreePlan.length, "does", "do")} not.`,
  });

  const easyTools = tools.filter((t) => t.strengths.includes("ease-of-use"));
  faqs.push({
    question: "Which is easier to use?",
    answer:
      easyTools.length === 0
        ? `${joinNames(names)} are broadly comparable in ease of use — none stands out as significantly simpler.`
        : `${joinNames(easyTools.map((t) => t.name))} ${pluralVerb(easyTools.length, "is", "are")} particularly known for ease of use among this group.`,
  });

  const beginnerFriendly = tools.filter((t) => t.experienceLevel.includes("beginner"));
  faqs.push({
    question: "Which should a beginner choose?",
    answer:
      beginnerFriendly.length === 0
        ? `${joinNames(names)} — none are specifically aimed at beginners, so expect some ramp-up time either way.`
        : `${[...beginnerFriendly].sort((a, b) => b.rating - a.rating)[0].name} is the best starting point for beginners among ${joinNames(names)}.`,
  });

  const codingTools = tools.filter(isCodingRelevant);
  if (codingTools.length > 0) {
    const best = [...codingTools].sort((a, b) => b.rating - a.rating)[0];
    faqs.push({
      question: "Which is better for coding?",
      answer:
        codingTools.length === tools.length
          ? `Both are built with coding in mind; ${best.name} is the higher-rated option of the two for that use case.`
          : `${best.name} is the stronger pick for coding — ${joinNames(codingTools.map((t) => t.name))} ${pluralVerb(codingTools.length, "is", "are")} built specifically for developer workflows in this comparison.`,
    });
  }

  return faqs;
}

/**
 * Deterministic, data-driven editorial content for a comparison — no AI
 * call. Everything here is derived from existing Tool fields (rating,
 * pricing, freePlan, strengths, pros/cons, targetAudience, experienceLevel,
 * subcategory) and the same getCompareVerdicts() logic used in the
 * "Which one should you choose?" section, so the two never contradict each
 * other. Reads no affiliate/deal data — monetization never influences this.
 */
export function buildComparisonEditorial(tools: Tool[]): ComparisonEditorial | null {
  if (tools.length < 2) return null;

  const verdicts = getCompareVerdicts(tools);

  return {
    title: tools.map((t) => t.name).join(" vs "),
    quickVerdict: verdicts.map((v) => v.reason).join(" "),
    keyDifferences: tools.map((t) => {
      const category = getCategory(t.category);
      const priceBit = t.pricing.startingPrice
        ? `starting at ${stripLeadingFrom(t.pricing.startingPrice)}`
        : t.pricing.model.toLowerCase();
      return `${t.name} — ${t.subcategory} (${category?.name ?? t.category}), ${priceBit}, ${t.freePlan ? "with" : "without"} a free plan, rated ${t.rating.toFixed(1)}/5.`;
    }),
    bestFor: tools.map((t) => ({ tool: t, text: `${t.name} is best suited to ${audienceList(t)}.` })),
    pricingOverview: tools.map((t) => ({ tool: t, text: pricingSentence(t) })),
    easeOfUse: tools.map((t) => ({ tool: t, text: easeOfUseSentence(t) })),
    strengths: tools.map((t) => ({
      tool: t,
      items: t.strengths[0] ? [STRENGTH_PHRASES[t.strengths[0]], ...t.pros.slice(0, 2)] : t.pros.slice(0, 3),
    })),
    limitations: tools.map((t) => ({ tool: t, items: t.cons.slice(0, 3) })),
    whoShouldChoose: verdicts.map((v) => ({ tool: v.tool, text: v.reason })),
    faqs: buildFaqs(tools),
  };
}
