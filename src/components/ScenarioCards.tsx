import ToolLogo from "./ToolLogo";
import { FIT_LEVEL_LABEL } from "@/lib/comparisonProfile";
import type { FitLevel } from "@/lib/comparisonProfile";
import { cn } from "@/lib/utils";
import type { ScenarioItem } from "@/lib/comparisonNarrative";

const LEVEL_STYLE: Record<FitLevel, string> = {
  strong: "bg-success-soft text-success",
  good: "bg-accent-soft text-accent",
  basic: "bg-stone-100 text-stone-600",
  limited: "bg-warning-soft text-warning",
  notAvailable: "bg-stone-100 text-stone-500",
  unknown: "bg-stone-50 text-stone-400",
};

/**
 * Section H — CRITICAL per spec: compares tools against what the user will
 * actually DO ("Debug a Python assignment"), not an abstract capability
 * label. Category-adaptive because it's driven entirely by
 * lib/comparisonNarrative's buildScenarios, which only ever surfaces real
 * dimensions that apply to these specific tools.
 */
export default function ScenarioCards({ scenarios }: { scenarios: ScenarioItem[] }) {
  if (scenarios.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {scenarios.map((s) => (
        <div key={s.dimension.id} className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-foreground">
            <span aria-hidden="true">{s.dimension.emoji}</span> {s.scenario}
          </p>
          <div className="mt-3 space-y-2.5">
            {s.lines.map((line) => (
              <div key={line.tool.slug} className="flex items-start gap-2.5">
                <ToolLogo name={line.tool.name} category={line.tool.category} size="sm" />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    {line.tool.name}
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", LEVEL_STYLE[line.level])}>
                      {FIT_LEVEL_LABEL[line.level]}
                    </span>
                  </p>
                  <p className="text-xs text-muted">{line.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
