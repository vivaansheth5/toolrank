"use client";

/**
 * Mock cart mirroring the Storefront Cart API (cartCreate, cartLinesAdd,
 * cartLinesUpdate, cartLinesRemove, cartNoteUpdate). Persisted to
 * localStorage. A Shopify version would store only the cart id and call the API.
 */
import { createStore, useStore } from "../store";
import { getProductSync } from "./index";
import type { Cart, CartLine, Money } from "./types";
import { commerce } from "../site-config";

interface StoredLine {
  id: string;
  variantId: string;
  handle: string;
  quantity: number;
}

interface StoredCart {
  id: string;
  note: string;
  lines: StoredLine[];
  updatedAt: string;
}

const empty: StoredCart = { id: "gid://shopify/Cart/local", note: "", lines: [], updatedAt: "" };

export const cartStore = createStore<StoredCart>(empty, {
  key: "wrng:cart:v1",
  validate: (v) => {
    const c = v as StoredCart;
    return c && Array.isArray(c.lines) ? c : null;
  },
});

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

export const useCartCount = () => useStore(cartStore, (s) => s.lines.reduce((a, l) => a + l.quantity, 0));

const now = () => new Date().toISOString();
const uid = () => `gid://shopify/CartLine/${Math.random().toString(36).slice(2, 10)}`;

export const cartActions = {
  /** cartLinesAdd */
  add(handle: string, variantId: string, quantity = 1) {
    let lineId = "";
    cartStore.set((c) => {
      const existing = c.lines.find((l) => l.variantId === variantId);
      if (existing) {
        lineId = existing.id;
        return {
          ...c,
          updatedAt: now(),
          lines: c.lines.map((l) => (l.id === existing.id ? { ...l, quantity: Math.min(commerce.maxQtyPerLine, l.quantity + quantity) } : l)),
        };
      }
      lineId = uid();
      return { ...c, updatedAt: now(), lines: [...c.lines, { id: lineId, variantId, handle, quantity }] };
    });
    return lineId;
  },
  /** cartLinesUpdate */
  update(lineId: string, quantity: number) {
    cartStore.set((c) => ({
      ...c,
      updatedAt: now(),
      lines: c.lines.map((l) => (l.id === lineId ? { ...l, quantity: Math.max(1, Math.min(commerce.maxQtyPerLine, quantity)) } : l)),
    }));
  },
  /** cartLinesRemove — returns what's needed to undo. */
  remove(lineId: string) {
    const c = cartStore.get();
    const index = c.lines.findIndex((l) => l.id === lineId);
    const line = c.lines[index];
    cartStore.set({ ...c, updatedAt: now(), lines: c.lines.filter((l) => l.id !== lineId) });
    return line ? { line, index } : null;
  },
  restore(snapshot: { line: StoredLine; index: number }) {
    cartStore.set((c) => {
      const lines = [...c.lines];
      lines.splice(Math.min(snapshot.index, lines.length), 0, snapshot.line);
      return { ...c, updatedAt: now(), lines };
    });
  },
  /** cartNoteUpdate */
  setNote(note: string) {
    cartStore.set((c) => ({ ...c, note: note.slice(0, 500), updatedAt: now() }));
  },
  clear() {
    cartStore.set({ ...empty, updatedAt: now() });
  },
};

export function shippingFor(subtotal: number) {
  return subtotal >= commerce.freeShippingThreshold || subtotal === 0 ? 0 : commerce.standardShipping;
}
