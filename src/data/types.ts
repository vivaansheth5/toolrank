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
  websiteUrl: string;
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
  toolSlug: string;
  headline: string;
  description: string;
  originalPrice: string;
  discountedPrice: string;
  discountPercent: number;
  expiry?: string;
  category: CategorySlug;
  sample: true;
}
