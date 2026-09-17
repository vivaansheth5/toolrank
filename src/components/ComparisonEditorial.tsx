import Link from "next/link";
import { Check, X } from "lucide-react";
import ToolLogo, { CATEGORY_STRIP } from "./ToolLogo";
import { buildComparisonEditorial } from "@/lib/comparisonContent";
import { getCategory } from "@/data/categories";
import { getRelatedFeaturedComparisons, type FeaturedComparison } from "@/data/featuredComparisons";
import type { Tool } from "@/data/types";

export default function ComparisonEditorial({ tools }: { tools: Tool[] }) {
  const content = buildComparisonEditorial(tools);
  if (!content) return null;

  const categories = Array.from(
    new Map(tools.map((t) => [t.category, getCategory(t.category)])).values()
  ).filter((c): c is NonNullable<typeof c> => Boolean(c));

  const currentSlugs = new Set(tools.map((t) => t.slug));
  const isCurrentPair = (c: FeaturedComparison) =>
    c.tools.length === currentSlugs.size && c.tools.every((t) => currentSlugs.has(t.slug));

  const relatedComparisons = Array.from(
    new Map(
      tools
        .flatMap((t) => getRelatedFeaturedComparisons(t.slug, 4))
        .filter((c) => !isCurrentPair(c))
        .map((c) => [c.slug, c])
    ).values()
  ).slice(0, 4);

  return (
    <section className="mt-14">
      <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
        <span className="h-1.5 w-1.5 rounded-full bg-accent-warm" aria-hidden="true" />
        In depth
      </p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">{content.title}</h2>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-foreground">Quick verdict</h3>
        <p className="mt-2 leading-relaxed text-foreground/80">{content.quickVerdict}</p>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground">Key differences</h3>
        <ul className="mt-2 space-y-2">
          {content.keyDifferences.map((diff, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {diff}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {content.bestFor.map(({ tool, text }) => {
          return (
            <div key={tool.slug} className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className={`h-1 ${CATEGORY_STRIP[tool.category]}`} />
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <ToolLogo name={tool.name} category={tool.category} size="sm" />
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="focus-ring rounded text-sm font-semibold text-foreground hover:text-accent"
                  >
                    {tool.name}
                  </Link>
                </div>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted">Best for</p>
                <p className="mt-1 text-sm text-foreground/80">{text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Pricing overview</h3>
          <ul className="mt-2 space-y-2">
            {content.pricingOverview.map(({ tool, text }) => (
              <li key={tool.slug} className="text-sm text-foreground/80">
                <span className="font-medium text-foreground">{tool.name}:</span> {text}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Ease of use</h3>
          <ul className="mt-2 space-y-2">
            {content.easeOfUse.map(({ tool, text }) => (
              <li key={tool.slug} className="text-sm text-foreground/80">
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Main strengths</h3>
          <div className="mt-2 space-y-3">
            {content.strengths.map(({ tool, items }) => (
              <div key={tool.slug}>
                <p className="text-sm font-medium text-foreground">{tool.name}</p>
                <ul className="mt-1 space-y-1">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-sm text-foreground/80">
                      <Check size={14} className="mt-0.5 shrink-0 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Main limitations</h3>
          <div className="mt-2 space-y-3">
            {content.limitations.map(({ tool, items }) => (
              <div key={tool.slug}>
                <p className="text-sm font-medium text-foreground">{tool.name}</p>
                <ul className="mt-1 space-y-1">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-sm text-foreground/80">
                      <X size={14} className="mt-0.5 shrink-0 text-muted" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground">Who should choose each</h3>
        <ul className="mt-2 space-y-2">
          {content.whoShouldChoose.map(({ tool, text }) => (
            <li key={tool.slug} className="text-sm text-foreground/80">
              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6 text-sm">
        <span className="text-muted">Keep exploring:</span>
        <Link href="/explore" className="focus-ring rounded-full border border-border px-3 py-1.5 text-foreground/80 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-sm">
          Explore all tools
        </Link>
        <Link href="/find-my-tool" className="focus-ring rounded-full border border-border px-3 py-1.5 text-foreground/80 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-sm">
          Find My Tool
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="focus-ring rounded-full border border-border px-3 py-1.5 text-foreground/80 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-sm"
          >
            {c.name} tools
          </Link>
        ))}
      </div>

      {relatedComparisons.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Other comparisons:</span>
          {relatedComparisons.map((c) => (
            <Link
              key={c.slug}
              href={c.href}
              className="focus-ring rounded-full border border-border px-3 py-1.5 text-foreground/80 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-sm"
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
