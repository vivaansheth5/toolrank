import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import ToolLogo, { CATEGORY_ACCENT } from "./ToolLogo";
import PricingBadge from "./PricingBadge";
import { getMatchLabel } from "@/lib/needMatch";
import { cn } from "@/lib/utils";
import type { Tool } from "@/data/types";

const LABEL_STYLE: Record<ReturnType<typeof getMatchLabel>, string> = {
  "Strong match": "bg-success-soft text-success",
  "Good match": "bg-accent-soft text-accent",
  "Possible match": "bg-stone-100 text-stone-600",
};

export default function ToolMatchCard({
  tool,
  matchPercent,
  reasons,
  bestFor,
  get,
  miss,
  selectable = false,
  selected = false,
  onToggleSelect,
}: {
  tool: Tool;
  matchPercent: number;
  reasons: string[];
  bestFor?: string;
  get?: string[];
  miss?: string[];
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (slug: string) => void;
}) {
  const accent = CATEGORY_ACCENT[tool.category];
  const label = getMatchLabel(matchPercent);

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
        <span className={cn("whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", LABEL_STYLE[label])}>
          {label}
        </span>
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
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Why this fits</p>
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

        {((get && get.length > 0) || (miss && miss.length > 0)) && (
          <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-border bg-stone-50/60 p-3 sm:grid-cols-2">
            {get && get.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-success">What you get</p>
                <ul className="mt-1.5 space-y-1">
                  {get.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-sm text-foreground/80">
                      <Check size={13} className="mt-0.5 shrink-0 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {miss && miss.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">What you might miss</p>
                <ul className="mt-1.5 space-y-1">
                  {miss.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-sm text-foreground/80">
                      <Minus size={13} className="mt-0.5 shrink-0 text-muted" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
