import ToolLogo from "./ToolLogo";
import type { NeedComparisonRow } from "@/lib/needCompare";
import type { Tool } from "@/data/types";

const FIT_ICON: Record<"strong" | "partial" | "none", string> = {
  strong: "✅",
  partial: "🟡",
  none: "❌",
};

export default function NeedComparisonTable({ tools, rows }: { tools: Tool[]; rows: NeedComparisonRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
              Your need
            </th>
            {tools.map((tool) => (
              <th key={tool.id} scope="col" className="px-4 py-3 text-left">
                <div className="flex items-center gap-2">
                  <ToolLogo name={tool.name} category={tool.category} size="sm" />
                  <span className="font-semibold text-foreground">{tool.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.chip.id} className="border-b border-border last:border-b-0">
              <th scope="row" className="px-4 py-3 text-left text-sm font-medium text-foreground">
                <span aria-hidden="true">{row.chip.emoji}</span> {row.chip.label}
              </th>
              {row.cells.map((cell) => (
                <td key={cell.tool.id} className="px-4 py-3 text-foreground/80">
                  <span aria-hidden="true">{FIT_ICON[cell.fit]}</span>{" "}
                  {cell.fit === "strong" ? "Yes" : cell.fit === "partial" ? "Partly" : "Not a focus"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
