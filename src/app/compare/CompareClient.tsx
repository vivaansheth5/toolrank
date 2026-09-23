"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Flame, Search, X } from "lucide-react";
import ComparisonTable from "@/components/ComparisonTable";
import ToolCard from "@/components/ToolCard";
import ToolLogo, { CATEGORY_RING } from "@/components/ToolLogo";
import EmptyState from "@/components/EmptyState";
import OfferCard from "@/components/OfferCard";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import ComparisonEditorial from "@/components/ComparisonEditorial";
import ComparisonFAQ from "@/components/ComparisonFAQ";
import RequirementChip from "@/components/RequirementChip";
import ProductContextCards from "@/components/ProductContextCards";
import QuickTakeParagraph from "@/components/QuickTakeParagraph";
import OverlapSection from "@/components/OverlapSection";
import DifferenceCards from "@/components/DifferenceCards";
import ScenarioCards from "@/components/ScenarioCards";
import TradeoffMap from "@/components/TradeoffMap";
import PricingComparisonSection from "@/components/PricingComparisonSection";
import GetVsMissCard from "@/components/GetVsMissCard";
import AskAboutNeeds from "@/components/AskAboutNeeds";
import { tools } from "@/data/tools";
import { getBestDealForTool } from "@/data/deals";
import { getFeaturedComparisons } from "@/data/featuredComparisons";
import { buildComparisonEditorial } from "@/lib/comparisonContent";
import { parseNeed, refineParsedNeed } from "@/lib/needSignals";
import type { NeedRefinements } from "@/lib/needSignals";
import {
  buildProductContext,
  detectFundamentallyDifferentTypes,
  buildQuickTakeParagraph,
  buildOverlapSection,
  buildDifferencesSection,
  buildGetMissWithWhy,
  buildScenarios,
  buildTradeoffMap,
  buildPricingComparison,
} from "@/lib/comparisonNarrative";
import { detectComparisonIntent } from "@/lib/comparisonIntent";
import { EXPERIENCE_LABELS, STRENGTH_LABELS } from "@/lib/utils";
import { useCurrency } from "@/components/CurrencyProvider";
import { getPriceTierLabel } from "@/lib/currency";
import type { ExperienceLevel, PriceTier, Strength } from "@/data/types";

