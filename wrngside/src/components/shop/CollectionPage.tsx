import { getCollection, getCollectionProducts } from "@/lib/commerce";
import { renderTime } from "@/lib/time";
import type { Category } from "@/lib/commerce/types";
import { ShopView } from "./ShopView";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Lines } from "@/components/ui/Lines";
import { CableDivider } from "@/components/ui/CableDivider";
import { notFound } from "next/navigation";

export async function CollectionPage({ handle }: { handle: string }) {
  const collection = await getCollection(handle);
  if (!collection) notFound();
  const products = await getCollectionProducts(handle);
  const renderedAt = renderTime();
  const visibleCount = products.filter((p) => !(p.wrng.releaseAt && Date.parse(p.wrng.releaseAt) > renderedAt)).length;
  const crumbs = [
    { label: "HOME", href: "/" },
    { label: "SHOP", href: "/shop" },
    ...(handle === "all" ? [] : [{ label: collection.title, href: collection.path }]),
  ];
  return (
    <main id="main" data-theme="day" className="theme-day shop-page">
      <header className="wrap shop-head pt-header">
        <Breadcrumbs items={crumbs} />
        <h1 className="t-h1 shop-title axis-hover">
          <Lines lines={[collection.title]} mode="mount" />
          <span className="shop-count t-mono-lg" aria-label={`${visibleCount} pieces`}>
            ({visibleCount})
          </span>
        </h1>
        <p className="shop-desc text-muted">{collection.description}</p>
      </header>
      <CableDivider className="shop-cable" />
      <ShopView products={products} renderedAt={renderedAt} category={handle as Category | "all"} />
    </main>
  );
}
