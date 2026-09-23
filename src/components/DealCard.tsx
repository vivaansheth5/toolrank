import Link from "next/link";
import ToolLogo, { CATEGORY_ACCENT } from "./ToolLogo";
import OfferStatus from "./OfferStatus";
import AffiliateCTA from "./AffiliateCTA";
import PriceTag from "./PriceTag";
import { getCategory } from "@/data/categories";
import { resolveOfferCta } from "@/lib/offers";
import type { Deal, Tool } from "@/data/types";

export default function DealCard({ deal, tool }: { deal: Deal; tool: Tool }) {
  const category = getCategory(tool.category);
  const cta = resolveOfferCta(tool, deal);
  const accent = CATEGORY_ACCENT[tool.category];

  return (
    <div
      style={{ ["--hover-shadow" as string]: accent.shadow }}
      className={`group flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--hover-shadow)] ${accent.border}`}
    >
      <div className="flex items-center justify-between">
        <OfferStatus verified={deal.verified} demo={deal.demo} />
        {deal.discountText && (
          <span className="text-sm font-bold text-success">{deal.discountText}</span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <ToolLogo name={tool.name} category={tool.category} size="sm" className="transition-transform group-hover:scale-110" />
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
        <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {deal.offerPrice && (
            <PriceTag
              vendorPriceString={deal.offerPrice}
              vendorCurrency={deal.currency}
              primaryClassName="text-lg font-bold text-foreground"
            />
          )}
          {deal.originalPrice && (
            <PriceTag
              vendorPriceString={deal.originalPrice}
              vendorCurrency={deal.currency}
              primaryClassName="text-sm text-muted line-through"
              showOriginal={false}
            />
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
        variant="primary"
        className="mt-5"
      >
        {cta.label}
      </AffiliateCTA>
    </div>
  );
}
