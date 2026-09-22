import ToolLogo from "./ToolLogo";
import PricingBadge from "./PricingBadge";
import type { PricingRow } from "@/lib/comparisonIntelligence";

/**
 * Pricing as its own decision-relevant section, directly from each tool's
 * real pricing fields — never a hardcoded or invented figure. lastVerified
 * shows "Pricing not verified" rather than a fabricated date whenever the
 * tool record doesn't have one on file.
 */
export default function PricingComparisonSection({ rows }: { rows: PricingRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <div key={row.tool.slug} className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2.5">
            <ToolLogo name={row.tool.name} category={row.tool.category} size="sm" />
            <span className="font-semibold text-foreground">{row.tool.name}</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <PricingBadge model={row.model} />
            {row.paidPlan && <span className="text-xs text-muted">{row.paidPlan} plan</span>}
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight text-foreground">
            {row.startingPrice ?? "Pricing not verified"}
          </p>
          <p className="mt-1 text-xs font-medium text-success">
            {row.freePlan ? "Free plan available" : "No free plan"}
          </p>
          <p className="mt-2 text-[11px] text-muted">
            {row.lastVerified ? `Last verified ${row.lastVerified}` : "Pricing not verified"}
          </p>
        </div>
      ))}
    </div>
  );
}
