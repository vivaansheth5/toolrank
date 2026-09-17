import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import ToolLogo, { CATEGORY_ACCENT } from "./ToolLogo";
import Rating from "./Rating";
import PricingBadge from "./PricingBadge";
import { cn } from "@/lib/utils";
import type { Tool } from "@/data/types";
import { getCategory } from "@/data/categories";

export default function ToolCard({
  tool,
  selectable = false,
  selected = false,
  onToggleSelect,
  disabledSelect = false,
}: {
  tool: Tool;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (slug: string) => void;
  disabledSelect?: boolean;
}) {
  const category = getCategory(tool.category);
  const accent = CATEGORY_ACCENT[tool.category];

  return (
    <div
      style={{ ["--hover-shadow" as string]: accent.shadow }}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--hover-shadow)]",
        selected ? "border-accent ring-1 ring-accent" : cn("border-border", accent.border)
      )}
    >
      {selectable && (
        <button
          type="button"
          onClick={() => onToggleSelect?.(tool.slug)}
          disabled={disabledSelect && !selected}
          aria-pressed={selected}
          aria-label={selected ? `Remove ${tool.name} from comparison` : `Add ${tool.name} to comparison`}
          className={cn(
            "focus-ring absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border transition-colors",
            selected
              ? "border-accent bg-accent text-white"
              : "border-border-strong bg-surface text-transparent hover:border-accent",
            disabledSelect && !selected && "cursor-not-allowed opacity-40"
          )}
        >
          <Check size={14} strokeWidth={3} />
        </button>
      )}

      <Link href={`/tools/${tool.slug}`} className="flex flex-1 flex-col focus-ring rounded-xl">
        <div className="flex items-start gap-3">
          <ToolLogo name={tool.name} category={tool.category} className="transition-transform group-hover:scale-110" />
          <div className="min-w-0 flex-1 pr-6">
            <h3 className="truncate text-base font-semibold text-foreground">{tool.name}</h3>
            <p className="text-xs text-muted">
              {category?.name} · {tool.subcategory}
            </p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-foreground/80">{tool.tagline}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <PricingBadge model={tool.pricing.model} />
          {tool.freePlan && (
            <span className="inline-flex items-center rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
              Free plan
            </span>
          )}
        </div>

        <div className="mt-3">
          <Rating value={tool.rating} reviewCount={tool.reviewCount} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-stone-50 px-2 py-0.5 text-[11px] text-muted ring-1 ring-inset ring-border"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-1 pt-2 text-sm font-medium text-accent">
          View tool
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>
    </div>
  );
}
