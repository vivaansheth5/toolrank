"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import ComparisonTable from "@/components/ComparisonTable";
import ToolCard from "@/components/ToolCard";
import ToolLogo from "@/components/ToolLogo";
import EmptyState from "@/components/EmptyState";
import { tools } from "@/data/tools";

const MAX_COMPARE = 3;

export default function CompareClient({ initialSlugs = [] }: { initialSlugs?: string[] }) {
  const [selected, setSelected] = useState<string[]>(initialSlugs.slice(0, MAX_COMPARE));
  const [query, setQuery] = useState("");

  const selectedTools = selected
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is (typeof tools)[number] => Boolean(t));

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Compare tools before you choose.
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Pick up to {MAX_COMPARE} tools to see pricing, ratings and features side by side.
      </p>

      {selectedTools.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {selectedTools.map((tool) => (
            <span
              key={tool.slug}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1.5 pr-2.5 text-sm text-foreground"
            >
              <ToolLogo name={tool.name} category={tool.category} size="sm" className="h-6 w-6 text-[10px]" />
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

      {selectedTools.length >= 2 && (
        <div className="mt-8">
          <ComparisonTable tools={selectedTools} />
        </div>
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
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools to add..."
            className="focus-ring w-full max-w-xs rounded-lg border border-border-strong bg-surface px-3.5 py-2 text-sm text-foreground placeholder:text-muted"
          />
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
