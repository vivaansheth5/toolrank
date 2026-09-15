import type { Metadata } from "next";
import { Info } from "lucide-react";
import DealCard from "@/components/DealCard";
import { deals } from "@/data/deals";
import { getToolBySlug } from "@/data/tools";

export const metadata: Metadata = {
  title: "Best AI & Software Deals",
  description: "Sample AI and software deals and discounts, structured so real affiliate offers can be added later.",
};

export default function DealsPage() {
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
        These are SAMPLE / OFFER DATA for demonstration purposes, not verified live discounts. Always
        confirm current pricing on the provider&apos;s website before purchasing.
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal) => {
          const tool = getToolBySlug(deal.toolSlug);
          if (!tool) return null;
          return <DealCard key={deal.id} deal={deal} tool={tool} />;
        })}
      </div>
    </div>
  );
}
