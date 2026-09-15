import { getToolBySlug } from "./tools";
import type { Tool } from "./types";

/**
 * Small, curated list of high-value comparison pairs — used to power
 * internal links (related comparisons on a comparison page, a "popular
 * comparisons" list on the empty Compare page) without generating a static
 * page per pair. Every pair still resolves through the existing
 * /compare?tools=slug,slug route.
 *
 * "Canva vs Adobe" was requested, but no tool named plainly "Adobe" exists
 * in the dataset — only "Adobe Firefly" does — so that entry uses
 * adobe-firefly and is labeled accordingly rather than promising a
 * comparison the data can't back up.
 */
const FEATURED_COMPARISON_SLUGS: [string, string][] = [
  ["chatgpt", "claude"],
  ["chatgpt", "gemini"],
  ["chatgpt", "perplexity"],
  ["claude", "gemini"],
  ["cursor", "github-copilot"],
  ["webflow", "framer"],
  ["clickup", "monday"],
  ["canva", "adobe-firefly"],
  ["semrush", "ahrefs"],
  ["descript", "capcut"],
];

export interface FeaturedComparison {
  tools: [Tool, Tool];
  slug: string;
  label: string;
  href: string;
}

/**
 * Resolved at call time (not module load) so this stays correct even if
 * the underlying tool dataset changes. Only pairs where BOTH tools exist
 * are returned.
 */
export function getFeaturedComparisons(): FeaturedComparison[] {
  const resolved: FeaturedComparison[] = [];

  for (const [slugA, slugB] of FEATURED_COMPARISON_SLUGS) {
    const toolA = getToolBySlug(slugA);
    const toolB = getToolBySlug(slugB);
    if (!toolA || !toolB) continue;

    resolved.push({
      tools: [toolA, toolB],
      slug: `${toolA.slug}-vs-${toolB.slug}`,
      label: `${toolA.name} vs ${toolB.name}`,
      href: `/compare?tools=${toolA.slug},${toolB.slug}`,
    });
  }

  return resolved;
}

/** Featured comparisons that involve a given tool, excluding the pairing
 *  with itself — used for "other relevant comparisons" internal links. */
export function getRelatedFeaturedComparisons(toolSlug: string, limit = 3): FeaturedComparison[] {
  return getFeaturedComparisons()
    .filter((c) => c.tools.some((t) => t.slug === toolSlug))
    .slice(0, limit);
}
