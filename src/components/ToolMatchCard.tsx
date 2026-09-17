import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import ToolLogo, { CATEGORY_ACCENT } from "./ToolLogo";
import PricingBadge from "./PricingBadge";
import { cn } from "@/lib/utils";
import type { Tool } from "@/data/types";

export default function ToolMatchCard({
  tool,
  matchPercent,
  reasons,
  bestFor,
  selectable = false,
  selected = false,
  onToggleSelect,
}: {
  tool: Tool;
  matchPercent: number;
  reasons: string[];
  bestFor?: string;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (slug: string) => void;
}) {
  const accent = CATEGORY_ACCENT[tool.category];

  return (
    <div
      style={{ ["--hover-shadow" as string]: accent.shadow }}
      className={cn(
        "animate-fade-in-up relative flex flex-col gap-4 rounded-2xl border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--hover-shadow)] sm:flex-row sm:items-start",
        selected ? "border-accent ring-1 ring-accent" : cn("border-border", accent.border)
      )}
    >
      <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-2">
        <ToolLogo name={tool.name} category={tool.category} size="lg" />
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold tracking-tight text-foreground">{matchPercent}%</span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">Match</span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/tools/${tool.slug}`}
              className="focus-ring rounded text-lg font-semibold text-foreground hover:text-accent"
            >
              {tool.name}
            </Link>
            <p className="text-sm text-muted">{tool.tagline}</p>
          </div>
          {selectable && (
            <button
              type="button"
              onClick={() => onToggleSelect?.(tool.slug)}
              aria-pressed={selected}
              aria-label={selected ? `Remove ${tool.name} from comparison` : `Add ${tool.name} to comparison`}
              className={cn(
                "focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors",
                selected
                  ? "border-accent bg-accent text-white"
                  : "border-border-strong bg-surface text-transparent hover:border-accent"
              )}
            >
              <Check size={14} strokeWidth={3} />
            </button>
          )}
        </div>

        {bestFor && (
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">{bestFor}</p>
        )}

        {reasons.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Why this matches</p>
            <ul className="mt-1.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-1.5 text-sm text-foreground/80">
                  <Check size={14} className="mt-0.5 shrink-0 text-success" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <PricingBadge model={tool.pricing.model} />
          {tool.freePlan && <span className="text-xs font-medium text-success">Free plan available</span>}
          <Link
            href={`/tools/${tool.slug}`}
            className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
          >
            View details
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
