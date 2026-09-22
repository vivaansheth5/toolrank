import { Zap } from "lucide-react";
import ToolLogo from "./ToolLogo";
import type { QuickTakeRow } from "@/lib/comparisonIntelligence";

/**
 * Compact "Quick take" so a reader can understand the tradeoff without
 * reading the whole page — each row is one dimension where the evidence
 * genuinely favors one tool, never a coin-flip dressed up as a pick.
 */
export default function QuickTake({ rows }: { rows: QuickTakeRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="rounded-2xl border border-accent/20 bg-accent-soft/40 p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Zap size={15} className="text-accent" />
        Quick take
      </h3>
      <ul className="mt-3 space-y-2.5">
        {rows.map((row) => (
          <li key={row.dimension.id} className="flex items-start gap-2.5 text-sm">
            <ToolLogo name={row.betterTool.name} category={row.betterTool.category} size="sm" />
            <p className="text-foreground/80">
              If <span className="font-medium text-foreground">{row.dimension.label.toLowerCase()}</span> is your
              priority, <span className="font-medium text-foreground">{row.betterTool.name}</span> has the edge —{" "}
              {row.reason}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
