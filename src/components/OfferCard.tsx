import ToolLogo from "./ToolLogo";
import OfferStatus from "./OfferStatus";
import AffiliateCTA from "./AffiliateCTA";
import { resolveOfferCta } from "@/lib/offers";
import type { CtaPlacement, Deal, Tool } from "@/data/types";

export default function OfferCard({
  tool,
  deal,
  placement,
}: {
  tool: Tool;
  deal?: Deal;
  placement: CtaPlacement;
}) {
  const cta = resolveOfferCta(tool, deal);

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
            <OfferStatus verified={deal.verified} demo={deal.demo} />
            {deal.discountText && (
              <span className="ml-auto text-sm font-bold text-success">{deal.discountText}</span>
            )}
          </div>

          <p className="mt-3 text-sm font-medium text-foreground">{deal.title}</p>

          {(deal.offerPrice || deal.originalPrice) && (
            <div className="mt-3 flex items-baseline gap-2">
              {deal.offerPrice && (
                <span className="text-xl font-bold text-foreground">{deal.offerPrice}</span>
              )}
              {deal.originalPrice && (
                <span className="text-sm text-muted line-through">{deal.originalPrice}</span>
              )}
            </div>
          )}

          {deal.expiresAt && (
            <p className="mt-1 text-xs text-muted">
              Expires {new Date(deal.expiresAt).toLocaleDateString()}
            </p>
          )}

          <AffiliateCTA
            tool={tool}
            href={cta.href}
            isAffiliate={cta.isAffiliate}
            placement={placement}
            variant={cta.isAffiliate ? "primary" : "secondary"}
            className="mt-5"
          >
            {cta.label}
          </AffiliateCTA>
        </>
      ) : (
        <>
          <p className="mt-4 text-sm font-medium text-foreground">No current verified offer</p>
          <p className="mt-1 text-sm text-muted">Here&apos;s standard pricing instead.</p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {tool.pricing.startingPrice ?? tool.pricing.model}
          </p>

          <AffiliateCTA
            tool={tool}
            href={cta.href}
            isAffiliate={cta.isAffiliate}
            placement={placement}
            variant="secondary"
            className="mt-5"
          >
            {cta.label}
          </AffiliateCTA>
        </>
      )}
    </div>
  );
}
