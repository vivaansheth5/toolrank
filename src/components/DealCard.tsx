import Link from "next/link";
import ToolLogo from "./ToolLogo";
import OfferStatus from "./OfferStatus";
import AffiliateCTA from "./AffiliateCTA";
import { getCategory } from "@/data/categories";
import { resolveOfferCta } from "@/lib/offers";
import type { Deal, Tool } from "@/data/types";

export default function DealCard({ deal, tool }: { deal: Deal; tool: Tool }) {
  const category = getCategory(tool.category);
  const cta = resolveOfferCta(tool, deal);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <OfferStatus verified={deal.verified} demo={deal.demo} />
        {deal.discountText && (
          <span className="text-sm font-bold text-success">{deal.discountText}</span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <ToolLogo name={tool.name} category={tool.category} size="sm" />
        <div>
          <Link href={`/tools/${tool.slug}`} className="focus-ring rounded text-sm font-semibold text-foreground hover:text-accent">
            {tool.name}
          </Link>
          <p className="text-xs text-muted">{category?.name}</p>
        </div>
      </div>

      <h3 className="mt-3 text-base font-semibold leading-snug text-foreground">{deal.title}</h3>
      <p className="mt-1.5 text-sm text-muted">{deal.description}</p>

      {(deal.offerPrice || deal.originalPrice) && (
        <div className="mt-4 flex items-baseline gap-2">
          {deal.offerPrice && (
            <span className="text-lg font-bold text-foreground">{deal.offerPrice}</span>
          )}
          {deal.originalPrice && (
            <span className="text-sm text-muted line-through">{deal.originalPrice}</span>
          )}
        </div>
      )}

      {deal.expiresAt && (
        <p className="mt-1 text-xs text-muted">Expires {new Date(deal.expiresAt).toLocaleDateString()}</p>
      )}

      <AffiliateCTA
        tool={tool}
        href={cta.href}
        isAffiliate={cta.isAffiliate}
        placement="deals_page"
        variant={cta.isAffiliate ? "primary" : "secondary"}
        className="mt-5"
      >
        {cta.label}
      </AffiliateCTA>
    </div>
  );
}
