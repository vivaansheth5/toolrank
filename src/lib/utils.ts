import type { Audience, ExperienceLevel, Strength } from "@/data/types";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

// PriceTier display labels live in lib/currency.ts (getPriceTierLabel) —
// they're currency-aware, so a single hardcoded map here would always be
// wrong for someone. See lib/currency.ts for why.

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
