"use client";

/** Cart view: resolves stored lines into Storefront-shaped Cart objects. */
import { useStore } from "../store";
import { getProductSync } from "./index";
import type { Cart, CartLine, Money } from "./types";
import { cartStore, type StoredCart, type StoredLine } from "./cart-store";

export * from "./cart-store";

const money = (n: number): Money => ({ amount: n.toFixed(2), currencyCode: "INR" });

function buildLine(l: StoredLine): CartLine | null {
  const p = getProductSync(l.handle);
  const v = p?.variants.find((x) => x.id === l.variantId);
  if (!p || !v) return null;
  const price = Number(v.price.amount);
  return {
    id: l.id,
    quantity: l.quantity,
    merchandise: {
      id: v.id,
      title: v.title,
      selectedOptions: v.selectedOptions,
      product: { id: p.id, handle: p.handle, title: p.title, productType: p.productType, featuredImage: v.image },
    },
    cost: {
      amountPerQuantity: v.price,
      compareAtAmountPerQuantity: v.compareAtPrice,
      totalAmount: money(price * l.quantity),
    },
  };
}

const cache = new WeakMap<StoredCart, Cart>();

export function toCart(s: StoredCart): Cart {
  const hit = cache.get(s);
  if (hit) return hit;
  const lines = s.lines.map(buildLine).filter((l): l is CartLine => Boolean(l));
  const subtotal = lines.reduce((a, l) => a + Number(l.cost.totalAmount.amount), 0);
  const cart: Cart = {
    id: s.id,
    checkoutUrl: "/checkout",
    note: s.note,
    totalQuantity: lines.reduce((a, l) => a + l.quantity, 0),
    lines,
    cost: { subtotalAmount: money(subtotal), totalAmount: money(subtotal), totalTaxAmount: null },
    updatedAt: s.updatedAt,
  };
  cache.set(s, cart);
  return cart;
}

export function useCart(): Cart {
  const stored = useStore(cartStore);
  return toCart(stored);
}
