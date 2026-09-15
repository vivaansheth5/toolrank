import type { Audience, ExperienceLevel, PriceTier, Strength } from "@/data/types";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export const PRICE_TIER_LABELS: Record<PriceTier, string> = {
  free: "Free",
  "under-500": "Under ₹500/mo",
  "500-1000": "₹500–₹1,000/mo",
  "1000-plus": "₹1,000+/mo",
};

export const AUDIENCE_LABELS: Record<Audience, string> = {
  students: "Students",
  creators: "Creators",
  developers: "Developers",
  freelancers: "Freelancers",
  businesses: "Businesses",
};

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const STRENGTH_LABELS: Record<Strength, string> = {
  "ease-of-use": "Ease of use",
  quality: "Best quality",
  price: "Lowest price",
  features: "Most features",
  speed: "Speed",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export const PRICING_DISCLAIMER =
  "Pricing and availability may change. Check the provider's website for current details.";
