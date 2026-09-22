import ToolLogo from "./ToolLogo";
import { FIT_LEVEL_LABEL } from "@/lib/comparisonProfile";
import type { FitLevel } from "@/lib/comparisonProfile";
import type { KeyDifference } from "@/lib/comparisonIntelligence";
import { cn } from "@/lib/utils";
import type { Tool } from "@/data/types";

const LEVEL_STYLE: Record<FitLevel, string> = {
  strong: "bg-success-soft text-success",
  good: "bg-accent-soft text-accent",
  basic: "bg-stone-100 text-stone-600",
  limited: "bg-warning-soft text-warning",
  notAvailable: "bg-stone-100 text-stone-500",
  unknown: "bg-stone-50 text-stone-400",
};

/**
 * "How these tools fit your needs" — one compact card per decision-relevant
 * dimension (not a giant feature table), each tool's real evidence-backed
 * level shown as a label pill, plus a plain-language "why it matters" line.
 * Ties are stated honestly ("Both are strong fits here") rather than
 * manufacturing a difference that isn't in the data.
 */
export default function DimensionFitCards({ tools, rows }: { tools: Tool[]; rows: KeyDifference[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.dimension.id} className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">{row.dimension.emoji}</span>
            <p className="text-sm font-semibold text-foreground">{row.dimension.label}</p>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {row.lines.map((line) => (
              <div key={line.tool.slug} className="flex items-start gap-2.5">
                <ToolLogo name={line.tool.name} category={line.tool.category} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{line.tool.name}</p>
                  <span
                    className={cn(
                      "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      LEVEL_STYLE[line.level]
                    )}
                  >
                    {FIT_LEVEL_LABEL[line.level]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-muted">
            {row.isTie ? `Both are ${tools.length > 2 ? "" : "strong "}fits here. ` : ""}
            {row.dimension.whyItMatters}
          </p>
        </div>
      ))}
    </div>
  );
}
