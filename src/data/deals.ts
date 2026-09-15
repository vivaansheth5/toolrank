import type { Deal } from "./types";

/**
 * SAMPLE / OFFER DATA — none of these are verified, live discounts.
 * Structured so real affiliate or partner deal data can replace it later
 * without changing any component code.
 */
export const deals: Deal[] = [
  {
    id: "deal-notion",
    toolSlug: "notion",
    headline: "3 months of Notion Plus free for students",
    description: "Student verification unlocks the Plus plan at no cost for a limited time.",
    originalPrice: "$10/month",
    discountedPrice: "$0/month for 3 months",
    discountPercent: 100,
    expiry: "Sample offer — check provider for current terms",
    category: "productivity",
    sample: true,
  },
  {
    id: "deal-canva",
    toolSlug: "canva",
    headline: "50% off Canva Pro annual plan",
    description: "A sample annual discount for new Canva Pro subscribers.",
    originalPrice: "$119.99/year",
    discountedPrice: "$59.99/year",
    discountPercent: 50,
    expiry: "Sample offer — check provider for current terms",
    category: "design",
    sample: true,
  },
  {
    id: "deal-elevenlabs",
    toolSlug: "elevenlabs",
    headline: "20% off ElevenLabs Creator plan",
    description: "Illustrative discount on the Creator tier for new subscribers.",
    originalPrice: "$22/month",
    discountedPrice: "$17.60/month",
    discountPercent: 20,
    expiry: "Sample offer — check provider for current terms",
    category: "audio",
    sample: true,
  },
  {
    id: "deal-clickup",
    toolSlug: "clickup",
    headline: "2 months free on annual ClickUp Unlimited",
    description: "A sample annual-billing incentive on the Unlimited plan.",
    originalPrice: "$84/year",
    discountedPrice: "$70/year",
    discountPercent: 17,
    expiry: "Sample offer — check provider for current terms",
    category: "productivity",
    sample: true,
  },
  {
    id: "deal-semrush",
    toolSlug: "semrush",
    headline: "14-day extended free trial on Semrush Pro",
    description: "Sample extended-trial offer sourced through partner programs.",
    originalPrice: "7-day trial",
    discountedPrice: "14-day trial",
    discountPercent: 0,
    expiry: "Sample offer — check provider for current terms",
    category: "marketing",
    sample: true,
  },
  {
    id: "deal-webflow",
    toolSlug: "webflow",
    headline: "30% off first year of Webflow Basic",
    description: "Illustrative first-year discount for new website plans.",
    originalPrice: "$168/year",
    discountedPrice: "$117.60/year",
    discountPercent: 30,
    expiry: "Sample offer — check provider for current terms",
    category: "design",
    sample: true,
  },
];

export function getDealsForTool(slug: string): Deal[] {
  return deals.filter((d) => d.toolSlug === slug);
}
