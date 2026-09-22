import type { DifferenceItem } from "@/lib/comparisonNarrative";

/**
 * Section E — THE MOST IMPORTANT SECTION. Every genuine difference is
 * structured as FACT (verbatim evidence) -> THAT MEANS (the practical
 * implication, grounded in the dimension's own whyItMatters) -> FOR YOU
 * (personalized only when the user's own stated need actually names this
 * dimension). This is the section that turns evidence into a decision,
 * rather than another row of badges.
 */
export default function DifferenceCards({ differences }: { differences: DifferenceItem[] }) {
  if (differences.length === 0) return null;

  return (
    <div className="space-y-4">
      {differences.map((diff) => (
        <div key={diff.dimension.id} className="rounded-2xl border border-border bg-surface p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span aria-hidden="true">{diff.dimension.emoji}</span>
            {diff.dimension.label}
          </p>

          <dl className="mt-3 space-y-3">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted">Fact</dt>
              <dd className="mt-0.5 text-sm text-foreground/80">{diff.fact}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-accent">That means</dt>
              <dd className="mt-0.5 text-sm text-foreground/80">{diff.meansThat}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-accent-warm">For you</dt>
              <dd className="mt-0.5 text-sm text-foreground/80">{diff.forYou}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