const MAX_COMPARE = 3;
const VALID_EXPERIENCE: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];
const VALID_BUDGET: PriceTier[] = ["free", "under-500", "500-1000", "1000-plus"];
const VALID_PRIORITY: Strength[] = ["ease-of-use", "quality", "price", "features", "speed"];
const BUDGET_OPTIONS: PriceTier[] = ["free", "under-500", "500-1000", "1000-plus"];
const EXPERIENCE_OPTIONS: ExperienceLevel[] = ["beginner", "intermediate", "advanced"];
const PRIORITY_OPTIONS: Strength[] = ["ease-of-use", "features", "price", "quality", "speed"];

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
  const { currency } = useCurrency();
  const [selected, setSelected] = useState<string[]>(initialSlugs.slice(0, MAX_COMPARE));
  const [query, setQuery] = useState("");
  const [detailedOpen, setDetailedOpen] = useState(false);
  const [excludedChipIds, setExcludedChipIds] = useState<Set<string>>(new Set());
  const [refinements, setRefinements] = useState<NeedRefinements>(() => ({
    experience: VALID_EXPERIENCE.includes(initialExperience as ExperienceLevel)
      ? (initialExperience as ExperienceLevel)
      : undefined,
    budget: VALID_BUDGET.includes(initialBudget as PriceTier) ? (initialBudget as PriceTier) : undefined,
    priority: VALID_PRIORITY.includes(initialPriority as Strength) ? (initialPriority as Strength) : undefined,
  }));

  const selectedTools = selected
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is (typeof tools)[number] => Boolean(t));

  // Exact-tool-comparison intent: did the user's own text explicitly name
  // 2+ known tools and ask to compare them (e.g. "ChatGPT Plus vs Claude
  // Code")? Re-derived from initialNeed rather than passed through the URL
  // so this page works the same whether it was reached via the intent
  // router in DiscoverClient or a direct /compare?tools=...&need=... link.
  const comparisonIntent = useMemo(
    () => (initialNeed.trim() ? detectComparisonIntent(initialNeed) : null),
    [initialNeed]
  );
  // Only "exact comparison" while every tool the user actually named is
  // still selected — if they remove one via the × button, this quietly
  // falls back to the ordinary personalized-need compare view below rather
  // than showing a stale "comparing X vs Y" header for a tool no longer on
  // the page.
  const isExactComparison = Boolean(
    comparisonIntent?.isComparisonIntent &&
      comparisonIntent.identifiedTools.length >= 2 &&
      comparisonIntent.identifiedTools.every((m) => selected.includes(m.tool.slug))
  );

  const baseParsedNeed = useMemo(() => (initialNeed.trim() ? parseNeed(initialNeed) : null), [initialNeed]);
  const parsedNeed = useMemo(
    () => (baseParsedNeed ? refineParsedNeed(baseParsedNeed, { excludeChipIds: excludedChipIds, refinements }) : null),
    [baseParsedNeed, excludedChipIds, refinements]
  );

  // V3 decision-support narrative layer (lib/comparisonNarrative.ts):
  // FACTS -> DIFFERENCES -> IMPLICATIONS -> USER-SPECIFIC TRADEOFFS ->
  // DECISION SUPPORT. Every builder here accepts `parsedNeed: ParsedNeed |
  // null` and degrades gracefully to the category's default dimension set
  // when there's no stated need, so a plain multi-tool compare (no typed
  // need text) still gets a real, non-generic comparison.
  const productContext = useMemo(
    () => (selectedTools.length >= 2 ? buildProductContext(selectedTools, comparisonIntent?.identifiedTools) : []),
    [selectedTools, comparisonIntent]
  );
  const differentTypes = useMemo(
    () => detectFundamentallyDifferentTypes(selectedTools),
    [selectedTools]
  );

  const quickTakeText = useMemo(
    () => (selectedTools.length >= 2 ? buildQuickTakeParagraph(selectedTools, parsedNeed) : ""),
    [selectedTools, parsedNeed]
  );

  const overlapItems = useMemo(
    () => (selectedTools.length >= 2 ? buildOverlapSection(selectedTools, parsedNeed) : []),
    [selectedTools, parsedNeed]
  );

  const differenceItems = useMemo(
    () => (selectedTools.length >= 2 ? buildDifferencesSection(selectedTools, parsedNeed) : []),
    [selectedTools, parsedNeed]
  );

  const getMissRows = useMemo(
    () => (selectedTools.length >= 2 ? selectedTools.map((t) => buildGetMissWithWhy(t, selectedTools, parsedNeed)) : []),
    [selectedTools, parsedNeed]
  );

  const scenarioItems = useMemo(
    () => (selectedTools.length >= 2 ? buildScenarios(selectedTools, parsedNeed) : []),
    [selectedTools, parsedNeed]
  );

  const tradeoffRows = useMemo(
    () => (selectedTools.length >= 2 ? buildTradeoffMap(selectedTools, parsedNeed) : []),
    [selectedTools, parsedNeed]
  );

  const pricingRows = useMemo(
    () => (selectedTools.length >= 2 ? buildPricingComparison(selectedTools) : []),
    [selectedTools]
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

  function toggleChip(id: string) {
    setExcludedChipIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setRefinement<K extends keyof NeedRefinements>(key: K, value: NeedRefinements[K]) {
    setRefinements((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  }

  function clearBudget() {
    setRefinements((prev) => ({ ...prev, budget: undefined }));
  }

  const editorial = selectedTools.length >= 2 ? buildComparisonEditorial(selectedTools) : null;
  const featuredComparisons = getFeaturedComparisons();

  // Section J: "Still deciding?" — grounded in THIS comparison's own data,
  // never a redirect back to generic discovery. Available whenever 2+ tools
  // are selected, not only in exact-comparison mode.
  const suggestedQuestions = useMemo(() => {
    if (selectedTools.length < 2) return undefined;
    const [a, b] = selectedTools;
    const qs = [
      `What will I miss if I choose ${a.name}?`,
      `What will I miss if I choose ${b.name}?`,
      "Which is cheaper?",
      "Which is easier for beginners?",
      "Which fits my needs better?",
      "What would change your recommendation?",
    ];
    const topChip = parsedNeed?.chips[0];
    if (topChip) qs.push(`Which fits my ${topChip.label.toLowerCase()} needs better?`);
    return qs.slice(0, 6);
  }, [selectedTools, parsedNeed]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-mesh px-6 py-10 sm:px-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {isExactComparison ? (
            <>Comparing the <span className="text-gradient-brand">tools you selected.</span></>
          ) : (
            <>Compare tools <span className="text-gradient-brand">before you choose.</span></>
          )}
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          {isExactComparison
            ? "You told us exactly which tools you're deciding between — here's how they stack up for what you need."
            : `Pick up to ${MAX_COMPARE} tools to see pricing, ratings and features side by side.`}
        </p>

        {isExactComparison && comparisonIntent ? (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Tools you&apos;re comparing</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              {comparisonIntent.identifiedTools.map((mention, i) => (
                <div key={mention.tool.slug} className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface py-1.5 pl-1.5 pr-3 text-sm font-semibold text-foreground shadow-sm">
                    <ToolLogo
                      name={mention.tool.name}
                      category={mention.tool.category}
                      size="sm"
                      className={`h-7 w-7 text-[10px] ring-2 ${CATEGORY_RING[mention.tool.category]}`}
                    />
                    {mention.displayLabel}
                    <button
                      type="button"
                      onClick={() => toggle(mention.tool.slug)}
                      className="focus-ring text-muted hover:text-foreground"
                      aria-label={`Remove ${mention.displayLabel} from comparison`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                  {i < comparisonIntent.identifiedTools.length - 1 && (
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">vs</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          selectedTools.length > 0 && (
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
          )
        )}

        {parsedNeed && (
          <div className="mt-6 rounded-2xl border border-accent/20 bg-surface/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              {isExactComparison ? "Your needs" : "Compare based on YOUR needs"}
            </p>
            <p className="mt-1 text-sm text-foreground/70">
              {isExactComparison ? "Based on what you told us…" : <>&ldquo;{parsedNeed.rawText}&rdquo;</>}
            </p>
            {baseParsedNeed && baseParsedNeed.chips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {baseParsedNeed.chips.map((chip) => {
                  const excluded = excludedChipIds.has(chip.id);
                  return (
                    <RequirementChip
                      key={chip.id}
                      emoji={chip.emoji}
                      label={chip.label}
                      active={!excluded}
                      removable={!excluded}
                      onRemove={() => toggleChip(chip.id)}
                      onClick={excluded ? () => toggleChip(chip.id) : undefined}
                      size="sm"
                    />
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Budget</span>
                {BUDGET_OPTIONS.map((tier) => (
                  <RequirementChip
                    key={tier}
                    label={getPriceTierLabel(tier, currency)}
                    active={refinements.budget === tier}
                    onClick={() => setRefinement("budget", tier)}
                    size="sm"
                  />
                ))}
                <RequirementChip label="Flexible" active={refinements.budget === undefined} onClick={clearBudget} size="sm" />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Experience</span>
                {EXPERIENCE_OPTIONS.map((level) => (
                  <RequirementChip
                    key={level}
                    label={EXPERIENCE_LABELS[level]}
                    active={refinements.experience === level}
                    onClick={() => setRefinement("experience", level)}
                    size="sm"
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-muted">Priority</span>
                {PRIORITY_OPTIONS.map((priority) => (
                  <RequirementChip
                    key={priority}
                    label={STRENGTH_LABELS[priority]}
                    active={refinements.priority === priority}
                    onClick={() => setRefinement("priority", priority)}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {productContext.length >= 2 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold tracking-tight text-foreground">What are these tools?</h2>
          <div className="mt-4">
            <ProductContextCards entries={productContext} differentTypes={differentTypes} />
          </div>
        </section>
      )}

      {quickTakeText && (
        <section className="mt-10">
          <QuickTakeParagraph text={quickTakeText} />
        </section>
      )}

      {overlapItems.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Where they overlap</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-muted">
            These aren&apos;t likely to be what decides this for you — both hold up well here.
          </p>
          <div className="mt-4">
            <OverlapSection items={overlapItems} />
          </div>
        </section>
      )}

      {differenceItems.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Where they differ</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-muted">
            The facts, what they mean in practice, and whether it&apos;s actually relevant to you.
          </p>
          <div className="mt-4">
            <DifferenceCards differences={differenceItems} />
          </div>
        </section>
      )}

      {getMissRows.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight text-foreground">What you get, what you might miss</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {getMissRows.map((data) => (
              <GetVsMissCard key={data.tool.slug} data={data} />
            ))}
          </div>
        </section>
      )}

      {scenarioItems.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight text-foreground">How they handle what you&apos;ll actually do</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-muted">
            Compared against real tasks, not abstract feature labels.
          </p>
          <div className="mt-4">
            <ScenarioCards scenarios={scenarioItems} />
          </div>
        </section>
      )}

      {tradeoffRows.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Choose based on what you&apos;ll do most</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-muted">
            No universal winner — pick the row that matches what matters most to you.
          </p>
          <div className="mt-4">
            <TradeoffMap rows={tradeoffRows} />
          </div>
        </section>
      )}

      {pricingRows.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Pricing</h2>
          <div className="mt-4">
            <PricingComparisonSection rows={pricingRows} />
          </div>
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

      {selectedTools.length >= 2 && (
        <section className="mt-10">
          <AskAboutNeeds
            tools={selectedTools}
            parsedNeed={parsedNeed}
            suggestedQuestions={suggestedQuestions}
            title="Still deciding?"
          />
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
              <span className="font-semibold text-foreground">Detailed specifications</span>
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
