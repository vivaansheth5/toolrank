"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Flame, Search, X } from "lucide-react";
import ComparisonTable from "@/components/ComparisonTable";
import ToolCard from "@/components/ToolCard";
import ToolLogo, { CATEGORY_RING } from "@/components/ToolLogo";
import EmptyState from "@/components/EmptyState";
import OfferCard from "@/components/OfferCard";
import VerdictCard from "@/components/VerdictCard";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import ComparisonEditorial from "@/components/ComparisonEditorial";
import ComparisonFAQ from "@/components/ComparisonFAQ";
import RequirementChip from "@/components/RequirementChip";
import NeedFitCard from "@/components/NeedFitCard";
import NeedComparisonTable from "@/components/NeedComparisonTable";
import GetVsMissCard from "@/components/GetVsMissCard";
import AskAboutNeeds from "@/components/AskAboutNeeds";
import { tools } from "@/data/tools";
import { getBestDealForTool } from "@/data/deals";
import { getFeaturedComparisons } from "@/data/featuredComparisons";
import { getCompareVerdicts } from "@/lib/verdict";
import { buildComparisonEditorial } from "@/lib/comparisonContent";
import { parseNeed } from "@/lib/needSignals";
import { getMatchPercent } from "@/lib/needMatch";
import { compareAgainstNeeds, getWhatYouGetAndMiss, getNeedBasedVerdict, summarizeFit } from "@/lib/needCompare";
import type { ExperienceLevel, PriceTier, Strength } from "@/data/types";

const MAX_COMPARE = 3;
const VALID_EXPERIENCE: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];
const VALID_BUDGET: PriceTier[] = ["free", "under-500", "500-1000", "1000-plus"];
const VALID_PRIORITY: Strength[] = ["ease-of-use", "quality", "price", "features", "speed"];

