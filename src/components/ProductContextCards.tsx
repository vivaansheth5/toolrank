import { AlertTriangle } from "lucide-react";
import ToolLogo, { CATEGORY_RING } from "./ToolLogo";
import type { ProductContextEntry, DifferentTypeCallout } from "@/lib/comparisonNarrative";

/**
 * Section B: "what it is" per tool, using only the tool's own real
 * tagline/description — plus an honest callout when the compared tools
 * aren't actually the same kind of product, so the rest of the page never
 * pretends two different categories of tool are directly interchangeable.
 */
export default function ProductContextCards({
  entries,
  differentTypes,
}: {
  entries: ProductContextEntry[];
  differentTypes: DifferentTypeCallout;
}) {
  if (entries.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(({ tool, categoryLabel, whatItIs, aliasNote }) => (
          <div key={tool.slug} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2.5">
              <ToolLogo
                name={tool.name}
                category={tool.category}
                size="sm"
                className={`h-8 w-8 text-[11px] ring-2 ${CATEGORY_RING[tool.category]}`}
              />
              <div>
                <p className="font-semibold text-foreground">{tool.name}</p>
                <p className="text-xs text-muted">
                  {categoryLabel} &middot; {tool.subcategory}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground/80">{whatItIs}</p>
            {aliasNote && (
              <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-xs text-muted">{aliasNote}</p>
            )}
          </div>
        ))}
      </div>

      {differentTypes.show && differentTypes.text && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
          <p className="text-sm text-foreground/80">{differentTypes.text}</p>
        </div>
      )}
    </div>
  );
}
