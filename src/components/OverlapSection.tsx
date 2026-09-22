import { CheckCircle2 } from "lucide-react";
import type { OverlapItem } from "@/lib/comparisonNarrative";

/**
 * Section D: where the compared tools genuinely agree, so the "where they
 * differ" section below doesn't read as more divergent than the tools
 * actually are — every item requires real matching evidence on all sides
 * (never "unknown"/"notAvailable" dressed up as agreement).
 */
export default function OverlapSection({ items }: { items: OverlapItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.dimension.id} className="flex items-start gap-2.5 rounded-2xl border border-success/20 bg-success-soft/40 p-4">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              <span aria-hidden="true">{item.dimension.emoji}</span> {item.dimension.label}
            </p>
            <p className="mt-0.5 text-sm text-foreground/70">{item.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
