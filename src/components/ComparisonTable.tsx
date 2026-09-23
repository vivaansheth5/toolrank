"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import ToolLogo, { CATEGORY_COLORS } from "./ToolLogo";
import Rating from "./Rating";
import PricingBadge from "./PricingBadge";
import AffiliateCTA from "./AffiliateCTA";
import { useCurrency } from "./CurrencyProvider";
import { AUDIENCE_LABELS, cn } from "@/lib/utils";
import { getPriceTierLabel } from "@/lib/currency";
import { getCategory } from "@/data/categories";
import { getBestDealForTool } from "@/data/deals";
import { resolveOfferCta } from "@/lib/offers";
import { getDimensionsForCategory } from "@/data/comparisonDimensions";
import { getComparisonProfile, FIT_LEVEL_LABEL, type FitLevel } from "@/lib/comparisonProfile";
import type { Tool } from "@/data/types";

const LEVEL_STYLE: Record<FitLevel, string> = {
  strong: "bg-success-soft text-success",
  good: "bg-accent-soft text-accent",
  basic: "bg-stone-100 text-stone-600",
  limited: "bg-warning-soft text-warning",
  notAvailable: "bg-stone-100 text-stone-500",
  unknown: "bg-stone-50 text-stone-400",
};

function SectionDivider({ label, span }: { label: string; span: number }) {
  return (
    <tr>
      <th
        colSpan={span}
        scope="colgroup"
        className="sticky left-0 bg-stone-50/80 px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-muted"
      >
        {label}
      </th>
    </tr>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <th
        scope="row"
        className="sticky left-0 z-10 w-36 min-w-36 bg-surface px-4 py-4 text-left text-sm font-medium text-muted"
      >
        {label}
      </th>
      {children}
    </tr>
  );
}

export default function ComparisonTable({ tools }: { tools: Tool[] }) {
  const { currency } = useCurrency();
  // Dimension rows only make sense when every compared tool shares a
  // category (the schema is category-aware) — for a rare cross-category
  // comparison the table just falls back to the original generic rows.
  const sameCategory = tools.length > 0 && tools.every((t) => t.category === tools[0].category);
  const dimensions = sameCategory ? getDimensionsForCategory(tools[0].category) : [];
  const profiles = tools.map((t) => getComparisonProfile(t));
  const colSpan = tools.length + 1;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="sticky left-0 z-10 w-36 min-w-36 bg-surface px-4 py-5" />
            {tools.map((tool) => {
              const [softBg] = CATEGORY_COLORS[tool.category].split(" ");
              return (
                <th key={tool.id} scope="col" className="min-w-[220px] p-0 text-left align-top">
                  <div className={`px-4 py-5 ${softBg}`}>
                    <div className="flex items-center gap-3">
                      <ToolLogo name={tool.name} category={tool.category} size="sm" />
                      <div>
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="focus-ring rounded text-base font-semibold text-foreground hover:text-accent"
                        >
                          {tool.name}
                        </Link>
                        <p className="text-xs text-muted">{tool.subcategory}</p>
                      </div>
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <Row label="Rating">
            {tools.map((tool) => (
              <td key={tool.id} className="px-4 py-4 align-top">
                <Rating value={tool.rating} reviewCount={tool.reviewCount} />
              </td>
            ))}
          </Row>
          <Row label="Category">
            {tools.map((tool) => (
              <td key={tool.id} className="px-4 py-4 align-top text-foreground/80">
                {getCategory(tool.category)?.name}
              </td>
            ))}
          </Row>
          <Row label="Pricing">
            {tools.map((tool) => (
              <td key={tool.id} className="px-4 py-4 align-top">
                <div className="flex flex-col gap-1.5">
                  <PricingBadge model={tool.pricing.model} />
                  <span className="text-xs text-muted">{getPriceTierLabel(tool.pricing.tier, currency)}</span>
                </div>
              </td>
            ))}
          </Row>
          <Row label="Free plan">
            {tools.map((tool) => (
              <td key={tool.id} className="px-4 py-4 align-top">
                {tool.freePlan ? (
                  <span className="inline-flex items-center gap-1 text-success">
                    <Check size={16} /> Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted">
                    <X size={16} /> No
                  </span>
                )}
              </td>
            ))}
          </Row>

          {dimensions.length > 0 && (
            <>
              <SectionDivider label="Capabilities" span={colSpan} />
              {dimensions.map((dim) => (
                <Row key={dim.id} label={dim.label}>
                  {tools.map((tool, i) => {
                    const evidence = profiles[i][dim.id];
                    return (
                      <td key={tool.id} className="px-4 py-4 align-top">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            LEVEL_STYLE[evidence.level]
                          )}
                        >
                          {FIT_LEVEL_LABEL[evidence.level]}
                        </span>
                        <p className="mt-1.5 text-xs text-foreground/70">{evidence.description}</p>
                      </td>
                    );
                  })}
                </Row>
              ))}
              <SectionDivider label="Audience & usability" span={colSpan} />
            </>
          )}

          <Row label="Best for">
            {tools.map((tool) => (
              <td key={tool.id} className="px-4 py-4 align-top text-foreground/80">
                {tool.targetAudience.slice(0, 3).map((a) => AUDIENCE_LABELS[a]).join(", ")}
              </td>
            ))}
          </Row>
          <Row label="Ease of use">
            {tools.map((tool) => (
              <td key={tool.id} className="px-4 py-4 align-top">
                <div className="flex gap-0.5" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-4 rounded-full ${
                        i < (tool.strengths.includes("ease-of-use") ? 5 : 3)
                          ? "bg-accent"
                          : "bg-border"
                      }`}
                    />
                  ))}
                </div>
              </td>
            ))}
          </Row>
          <Row label="Features">
            {tools.map((tool) => (
              <td key={tool.id} className="px-4 py-4 align-top">
                <ul className="space-y-1 text-foreground/80">
                  {tool.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex gap-1.5">
                      <Check size={14} className="mt-0.5 shrink-0 text-accent" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </Row>
          <Row label="Pros">
            {tools.map((tool) => (
              <td key={tool.id} className="px-4 py-4 align-top">
                <ul className="space-y-1 text-foreground/80">
                  {tool.pros.slice(0, 2).map((p) => (
                    <li key={p} className="flex gap-1.5">
                      <Check size={14} className="mt-0.5 shrink-0 text-success" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </Row>
          <Row label="Cons">
            {tools.map((tool) => (
              <td key={tool.id} className="px-4 py-4 align-top">
                <ul className="space-y-1 text-foreground/80">
                  {tool.cons.slice(0, 2).map((c) => (
                    <li key={c} className="flex gap-1.5">
                      <X size={14} className="mt-0.5 shrink-0 text-muted" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </Row>
          <Row label="Website">
            {tools.map((tool) => {
              const cta = resolveOfferCta(tool, getBestDealForTool(tool.id));
              return (
                <td key={tool.id} className="bg-stone-50/60 px-4 py-4 align-top">
                  <AffiliateCTA
                    tool={tool}
                    href={cta.href}
                    isAffiliate={cta.isAffiliate}
                    placement="compare_offer"
                    size="sm"
                  >
                    {cta.label}
                  </AffiliateCTA>
                </td>
              );
            })}
          </Row>
        </tbody>
      </table>
    </div>
  );
}
