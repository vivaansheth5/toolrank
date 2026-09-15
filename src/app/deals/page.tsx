import type { Metadata } from "next";
import { Info, ShieldCheck, Tag } from "lucide-react";
import DealCard from "@/components/DealCard";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";
import { deals } from "@/data/deals";
import { getToolById } from "@/data/tools";

export const metadata: Metadata = {
  title: "Best AI & Software Deals",
  description: "Sample AI and software deals and discounts, structured so real affiliate offers can be added later.",
};

export default function DealsPage() {
  const verifiedDeals = deals.filter((d) => d.verified);
  const demoDeals = deals.filter((d) => !d.verified);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Best AI &amp; Software Deals
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Save on the tools you already want to try.
      </p>

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-warning-soft px-4 py-3 text-xs text-warning">
        <Info size={15} className="mt-0.5 shrink-0" />
        Every offer below is currently DEMO / SAMPLE DATA for demonstration purposes, not a verified
        live discount. None of these have been confirmed with the provider — always check the
        provider&apos;s website before purchasing. A future &ldquo;Verified&rdquo; badge will only
        appear here once an offer has actually been confirmed.
      </div>

      {verifiedDeals.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <ShieldCheck size={18} className="text-success" /> Verified offers
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {verifiedDeals.map((deal) => {
              const tool = getToolById(deal.toolId);
              if (!tool) return null;
              return <DealCard key={deal.id} deal={deal} tool={tool} />;
            })}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Tag size={16} className="text-warning" /> Demo / sample offers
        </h2>
        <p className="mt-1 text-sm text-muted">
          Not yet verified — shown to illustrate how real offers will appear once confirmed.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {demoDeals.map((deal) => {
            const tool = getToolById(deal.toolId);
            if (!tool) return null;
            return <DealCard key={deal.id} deal={deal} tool={tool} />;
          })}
        </div>
      </section>

      <AffiliateDisclosure className="mt-8" />
    </div>
  );
}
