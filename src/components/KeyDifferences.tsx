import { FIT_LEVEL_LABEL } from "@/lib/comparisonProfile";
import type { KeyDifference } from "@/lib/comparisonIntelligence";

/**
 * "Key differences" — 3-5 dimensions where the tools' real evidence
 * genuinely diverges, framed as "### For X" per the spec, never a
 * manufactured gap: a tie among the shown dimensions is stated plainly.
 */
export default function KeyDifferences({ differences }: { differences: KeyDifference[] }) {
  if (differences.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {differences.map((diff) => (
        <div key={diff.dimension.id} className="rounded-2xl border border-border bg-surface p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <span aria-hidden="true">{diff.dimension.emoji}</span>
            For {diff.dimension.label.toLowerCase()}
          </p>
          {diff.isTie ? (
            <p className="mt-1.5 text-sm text-muted">Both are strong fits here — no meaningful gap in the data.</p>
          ) : (
            <ul className="mt-1.5 space-y-1">
              {diff.lines.map((line) => (
                <li key={line.tool.slug} className="text-sm text-foreground/80">
                  <span className="font-medium text-foreground">{line.tool.name}</span>{" "}
                  <span className="text-muted">({FIT_LEVEL_LABEL[line.level]})</span> — {line.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
