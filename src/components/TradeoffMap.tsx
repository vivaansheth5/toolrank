import ToolLogo from "./ToolLogo";
import type { TradeoffRow } from "@/lib/comparisonNarrative";

/**
 * Section I: "choose based on what you'll do most" — one row per priority
 * where a compared tool has a genuine, non-tied lead. Deliberately framed
 * as "IF YOUR PRIORITY IS X" rather than a ranked list — never a single
 * declared winner.
 */
export default function TradeoffMap({ rows }: { rows: TradeoffRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      {rows.map((row, i) => (
        <div
          key={row.dimension.id}
          className={`flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
            i > 0 ? "border-t border-border" : ""
          } ${i % 2 === 0 ? "bg-surface" : "bg-stone-50/50"}`}
        >
          <p className="text-sm text-foreground/80">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">If your priority is</span>{" "}
            <span className="font-semibold text-foreground">{row.dimension.label}</span>
          </p>
          <div className="flex items-center gap-2.5">
            <ToolLogo name={row.favoredTool.name} category={row.favoredTool.category} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{row.favoredTool.name} has the edge</p>
              <p className="text-xs text-muted">{row.reason}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
