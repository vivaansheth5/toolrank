import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { getAllProductsSync, getProduct, getPairings, getReviews, categoryLabel, dropById } from "@/lib/commerce";
import { site } from "@/lib/site-config";
import { ProductView } from "@/components/product/ProductView";
import { Reviews } from "@/components/product/Reviews";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { ProductCard } from "@/components/shop/ProductCard";
import { CableDivider } from "@/components/ui/CableDivider";

export function generateStaticParams() {
  return getAllProductsSync().map((p) => ({ handle: p.handle }));
}
export const dynamicParams = false;
export const viewport: Viewport = { themeColor: site.themeColor.day };

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const p = await getProduct(handle);
  if (!p) return {};
  const og = `/og/products/${p.handle}.png`;
  return {
    title: p.seo.title,
    description: p.seo.description,
    alternates: { canonical: `/products/${p.handle}` },
    openGraph: { type: "website", title: `${p.title} ${p.wrng.type.toUpperCase()} — WRNGSIDE`, description: p.seo.description, url: `/products/${p.handle}`, images: [{ url: og, width: 1200, height: 630, alt: p.featuredImage.altText }] },
    twitter: { card: "summary_large_image", images: [og] },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[handle]">) {
  const { handle } = await params;
  const p = await getProduct(handle);
  if (!p) notFound();
  const [pairs, reviews] = await Promise.all([getPairings(handle), getReviews(handle)]);
  const renderedAt = Date.now();
  const drop = dropById(p.wrng.drop);
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${p.title} ${p.wrng.type}`,
    description: p.description,
    sku: p.variants[0].sku,
    brand: { "@type": "Brand", name: "WRNGSIDE" },
    image: p.images.map((i) => `${site.url}${i.url}`),
    color: p.wrng.colours.map((c) => c.name).join(", "),
    material: p.wrng.fabric,
    countryOfOrigin: "IN",
    offers: p.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      name: v.title,
      price: v.price.amount,
      priceCurrency: "INR",
      availability: v.availableForSale ? "https://schema.org/InStock" : p.wrng.restocking ? "https://schema.org/BackOrder" : "https://schema.org/OutOfStock",
      url: `${site.url}/products/${p.handle}`,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "WRNGSIDE" },
    })),
    ...(reviews.length ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: reviews.length } } : {}),
  };
  return (
    <main id="main" data-theme="day" className="theme-day pdp-page">
      <div className="wrap pt-header pdp-crumbs">
        <Breadcrumbs
          items={[
            { label: "HOME", href: "/" },
            { label: "SHOP", href: "/shop" },
            { label: categoryLabel(p.wrng.category), href: `/shop/${p.wrng.category}` },
            { label: p.title, href: `/products/${p.handle}` },
          ]}
        />
      </div>
      <ProductView product={p} renderedAt={renderedAt} dropLabel={drop ? `DROP ${drop.number} · ${drop.name}` : "CORE"} />
      <CableDivider className="pdp-cable" />
      {pairs.length > 0 && (
        <section className="wrap rail" aria-labelledby="fit-title">
          <h2 id="fit-title" className="t-h2">
            COMPLETE THE FIT
          </h2>
          <div className="rail-grid">
            {pairs.map((x) => (
              <ProductCard key={x.handle} product={x} now={renderedAt} sizes="(min-width: 1024px) 25vw, 50vw" />
            ))}
          </div>
        </section>
      )}
      <Reviews reviews={reviews} />
      <RecentlyViewed exclude={p.handle} />
      <JsonLd data={jsonLd} />
    </main>
  );
}
