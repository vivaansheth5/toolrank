"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import ToolCard from "@/components/ToolCard";
import EmptyState from "@/components/EmptyState";
import { cn, AUDIENCE_LABELS } from "@/lib/utils";
import { useCurrency } from "@/components/CurrencyProvider";
import { getPriceTierLabel } from "@/lib/currency";
import { tools } from "@/data/tools";
import { categories } from "@/data/categories";
import type { Audience, CategorySlug, PriceTier, PricingModel, ToolType } from "@/data/types";

type SortKey = "recommended" | "popular" | "rating" | "newest";

const TYPE_OPTIONS: ToolType[] = ["AI", "Software"];
const PRICING_MODEL_OPTIONS: PricingModel[] = ["Free", "Paid", "Freemium"];
const PRICE_TIER_OPTIONS: PriceTier[] = ["free", "under-500", "500-1000", "1000-plus"];
const AUDIENCE_OPTIONS: Audience[] = ["students", "creators", "developers", "freelancers", "businesses"];

const SORT_LABELS: Record<SortKey, string> = {
  recommended: "Recommended",
  popular: "Most popular",
  rating: "Highest rated",
  newest: "Newest",
};

function toggle<T>(set: T[], value: T): T[] {
  return set.includes(value) ? set.filter((v) => v !== value) : [...set, value];
}

export default function ExploreClient({
  initialCategory,
}: {
  initialCategory?: CategorySlug;
}) {
  const [category, setCategory] = useState<CategorySlug | "all">(initialCategory ?? "all");
  const [types, setTypes] = useState<ToolType[]>([]);
  const [pricingModels, setPricingModels] = useState<PricingModel[]>([]);
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { currency } = useCurrency();

  const filtered = useMemo(() => {
    let list = tools.filter((tool) => {
      if (category !== "all" && tool.category !== category) return false;
      if (types.length && !types.includes(tool.type)) return false;
      if (pricingModels.length && !pricingModels.includes(tool.pricing.model)) return false;
      if (priceTiers.length && !priceTiers.includes(tool.pricing.tier)) return false;
      if (audiences.length && !tool.targetAudience.some((a) => audiences.includes(a))) return false;
      return true;
    });

    switch (sort) {
      case "popular":
        list = [...list].sort((a, b) => b.popularity - a.popularity);
        break;
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list = [...list].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        list = [...list].sort((a, b) => b.rating * b.popularity - a.rating * a.popularity);
    }

    return list;
  }, [category, types, pricingModels, priceTiers, audiences, sort]);

  const activeFilterCount =
    types.length + pricingModels.length + priceTiers.length + audiences.length + (category !== "all" ? 1 : 0);

  function clearAll() {
    setCategory("all");
    setTypes([]);
    setPricingModels([]);
    setPriceTiers([]);
    setAudiences([]);
  }

  const filterPanel = (
    <div className="space-y-7">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Category</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={cn(
              "focus-ring rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              category === "all"
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-muted hover:border-border-strong hover:text-foreground"
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={cn(
                "focus-ring rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                category === c.slug
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-muted hover:border-border-strong hover:text-foreground"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Type &amp; pricing model</h3>
        <div className="mt-3 flex flex-col gap-2">
          {TYPE_OPTIONS.map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={types.includes(t)}
                onChange={() => setTypes((prev) => toggle(prev, t))}
                className="h-4 w-4 rounded border-border-strong text-accent focus:ring-accent"
              />
              {t}
            </label>
          ))}
          {PRICING_MODEL_OPTIONS.map((m) => (
            <label key={m} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={pricingModels.includes(m)}
                onChange={() => setPricingModels((prev) => toggle(prev, m))}
                className="h-4 w-4 rounded border-border-strong text-accent focus:ring-accent"
              />
              {m}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Price</h3>
        <div className="mt-3 flex flex-col gap-2">
          {PRICE_TIER_OPTIONS.map((tier) => (
            <label key={tier} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={priceTiers.includes(tier)}
                onChange={() => setPriceTiers((prev) => toggle(prev, tier))}
                className="h-4 w-4 rounded border-border-strong text-accent focus:ring-accent"
              />
              {getPriceTierLabel(tier, currency)}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Audience</h3>
        <div className="mt-3 flex flex-col gap-2">
          {AUDIENCE_OPTIONS.map((a) => (
            <label key={a} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={audiences.includes(a)}
                onChange={() => setAudiences((prev) => toggle(prev, a))}
                className="h-4 w-4 rounded border-border-strong text-accent focus:ring-accent"
              />
              {AUDIENCE_LABELS[a]}
            </label>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="focus-ring text-sm font-medium text-accent hover:text-accent-hover"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Explore AI &amp; Software
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Browse the full ToolDhundho.com catalog and filter down to exactly what fits your workflow, budget and team.
      </p>

      <div className="mt-6">
        <SearchBar variant="hero" placeholder="What are you trying to do?" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{filterPanel}</aside>

        <div>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border-strong px-3 py-2 text-sm font-medium text-foreground lg:hidden"
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <p className="text-sm text-muted">
              {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
            </p>

            <label className="ml-auto flex items-center gap-2 text-sm text-muted">
              <span className="hidden sm:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="focus-ring rounded-lg border border-border-strong bg-surface px-2.5 py-1.5 text-sm text-foreground"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="No tools match those filters"
                description="Try removing a filter or searching a broader keyword."
                action={
                  <button
                    type="button"
                    onClick={clearAll}
                    className="focus-ring rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
                  >
                    Clear all filters
                  </button>
                }
              />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-xs overflow-y-auto bg-surface p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Filters</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="focus-ring flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-stone-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5">{filterPanel}</div>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="focus-ring mt-6 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
