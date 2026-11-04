/**
 * Mock commerce provider. Same function names and return shapes a Shopify
 * Storefront provider would expose; swap the bodies, keep the signatures.
 */
import { catalog, bestSellers, pairings, reviews as rawReviews, type RawProduct } from "./mock/catalog";
import { lineOrder } from "./mock/line-order";
import type { Collection, Image, Money, Product, ProductVariant, Review } from "./types";
import { formatPrice } from "../format";
import { commerce, drops } from "../site-config";

export type { Product, Collection, Review };

const money = (n: number): Money => ({ amount: n.toFixed(2), currencyCode: "INR" });

import { CATEGORY_LABEL, categories } from "./helpers";

function img(url: string, alt: string, w = 800, h = 1000): Image {
  return { url, altText: alt, width: w, height: h };
}

function reshape(raw: RawProduct): Product {
  const colours = raw.colours.map((c) => {
    const base = `/products/${raw.handle}/${c.slug}`;
    const media =
      c.slug === raw.colours[0].slug
        ? raw.images
        : { cutout: `${base}/cutout.svg`, front: `${base}/front.svg`, back: `${base}/back.svg`, insideOut: `${base}/inside-out.svg`, model: [`${base}/model-1.svg`] };
    return { name: c.name, slug: c.slug, hex: c.hex, media };
  });
  const name = `${raw.title} ${raw.type}`;
  const variants: ProductVariant[] = [];
  raw.colours.forEach((c, ci) => {
    raw.sizes.forEach((s, si) => {
      variants.push({
        id: `gid://shopify/ProductVariant/${raw.id.split("/").pop()}${ci}${si}`,
        title: `${c.name} / ${s.label}`,
        sku: `WS-${raw.handle.slice(0, 6).toUpperCase()}-${c.slug.slice(0, 3).toUpperCase()}-${s.label.replace(/\W/g, "")}`,
        availableForSale: s.available,
        quantityAvailable: s.stock,
        selectedOptions: [
          { name: "Colour", value: c.name },
          { name: "Size", value: s.label },
        ],
        price: money(raw.price),
        compareAtPrice: raw.compareAtPrice ? money(raw.compareAtPrice) : null,
        image: img(colours[ci].media.front, `${name} in ${c.name}, front`),
      });
    });
  });
  const primary = colours[0];
  const images = [
    img(primary.media.front, `${name} in ${primary.name}, front`),
    img(primary.media.back, `${name} in ${primary.name}, back`),
    img(primary.media.insideOut, `${name} in ${primary.name}, inside out`),
    ...primary.media.model.map((m, i) => img(m, `${name} in ${primary.name}, on the line at night ${i + 1}`)),
  ];
  const available = raw.sizes.some((s) => s.available);
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    vendor: "WRNGSIDE",
    productType: raw.type,
    tags: raw.tags,
    availableForSale: available,
    priceRange: { minVariantPrice: money(raw.price), maxVariantPrice: money(raw.price) },
    compareAtPriceRange: raw.compareAtPrice ? { maxVariantPrice: money(raw.compareAtPrice) } : null,
    featuredImage: images[0],
    images,
    options: [
      { id: `${raw.id}/colour`, name: "Colour", values: raw.colours.map((c) => c.name) },
      { id: `${raw.id}/size`, name: "Size", values: raw.sizes.map((s) => s.label) },
    ],
    variants,
    seo: {
      title: `${raw.title} ${raw.type.toUpperCase()} — ${formatPrice(raw.price)}`,
      description: `${raw.description} ${raw.gsm ? `${raw.gsm} GSM. ` : ""}Free shipping over ${formatPrice(commerce.freeShippingThreshold)}. COD available.`,
    },
    updatedAt: "2026-10-30T12:00:00+05:30",
    wrng: {
      type: raw.type,
      category: raw.category,
      kind: raw.kind,
      colours,
      sizes: raw.sizes,
      gsm: raw.gsm,
      fit: raw.fit,
      fabric: raw.fabric,
      care: raw.care,
      details: raw.details,
      hangStyle: raw.hangStyle,
      weight: raw.weight,
      drop: raw.drop,
      isNew: raw.isNew,
      isLimited: raw.isLimited,
      restocking: Boolean(raw.restocking),
      releaseAt: raw.releaseAt ?? null,
      sizeChart: raw.sizeChart,
      dims: raw.dims,
      price: raw.price,
      compareAtPrice: raw.compareAtPrice ?? null,
    },
  };
}

