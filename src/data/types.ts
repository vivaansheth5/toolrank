export type CategorySlug =
  | "writing"
  | "image"
  | "video"
  | "audio"
  | "coding"
  | "research"
  | "productivity"
  | "design"
  | "marketing"
  | "business";

export type PriceTier = "free" | "under-500" | "500-1000" | "1000-plus";

export type Audience =
  | "students"
  | "creators"
  | "developers"
  | "freelancers"
  | "businesses";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type Strength = "ease-of-use" | "quality" | "price" | "features" | "speed";

export type ToolType = "AI" | "Software";

export type PricingModel = "Free" | "Freemium" | "Paid" | "Free Trial";

/** Where a monetization CTA was clicked — passed to the outbound-click tracker.
 *  find_my_tool covers the questionnaire results, the entry point of the
 *  revenue funnel; the other four match the spec's placement list exactly. */
export type CtaPlacement =
  | "compare_offer"
  | "tool_detail"
  | "deals_page"
  | "search_result"
  | "find_my_tool";

/** What kind of URL an outbound click actually opened. */
export type CtaDestinationType = "affiliate" | "official";

export interface Tool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: CategorySlug;
  subcategory: string;
  type: ToolType;
  pricing: {
    model: PricingModel;
    tier: PriceTier;
    startingPrice?: string;
    paidPlan?: string;
  };
  freePlan: boolean;
  targetAudience: Audience[];
  experienceLevel: ExperienceLevel[];
  strengths: Strength[];
  features: string[];
  pros: string[];
  cons: string[];
  rating: number;
  reviewCount: number;
  /** The tool's real marketing site. Never used as a fallback for affiliateUrl. */
  officialUrl: string;
  /** A verified, tracked affiliate link. Undefined until a real partnership
   *  exists — never substitute officialUrl here. */
  affiliateUrl?: string;
  /** True only once a real affiliate relationship is live for this tool. */
  affiliateEnabled: boolean;
  /** Name of the affiliate network/program (e.g. "Impact", "PartnerStack").
   *  Undefined until affiliateEnabled is true. */
  affiliateNetwork?: string;
  /** How the affiliate relationship pays out (e.g. "CPA", "revshare"). */
  commissionType?: string;
  /** ISO date this tool's pricing/URLs were last manually verified. */
  lastVerified?: string;
  tags: string[];
  popularity: number;
  createdAt: string;
}

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  description: string;
  icon: string;
}

export interface Deal {
  id: string;
  /** Matches Tool.id. */
  toolId: string;
  title: string;
  description: string;
  /** Short human-readable benefit for the offer badge, e.g. "20% off" or
   *  "Free for 3 months". Only ever shown alongside a real deal record —
   *  never fabricated for tools with no curated offer. */
  discountText?: string;
  /** Numeric discount, used for sorting/badge emphasis. */
  discountPercent?: number;
  originalPrice?: string;
  offerPrice?: string;
  currency: string;
  /** Where "Get Offer" / "Visit Official Site" sends the user today. */
  offerUrl: string;
  /** Reserved for a future affiliate/tracking link. Left undefined until
   *  a real partnership exists — never fall back to a fabricated one, and
   *  never equal to a Tool's officialUrl. */
  affiliateUrl?: string;
  /** Only render a "Verified" badge when this is explicitly true. */
  verified: boolean;
  /** True for all current sample/demo offers. Verified and demo are never
   *  both true at once. */
  demo: boolean;
  /** ISO date. Undefined when there's no known real expiry. */
  expiresAt?: string;
  /** ISO date this offer was last checked against the provider. */
  lastVerified?: string;
}
