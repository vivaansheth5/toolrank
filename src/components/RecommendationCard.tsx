import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import ToolLogo from "./ToolLogo";
import Rating from "./Rating";
import PricingBadge from "./PricingBadge";
import AffiliateCTA from "./AffiliateCTA";
import { getBestDealForTool } from "@/data/deals";
import { resolveOfferCta } from "@/lib/offers";
import type { Recommendation } from "@/lib/recommend";

export default function RecommendationCard({
  recommendation,
  rank,
}: {
  recommendation: Recommendation;
  rank: number;
}) {
  const { tool, matchPercent, reasons, label } = recommendation;
  const cta = resolveOfferCta(tool, getBestDealForTool(tool.id));

  return (
    <div className="animate-fade-in-up relative flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-sm sm:flex-row sm:items-start">
      <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
          #{rank}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold tracking-tight text-foreground">{matchPercent}%</span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">Match</span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            {label}
          </span>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <ToolLogo name={tool.name} category={tool.category} />
          <div>
            <Link href={`/tools/${tool.slug}`} className="focus-ring rounded text-lg font-semibold text-foreground hover:text-accent">
              {tool.name}
            </Link>
            <p className="text-sm text-muted">{tool.tagline}</p>
          </div>
        </div>

        <ul className="mt-4 space-y-1.5">
          {reasons.slice(0, 3).map((reason) => (
            <li key={reason} className="flex items-start gap-2 text-sm text-foreground/80">
              <Check size={15} className="mt-0.5 shrink-0 text-accent" />
              {reason}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <PricingBadge model={tool.pricing.model} />
          {tool.freePlan && (
            <span className="text-xs font-medium text-success">Free plan available</span>
          )}
          <Rating value={tool.rating} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <AffiliateCTA
            tool={tool}
            href={cta.href}
            isAffiliate={cta.isAffiliate}
            placement="find_my_tool"
            variant="primary"
          >
            {cta.label}
          </AffiliateCTA>
          <Link
            href={`/tools/${tool.slug}`}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border-strong px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-stone-50"
          >
            View details
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
