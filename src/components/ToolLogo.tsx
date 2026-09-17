import { cn } from "@/lib/utils";
import type { CategorySlug } from "@/data/types";

export const CATEGORY_COLORS: Record<CategorySlug, string> = {
  writing: "bg-blue-50 text-blue-700",
  image: "bg-pink-50 text-pink-700",
  video: "bg-rose-50 text-rose-700",
  audio: "bg-purple-50 text-purple-700",
  coding: "bg-slate-100 text-slate-700",
  research: "bg-cyan-50 text-cyan-700",
  productivity: "bg-amber-50 text-amber-700",
  design: "bg-violet-50 text-violet-700",
  marketing: "bg-orange-50 text-orange-700",
  business: "bg-emerald-50 text-emerald-700",
};

/**
 * Solid per-category hue used for hover borders/glows on cards — same
 * category mapping as CATEGORY_COLORS, one shade stronger.
 */
export const CATEGORY_ACCENT: Record<CategorySlug, { border: string; shadow: string }> = {
  writing: { border: "group-hover:border-blue-300", shadow: "0 12px 28px -14px rgba(29, 78, 216, 0.35)" },
  image: { border: "group-hover:border-pink-300", shadow: "0 12px 28px -14px rgba(190, 24, 93, 0.35)" },
  video: { border: "group-hover:border-rose-300", shadow: "0 12px 28px -14px rgba(190, 18, 60, 0.35)" },
  audio: { border: "group-hover:border-purple-300", shadow: "0 12px 28px -14px rgba(126, 34, 206, 0.35)" },
  coding: { border: "group-hover:border-slate-400", shadow: "0 12px 28px -14px rgba(51, 65, 85, 0.35)" },
  research: { border: "group-hover:border-cyan-300", shadow: "0 12px 28px -14px rgba(14, 116, 144, 0.35)" },
  productivity: { border: "group-hover:border-amber-300", shadow: "0 12px 28px -14px rgba(180, 83, 9, 0.35)" },
  design: { border: "group-hover:border-violet-300", shadow: "0 12px 28px -14px rgba(109, 40, 217, 0.35)" },
  marketing: { border: "group-hover:border-orange-300", shadow: "0 12px 28px -14px rgba(194, 65, 12, 0.35)" },
  business: { border: "group-hover:border-emerald-300", shadow: "0 12px 28px -14px rgba(4, 120, 87, 0.35)" },
};

/**
 * Static (non-hover) per-category ring/border, for decorative use on
 * detail-page hero bands and cards that should always show their category
 * hue, not just on hover.
 */
export const CATEGORY_RING: Record<CategorySlug, string> = {
  writing: "ring-blue-200",
  image: "ring-pink-200",
  video: "ring-rose-200",
  audio: "ring-purple-200",
  coding: "ring-slate-300",
  research: "ring-cyan-200",
  productivity: "ring-amber-200",
  design: "ring-violet-200",
  marketing: "ring-orange-200",
  business: "ring-emerald-200",
};

/**
 * Solid per-category strip color (one shade stronger than CATEGORY_RING),
 * for decorative top-border accents on editorial cards.
 */
export const CATEGORY_STRIP: Record<CategorySlug, string> = {
  writing: "bg-blue-300",
  image: "bg-pink-300",
  video: "bg-rose-300",
  audio: "bg-purple-300",
  coding: "bg-slate-400",
  research: "bg-cyan-300",
  productivity: "bg-amber-300",
  design: "bg-violet-300",
  marketing: "bg-orange-300",
  business: "bg-emerald-300",
};

function getInitials(name: string): string {
  const parts = name.replace(/\./g, "").split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ToolLogo({
  name,
  category,
  size = "md",
  className,
}: {
  name: string;
  category: CategorySlug;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = size === "lg" ? "h-16 w-16 text-xl" : size === "md" ? "h-11 w-11 text-sm" : "h-9 w-9 text-xs";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl font-semibold tracking-tight ring-1 ring-inset ring-black/5",
        dims,
        CATEGORY_COLORS[category],
        className
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
