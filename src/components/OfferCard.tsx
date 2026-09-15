import { ExternalLink, ShieldCheck, Tag } from "lucide-react";
import ToolLogo from "./ToolLogo";
import type { Deal, Tool } from "@/data/types";

export default function OfferCard({ tool, deal }: { tool: Tool; deal?: Deal }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <ToolLogo name={tool.name} category={tool.category} size="sm" />
        <div>
          <p className="text-sm font-semibold text-foreground">{tool.name}</p>
          <p className="text-xs text-muted">Best available offer</p>
        </div>
      </div>

      {deal ? (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-warning">
              <Tag size={11} /> Sample offer
            </span>
            {deal.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-success">
                <ShieldCheck size={11} /> Verified
              </span>
            )}
            {deal.discountPercent > 0 && (
              <span className="ml-auto text-sm font-bold text-success">-{deal.discountPercent}%</span>
            )}
          </div>

          <p className="mt-3 text-sm font-medium text-foreground">{deal.headline}</p>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">{deal.discountedPrice}</span>
            <span className="text-sm text-muted line-through">{deal.originalPrice}</span>
          </div>

          {deal.expiry && <p className="mt-1 text-xs text-muted">{deal.expiry}</p>}

          <a
            href={deal.offerUrl}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="focus-ring mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Get Offer
            <ExternalLink size={14} />
          </a>
        </>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted">
            No active offer right now — here&apos;s standard pricing instead.
          </p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {tool.pricing.startingPrice ?? tool.pricing.model}
          </p>

          <a
            href={tool.websiteUrl}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="focus-ring mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border-strong px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-stone-50"
          >
            Visit Website
            <ExternalLink size={14} />
          </a>
        </>
      )}
    </div>
  );
}
