import Link from "next/link";
import { Check, X, ExternalLink } from "lucide-react";
import ToolLogo from "./ToolLogo";
import Rating from "./Rating";
import PricingBadge from "./PricingBadge";
import { AUDIENCE_LABELS, PRICE_TIER_LABELS } from "@/lib/utils";
import { getCategory } from "@/data/categories";
import type { Tool } from "@/data/types";

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
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="sticky left-0 z-10 w-36 min-w-36 bg-surface px-4 py-5" />
            {tools.map((tool) => (
              <th key={tool.id} scope="col" className="min-w-[220px] px-4 py-5 text-left align-top">
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
              </th>
            ))}
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
                  <span className="text-xs text-muted">{PRICE_TIER_LABELS[tool.pricing.tier]}</span>
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
            {tools.map((tool) => (
              <td key={tool.id} className="px-4 py-4 align-top">
                <a
                  href={tool.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                >
                  Visit Website
                  <ExternalLink size={13} />
                </a>
              </td>
            ))}
          </Row>
        </tbody>
      </table>
    </div>
  );
}
