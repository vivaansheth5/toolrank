import type { Deal } from "./types";

/**
 * SAMPLE / OFFER DATA — none of these are verified, live discounts unless
 * `verified: true` is explicitly set. Structured so real affiliate or
 * partner deal data can replace it later without changing any component
 * code. `offerUrl` is where "Get Offer" sends people today; `affiliateUrl`
 * is reserved for a future tracked link and is left undefined until a real
 * partnership exists.
 */
export const deals: Deal[] = [
  {
    id: "deal-chatgpt",
    toolSlug: "chatgpt",
    headline: "2 months of ChatGPT Plus at 20% off",
    description: "A sample introductory discount on the Plus plan for new subscribers.",
    originalPrice: "$20/month",
    discountedPrice: "$16/month",
    discountPercent: 20,
    expiry: "Sample offer — check provider for current terms",
    category: "writing",
    sample: true,
    verified: false,
    offerUrl: "https://chatgpt.com",
  },
  {
    id: "deal-claude",
    toolSlug: "claude",
    headline: "15% off Claude Pro, first 3 months",
    description: "An illustrative introductory rate on the Pro plan for new subscribers.",
    originalPrice: "$20/month",
    discountedPrice: "$17/month",
    discountPercent: 15,
    expiry: "Sample offer — check provider for current terms",
    category: "writing",
    sample: true,
    verified: false,
    offerUrl: "https://claude.ai",
  },
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
    verified: false,
    offerUrl: "https://www.notion.so",
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
    verified: false,
    offerUrl: "https://www.canva.com",
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
    verified: false,
    offerUrl: "https://elevenlabs.io",
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
    verified: false,
    offerUrl: "https://clickup.com",
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
    verified: false,
    offerUrl: "https://www.semrush.com",
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
    verified: false,
    offerUrl: "https://webflow.com",
  },
];

export function getDealsForTool(slug: string): Deal[] {
  return deals.filter((d) => d.toolSlug === slug);
}

/**
 * The single best offer for a tool (highest discount first), or undefined
 * if no curated deal exists yet. Callers should show an honest "no active
 * offer" state rather than fabricating one when this returns undefined.
 */
export function getBestDealForTool(slug: string): Deal | undefined {
  return getDealsForTool(slug).sort((a, b) => b.discountPercent - a.discountPercent)[0];
}