export default function CompareClient({
  initialSlugs = [],
  initialNeed = "",
  initialExperience = "",
  initialBudget = "",
  initialPriority = "",
}: {
  initialSlugs?: string[];
  initialNeed?: string;
  initialExperience?: string;
  initialBudget?: string;
  initialPriority?: string;
}) {
  const [selected, setSelected] = useState<string[]>(initialSlugs.slice(0, MAX_COMPARE));
  const [query, setQuery] = useState("");
  const [detailedOpen, setDetailedOpen] = useState(false);

  const selectedTools = selected
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is (typeof tools)[number] => Boolean(t));

  const parsedNeed = useMemo(() => {
    if (!initialNeed.trim()) return null;
    const experience = VALID_EXPERIENCE.includes(initialExperience as ExperienceLevel)
      ? (initialExperience as ExperienceLevel)
      : undefined;
    const budget = VALID_BUDGET.includes(initialBudget as PriceTier) ? (initialBudget as PriceTier) : undefined;
    const priority = VALID_PRIORITY.includes(initialPriority as Strength) ? (initialPriority as Strength) : undefined;
    return parseNeed(initialNeed, { experience, budget, priority });
  }, [initialNeed, initialExperience, initialBudget, initialPriority]);

  const matchPercents = useMemo(() => {
    if (!parsedNeed) return {};
    const entries = selectedTools.map((t) => [t.slug, getMatchPercent(t, parsedNeed)] as const);
    return Object.fromEntries(entries);
  }, [parsedNeed, selectedTools]);

  const fitSummaries = useMemo(
    () =>
      parsedNeed ? selectedTools.map((t) => summarizeFit(t, matchPercents[t.slug] ?? 0, parsedNeed)) : [],
    [parsedNeed, selectedTools, matchPercents]
  );

  const needComparisonRows = useMemo(
    () => (parsedNeed && selectedTools.length >= 2 ? compareAgainstNeeds(selectedTools, parsedNeed) : []),
    [parsedNeed, selectedTools]
  );

  const getVsMiss = useMemo(
    () => (parsedNeed ? selectedTools.map((t) => getWhatYouGetAndMiss(t, parsedNeed)) : []),
    [parsedNeed, selectedTools]
  );

  const needVerdicts = useMemo(
    () => (parsedNeed && selectedTools.length >= 2 ? getNeedBasedVerdict(selectedTools, parsedNeed, matchPercents) : []),
    [parsedNeed, selectedTools, matchPercents]
  );

  const pickerTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? tools.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.toLowerCase().includes(q))
        )
      : tools;
    return [...base].sort((a, b) => b.popularity - a.popularity).slice(0, 12);
  }, [query]);

  function toggle(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, slug];
    });
  }

  const editorial = selectedTools.length >= 2 ? buildComparisonEditorial(selectedTools) : null;
  const featuredComparisons = getFeaturedComparisons();

  const displayedVerdicts = parsedNeed
    ? needVerdicts.map((v, i) => ({ tool: v.tool, label: i === 0 ? "Top pick for your need" : "Alternative", reason: v.reason }))
    : getCompareVerdicts(selectedTools);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-mesh px-6 py-10 sm:px-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Compare tools <span className="text-gradient-brand">before you choose.</span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Pick up to {MAX_COMPARE} tools to see pricing, ratings and features side by side.
        </p>

        {selectedTools.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {selectedTools.map((tool) => (
              <span
                key={tool.slug}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1.5 pr-2.5 text-sm text-foreground shadow-sm"
              >
                <ToolLogo
                  name={tool.name}
                  category={tool.category}
                  size="sm"
                  className={`h-6 w-6 text-[10px] ring-2 ${CATEGORY_RING[tool.category]}`}
                />
                {tool.name}
                <button
                  type="button"
                  onClick={() => toggle(tool.slug)}
                  className="focus-ring text-muted hover:text-foreground"
                  aria-label={`Remove ${tool.name} from comparison`}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {parsedNeed && (
          <div className="mt-6 rounded-2xl border border-accent/20 bg-surface/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">Compare based on YOUR needs</p>
            <p className="mt-1 text-sm text-foreground/70">&ldquo;{parsedNeed.rawText}&rdquo;</p>
            {parsedNeed.chips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {parsedNeed.chips.map((chip) => (
                  <RequirementChip key={chip.id} emoji={chip.emoji} label={chip.label} active size="sm" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {parsedNeed && selectedTools.length >= 2 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight text-foreground">How these tools fit your needs</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fitSummaries.map((fit) => (
              <NeedFitCard key={fit.tool.slug} fit={fit} />
            ))}
          </div>
        </section>
      )}

      {parsedNeed && needComparisonRows.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Based on what you need</h2>
          <div className="mt-4">
            <NeedComparisonTable tools={selectedTools} rows={needComparisonRows} />
          </div>
        </section>
      )}

      {parsedNeed && getVsMiss.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight text-foreground">What you get, what you might miss</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {getVsMiss.map((data) => (
              <GetVsMissCard key={data.tool.slug} data={data} />
            ))}
          </div>
        </section>
      )}

      {selectedTools.length >= 2 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Which one should you choose?
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedVerdicts.map((verdict) => (
              <VerdictCard key={verdict.tool.slug} verdict={verdict} />
            ))}
          </div>
        </section>
      )}

      {selectedTools.length >= 2 && (
        <section className="mt-10">
          <AskAboutNeeds tools={selectedTools} />
        </section>
      )}

      {selectedTools.length >= 2 && (
        <section className="mt-10">
          <button
            type="button"
            onClick={() => setDetailedOpen((o) => !o)}
            className="focus-ring flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-surface px-5 py-4 text-left transition-colors hover:bg-stone-50"
            aria-expanded={detailedOpen}
          >
            <span>
              <span className="font-semibold text-foreground">See detailed comparison</span>
              <span className="ml-2 text-sm text-muted">Full pricing, features and pros/cons table</span>
            </span>
            <ChevronDown size={18} className={`shrink-0 text-muted transition-transform ${detailedOpen ? "rotate-180" : ""}`} />
          </button>
          {detailedOpen && (
            <div className="mt-4">
              <ComparisonTable tools={selectedTools} />
            </div>
          )}
        </section>
      )}

      {selectedTools.length >= 2 && (
        <section
          className="mt-12 rounded-3xl border border-border px-5 py-8 sm:px-8"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--accent-warm-soft) 0%, var(--accent-soft) 100%)",
          }}
        >
          <h2 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-warm text-white shadow-glow-warm">
              <Flame size={18} />
            </span>
            Best Offers &amp; Deals
          </h2>
          <p className="mt-1.5 text-sm text-foreground/70">
            The best available offer for each tool you&apos;re comparing.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {selectedTools.map((tool) => (
              <OfferCard
                key={tool.slug}
                tool={tool}
                deal={getBestDealForTool(tool.id)}
                placement="compare_offer"
              />
            ))}
          </div>

          <div className="mt-5 space-y-1">
            <p className="text-xs text-foreground/60">
              Offers and pricing may change. Always confirm current terms on the provider&apos;s website.
            </p>
            <AffiliateDisclosure className="text-foreground/60" />
          </div>
        </section>
      )}

      {selectedTools.length >= 2 && <ComparisonEditorial tools={selectedTools} />}

      {editorial && <ComparisonFAQ faqs={editorial.faqs} />}

      {selectedTools.length < 2 && featuredComparisons.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="text-lg font-semibold text-foreground">Popular comparisons</h2>
          <p className="mt-1 text-sm text-muted">Jump straight into a comparison people look up often.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {featuredComparisons.map((c) => (
              <Link
                key={c.slug}
                href={c.href}
                className="focus-ring rounded-full border border-border bg-surface px-3.5 py-2 text-sm text-foreground/80 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-sm"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold text-foreground">
            {selectedTools.length === 0
              ? "Pick at least 2 tools to compare"
              : selectedTools.length === MAX_COMPARE
              ? "Maximum reached — remove one to add another"
              : "Add another tool"}
          </h2>
          <div className="relative w-full max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools to add..."
              className="focus-ring w-full rounded-lg border border-border-strong bg-surface py-2 pl-9 pr-3.5 text-sm text-foreground placeholder:text-muted"
            />
          </div>
        </div>

        {selectedTools.length === 0 && selectedTools.length < 2 && (
          <div className="mt-4">
            <EmptyState
              title="Nothing selected yet"
              description="Select tools from the list below to start comparing them side by side."
            />
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pickerTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              selectable
              selected={selected.includes(tool.slug)}
              onToggleSelect={toggle}
              disabledSelect={selected.length >= MAX_COMPARE}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
