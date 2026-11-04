/**
 * Pure product helpers with no catalogue import, so client components can use
 * them without pulling the whole mock catalogue into their bundle.
 */
import type { Category, Product, ProductFilters, SortKey } from "./types";
import { lineOrder } from "./mock/line-order";
import { commerce } from "../site-config";
import { formatPrice } from "../format";

export const CATEGORY_LABEL: Record<Category, string> = {
  tees: "TEES",
  outerwear: "OUTERWEAR",
  bottoms: "BOTTOMS",
  extras: "EXTRAS",
};

export const categoryLabel = (c: Category) => CATEGORY_LABEL[c];
export const categories: Category[] = ["tees", "outerwear", "bottoms", "extras"];

/* ───────────────────────── helpers ───────────────────────── */

export const priceOf = (p: Product) => p.wrng.price;

export function fitTag(p: Product): string {
  if (p.wrng.category === "extras") return "One size";
  const first = p.wrng.fit.split(/[ ,.]/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export function totalStock(p: Product) {
  return p.wrng.sizes.reduce((a, s) => a + (s.available ? s.stock : 0), 0);
}

export function isLocked(p: Product, now: number, unlocked = false) {
  return Boolean(p.wrng.releaseAt && Date.parse(p.wrng.releaseAt) > now && !unlocked);
}

export type Badge = "NEW" | "LOW STOCK" | "SOLD OUT" | "RESTOCKING" | "LIMITED" | "LOCKED";

/** Badges come straight from stock data: no invented urgency. */
export function badgesFor(p: Product, now: number, unlocked = false): Badge[] {
  if (isLocked(p, now, unlocked)) return ["LOCKED"];
  if (!p.availableForSale) return [p.wrng.restocking ? "RESTOCKING" : "SOLD OUT"];
  const out: Badge[] = [];
  if (p.wrng.isNew) out.push("NEW");
  if (totalStock(p) <= commerce.lowStockProductThreshold) out.push("LOW STOCK");
  return out;
}

export function variantFor(p: Product, colourName: string, size: string) {
  return p.variants.find(
    (v) => v.selectedOptions.some((o) => o.name === "Colour" && o.value === colourName) && v.selectedOptions.some((o) => o.name === "Size" && o.value === size),
  );
}

export function accessibleName(p: Product, colour?: string) {
  return `${p.title} ${p.wrng.type}, ${(colour ?? p.wrng.colours[0].name).toLowerCase()}, ${formatPrice(p.wrng.price)}`;
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const copy = [...list];
  const dropNum = (p: Product) => Number(p.wrng.drop.replace(/\D/g, "")) || 0;
  switch (sort) {
    case "new":
      return copy.sort((a, b) => dropNum(b) - dropNum(a) || Number(b.wrng.isNew) - Number(a.wrng.isNew));
    case "price-asc":
      return copy.sort((a, b) => a.wrng.price - b.wrng.price);
    case "price-desc":
      return copy.sort((a, b) => b.wrng.price - a.wrng.price);
    default: {
      // Featured: live drop in line order, then available pieces, then sold out.
      const lineIdx = (p: Product) => {
        const i = lineOrder.indexOf(p.handle);
        return i === -1 ? 100 : i;
      };
      return copy.sort((a, b) => Number(!a.availableForSale) - Number(!b.availableForSale) || lineIdx(a) - lineIdx(b));
    }
  }
}

export const PRICE_BANDS: { label: string; range: [number, number] }[] = [
  { label: "Under ₹1,500", range: [0, 1499] },
  { label: "₹1,500 – ₹2,999", range: [1500, 2999] },
  { label: "₹3,000 – ₹4,499", range: [3000, 4499] },
  { label: "₹4,500 and up", range: [4500, 1_000_000] },
];

export function filterProducts(list: Product[], f: ProductFilters): Product[] {
  return list.filter((p) => {
    if (f.category && f.category !== "all" && p.wrng.category !== f.category) return false;
    if (f.sizes?.length && !p.wrng.sizes.some((s) => s.available && f.sizes!.includes(s.label))) return false;
    if (f.colours?.length && !p.wrng.colours.some((c) => f.colours!.includes(colourFamily(c.name)))) return false;
    if (f.fits?.length && !f.fits.includes(fitTag(p))) return false;
    if (f.price && (p.wrng.price < f.price[0] || p.wrng.price > f.price[1])) return false;
    return true;
  });
}

/** Group colour names into filterable families. */
export function colourFamily(name: string) {
  const n = name.toLowerCase();
  if (n.includes("black") || n.includes("ink") || n.includes("charcoal")) return "Black";
  if (n.includes("bone") || n.includes("natural") || n.includes("mixed")) return "Bone";
  if (n.includes("ash")) return "Grey";
  if (n.includes("olive")) return "Olive";
  if (n.includes("duck") || n.includes("rust")) return "Brown";
  if (n.includes("orange")) return "Orange";
  return name;
}

export const COLOUR_FAMILIES: { name: string; hex: string }[] = [
  { name: "Black", hex: "#151515" },
  { name: "Bone", hex: "#E3DCCD" },
  { name: "Grey", hex: "#8E8C87" },
  { name: "Olive", hex: "#545536" },
  { name: "Brown", hex: "#6C5233" },
  { name: "Orange", hex: "#D4541F" },
];