const products: Product[] = catalog.map(reshape);
const byHandle = new Map(products.map((p) => [p.handle, p]));

/* ───────────────────────── queries ───────────────────────── */

export async function getProduct(handle: string): Promise<Product | undefined> {
  return byHandle.get(handle);
}

export function getProductSync(handle: string): Product | undefined {
  return byHandle.get(handle);
}

export async function getAllProducts(): Promise<Product[]> {
  return products;
}

export function getAllProductsSync(): Product[] {
  return products;
}

export async function getProductsByHandles(handles: readonly string[]): Promise<Product[]> {
  return handles.map((h) => byHandle.get(h)).filter((p): p is Product => Boolean(p));
}

export function getProductsByHandlesSync(handles: readonly string[]): Product[] {
  return handles.map((h) => byHandle.get(h)).filter((p): p is Product => Boolean(p));
}

/** The live drop, in hanging order. */
export async function getLineProducts(): Promise<Product[]> {
  return getProductsByHandlesSync(lineOrder);
}

export async function getBestSellers(): Promise<Product[]> {
  return getProductsByHandlesSync(bestSellers);
}

export async function getPairings(handle: string): Promise<Product[]> {
  return getProductsByHandlesSync(pairings[handle] ?? []);
}

export async function getReviews(handle: string): Promise<Review[]> {
  return rawReviews.filter((r) => r.handle === handle).map((r, i) => ({ ...r, id: `${handle}-${i}` }));
}

export async function getDropProducts(dropId: string): Promise<Product[]> {
  return products.filter((p) => p.wrng.drop === dropId);
}

export const collections: Collection[] = [
  {
    handle: "all",
    title: "EVERYTHING",
    description: "Every piece on the wire right now, plus what's coming back.",
    seo: { title: "Shop everything", description: "Heavyweight tees, hoodies, jackets, cargos and extras from WRNGSIDE." },
    path: "/shop",
  },
  ...categories.map((c) => ({
    handle: c,
    title: CATEGORY_LABEL[c],
    description:
      c === "tees"
        ? "240 GSM and up. Boxy, oversized, built to be worn to death."
        : c === "outerwear"
          ? "Hoodies, overshirts and jackets for the hour the city cools down."
          : c === "bottoms"
            ? "Cargos, sweats and shorts with room to move."
            : "Caps, socks, totes and the small stuff that finishes a fit.",
    seo: { title: `Shop ${CATEGORY_LABEL[c].toLowerCase()}`, description: `WRNGSIDE ${c}: limited drops, made in India, COD available.` },
    path: `/shop/${c}`,
  })),
];

export async function getCollection(handle: string): Promise<Collection | undefined> {
  return collections.find((c) => c.handle === handle);
}

/** Products shown in listings (excludes pieces still locked behind a drop). */
export async function getCollectionProducts(handle: string): Promise<Product[]> {
  const list = handle === "all" ? products : products.filter((p) => p.wrng.category === handle);
  return list;
}

export * from "./helpers";

/** Simple ranked search over titles, types, tags and colours. */
export function searchProductsSync(query: string, limit = 8): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const scored = products
    .map((p) => {
      const title = p.title.toLowerCase();
      const hay = [title, p.wrng.type, p.wrng.category, ...p.tags, ...p.wrng.colours.map((c) => c.name.toLowerCase())].join(" ");
      let score = 0;
      if (title.startsWith(q)) score += 12;
      if (title.includes(q)) score += 8;
      for (const t of terms) {
        if (hay.includes(t)) score += 3;
        else if (t.length > 3 && hay.includes(t.slice(0, -1))) score += 1;
        else return { p, score: 0 };
      }
      return { p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.p);
}

export const liveDrop = () => drops.list.find((d) => d.id === drops.live)!;
export const nextDrop = () => drops.list.find((d) => d.id === drops.next)!;
export const dropById = (id: string) => drops.list.find((d) => d.id === id);
