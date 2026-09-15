import { cn } from "@/lib/utils";
import type { CategorySlug } from "@/data/types";

const CATEGORY_COLORS: Record<CategorySlug, string> = {
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
