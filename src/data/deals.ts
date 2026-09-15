import type { Deal } from "./types";

/**
 * SAMPLE / DEMO OFFER DATA — every record here has `demo: true` and
 * `verified: false`. None of these are confirmed live discounts; they exist
 * to demonstrate the offers UI. Structured so a real, verified affiliate
 * deal can replace one later (verified: true, demo: false, affiliateUrl
 * populated) without changing any component code. `offerUrl` is where
 * "Get Offer" sends people today; `affiliateUrl` is reserved for a future
 * tracked link and is left undefined until a real partnership exists.
 */
export const deals: Deal[] = [
  {
    id: "deal-chatgpt",
    toolId: "chatgpt",
    title: "2 months of ChatGPT Plus at 20% off",
    description: "A sample introductory discount on the Plus plan for new subscribers.",
    discountText: "20% off",
    discountPercent: 20,
    originalPrice: "$20/month",
    offerPrice: "$16/month",
    currency: "USD",
    offerUrl: "https://chatgpt.com",
    verified: false,
    demo: true,
  },
  {
    id: "deal-claude",
    toolId: "claude",
    title: "15% off Claude Pro, first 3 months",
    description: "An illustrative introductory rate on the Pro plan for new subscribers.",
    discountText: "15% off",
    discountPercent: 15,
    originalPrice: "$20/month",
    offerPrice: "$17/month",
    currency: "USD",
    offerUrl: "https://claude.ai",
    verified: false,
    demo: true,
  },
  {
    id: "deal-notion",
    toolId: "notion",
    title: "3 months of Notion Plus free for students",
    description: "Student verification unlocks the Plus plan at no cost for a limited time.",
    discountText: "Free for 3 months",
    discountPercent: 100,
    originalPrice: "$10/month",
    offerPrice: "$0/month for 3 months",
    currency: "USD",
    offerUrl: "https://www.notion.so",
    verified: false,
    demo: true,
  },
  {
    id: "deal-canva",
    toolId: "canva",
    title: "50% off Canva Pro annual plan",
    description: "A sample annual discount for new Canva Pro subscribers.",
    discountText: "50% off",
    discountPercent: 50,
    originalPrice: "$119.99/year",
    offerPrice: "$59.99/year",
    currency: "USD",
    offerUrl: "https://www.canva.com",
    verified: false,
    demo: true,
  },
  {
    id: "deal-elevenlabs",
    toolId: "elevenlabs",
    title: "20% off ElevenLabs Creator plan",
    description: "Illustrative discount on the Creator tier for new subscribers.",
    discountText: "20% off",
    discountPercent: 20,
    originalPrice: "$22/month",
    offerPrice: "$17.60/month",
    currency: "USD",
    offerUrl: "https://elevenlabs.io",
    verified: false,
    demo: true,
  },
  {
    id: "deal-clickup",
    toolId: "clickup",
    title: "2 months free on annual ClickUp Unlimited",
    description: "A sample annual-billing incentive on the Unlimited plan.",
    discountText: "2 months free",
    discountPercent: 17,
    originalPrice: "$84/year",
    offerPrice: "$70/year",
    currency: "USD",
    offerUrl: "https://clickup.com",
    verified: false,
    demo: true,
  },
  {
    id: "deal-semrush",
    toolId: "semrush",
    title: "14-day extended free trial on Semrush Pro",
    description: "Sample extended-trial offer sourced through partner programs.",
    discountText: "Extended trial",
    originalPrice: "7-day trial",
    offerPrice: "14-day trial",
    currency: "USD",
    offerUrl: "https://www.semrush.com",
    verified: false,
    demo: true,
  },
  {
    id: "deal-webflow",
    toolId: "webflow",
    title: "30% off first year of Webflow Basic",
    description: "Illustrative first-year discount for new website plans.",
    discountText: "30% off",
    discountPercent: 30,
    originalPrice: "$168/year",
    offerPrice: "$117.60/year",
    currency: "USD",
    offerUrl: "https://webflow.com",
    verified: false,
    demo: true,
  },
];

export function getDealsForTool(toolId: string): Deal[] {
  return deals.filter((d) => d.toolId === toolId);
}

/**
 * The single best offer for a tool (highest discount first, verified before
 * demo), or undefined if no curated deal exists yet. Callers should show an
 * honest "no current verified offer" state rather than fabricating one when
 * this returns undefined — never invent a discount to fill the gap.
 */
export function getBestDealForTool(toolId: string): Deal | undefined {
  return getDealsForTool(toolId).sort((a, b) => {
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    return (b.discountPercent ?? 0) - (a.discountPercent ?? 0);
  })[0];
}
