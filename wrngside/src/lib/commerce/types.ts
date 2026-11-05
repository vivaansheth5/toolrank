/**
 * Commerce types shaped like the Shopify Storefront API (2025-xx). The UI only
 * talks to these shapes, so swapping the mock provider for Shopify means
 * re-implementing lib/commerce/index.ts and cart.ts, not the components.
 * Brand-specific fields live under `wrng`, which maps to product metafields
 * (namespace "wrng") in Shopify.
 */
import type { Category, GarmentKind, HangStyle, RawHold } from "./mock/catalog";

export type { Category, GarmentKind, HangStyle, RawHold };

export type CurrencyCode = "INR";

export interface Money {
  amount: string;
  currencyCode: CurrencyCode;
}

export interface Image {
  url: string;
  altText: string;
  width: number;
  height: number;
}

export interface SelectedOption {
  name: "Size" | "Colour";
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  availableForSale: boolean;
  quantityAvailable: number;
  selectedOptions: SelectedOption[];
  price: Money;
  compareAtPrice: Money | null;
  image: Image;
}

export interface ProductOption {
  id: string;
  name: "Size" | "Colour";
  values: string[];
}

export interface ProductMedia {
  /** Front and back views on transparent, for THE LINE. */
  cutout: string;
  cutoutBack: string;
  front: string;
  back: string;
  /** Extra angles and close-ups. `label` finishes the alt text. */
  views: { src: string; label: string }[];
  /** On the wire at night. */
  model: string[];
}

export interface Colour {
  name: string;
  slug: string;
  hex: string;
  media: ProductMedia;
}

export interface SizeStock {
  label: string;
  available: boolean;
  stock: number;
}

export interface ProductMeta {
  type: string;
  category: Category;
  kind: GarmentKind;
  colours: Colour[];
  sizes: SizeStock[];
  gsm: number;
  fit: string;
  fabric: string;
  care: string[];
  details: string[];
  hangStyle: HangStyle;
  weight: number;
  drop: string;
  isNew: boolean;
  isLimited: boolean;
  restocking: boolean;
  releaseAt: string | null;
  sizeChart: string;
  /** Real-world size of the cutout in cm (true scale on THE LINE). */
  dims: { w: number; h: number };
  /** Where THE LINE grips it: peg positions (fractions of width) and depth below the top (cm). */
  hold: RawHold;
  /** The side listings, THE LINE, the gallery, the cart and search lead with. */
  lead: "front" | "back";
  price: number;
  compareAtPrice: number | null;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: "WRNGSIDE";
  productType: string;
  tags: string[];
  availableForSale: boolean;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  compareAtPriceRange: { maxVariantPrice: Money } | null;
  featuredImage: Image;
  images: Image[];
  options: ProductOption[];
  variants: ProductVariant[];
  seo: { title: string; description: string };
  updatedAt: string;
  wrng: ProductMeta;
}

export interface Collection {
  handle: string;
  title: string;
  description: string;
  seo: { title: string; description: string };
  path: string;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    selectedOptions: SelectedOption[];
    product: { id: string; handle: string; title: string; productType: string; featuredImage: Image };
  };
  cost: { amountPerQuantity: Money; compareAtAmountPerQuantity: Money | null; totalAmount: Money };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  note: string;
  totalQuantity: number;
  lines: CartLine[];
  cost: { subtotalAmount: Money; totalAmount: Money; totalTaxAmount: Money | null };
  updatedAt: string;
}

export interface Review {
  id: string;
  handle: string;
  name: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  size: string;
  fit: string;
  photo?: string;
  date: string;
}

export type SortKey = "featured" | "new" | "price-asc" | "price-desc";

export interface ProductFilters {
  category?: Category | "all";
  sizes?: string[];
  colours?: string[];
  fits?: string[];
  price?: [number, number] | null;
}
