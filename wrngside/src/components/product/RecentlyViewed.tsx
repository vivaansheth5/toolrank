"use client";

import { useMemo } from "react";
import { recentStore } from "@/lib/stores";
import { useStore } from "@/lib/store";
import { getProductsByHandlesSync } from "@/lib/commerce";
import { ProductCard } from "@/components/shop/ProductCard";
import { useNow } from "@/lib/hooks";

export function RecentlyViewed({ exclude }: { exclude: string }) {
  const recent = useStore(recentStore);
  const now = useNow(60_000);
  const list = useMemo(() => getProductsByHandlesSync(recent.filter((h) => h !== exclude)).slice(0, 4), [recent, exclude]);
  if (!list.length || now === null) return null;
  return (
    <section className="wrap rail" aria-labelledby="recent-title">
      <h2 id="recent-title" className="t-h2">
        RECENTLY VIEWED
      </h2>
      <div className="rail-grid">
        {list.map((p) => (
          <ProductCard key={p.handle} product={p} now={now} sizes="(min-width: 1024px) 25vw, 50vw" />
        ))}
      </div>
    </section>
  );
}
