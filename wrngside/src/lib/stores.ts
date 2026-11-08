"use client";

import { createStore, useStore } from "./store";

/* ───────────── UI (drawers, overlays) ───────────── */
export interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
}
export const uiStore = createStore<UIState>({ cartOpen: false, searchOpen: false, menuOpen: false });
export const ui = {
  openCart: () => uiStore.set((s) => ({ ...s, cartOpen: true, menuOpen: false, searchOpen: false })),
  closeCart: () => uiStore.set((s) => ({ ...s, cartOpen: false })),
  openSearch: () => uiStore.set((s) => ({ ...s, searchOpen: true, menuOpen: false, cartOpen: false })),
  closeSearch: () => uiStore.set((s) => ({ ...s, searchOpen: false })),
  toggleMenu: () => uiStore.set((s) => ({ ...s, menuOpen: !s.menuOpen })),
  closeMenu: () => uiStore.set((s) => ({ ...s, menuOpen: false })),
};

/* ───────────── Toasts ───────────── */
export interface Toast {
  id: number;
  message: string;
  action?: { label: string; onClick: () => void };
  duration?: number;
}
export const toastStore = createStore<Toast[]>([]);
let toastId = 0;
export function toast(message: string, opts: { action?: Toast["action"]; duration?: number } = {}) {
  const id = ++toastId;
  toastStore.set((list) => [...list.slice(-2), { id, message, ...opts }]);
  return id;
}
export const dismissToast = (id: number) => toastStore.set((list) => list.filter((t) => t.id !== id));

/* ───────────── Saved items: YOUR LINE ───────────── */
export const savedStore = createStore<string[]>([], { key: "wrng:saved:v1", validate: (v) => (Array.isArray(v) ? (v as string[]) : null) });
export const useSaved = () => useStore(savedStore);
export const useIsSaved = (handle: string) => useStore(savedStore, (s) => s.includes(handle));
export function toggleSaved(handle: string) {
  const has = savedStore.get().includes(handle);
  savedStore.set((s) => (has ? s.filter((h) => h !== handle) : [handle, ...s]));
  return !has;
}

/* ───────────── Recently viewed ───────────── */
export const recentStore = createStore<string[]>([], { key: "wrng:recent:v1", validate: (v) => (Array.isArray(v) ? (v as string[]) : null) });
export const pushRecent = (handle: string) => recentStore.set((s) => [handle, ...s.filter((h) => h !== handle)].slice(0, 8));

/* ───────────── Preferences ───────────── */
export interface Prefs {
  tickerDismissed: boolean;
  sound: boolean;
  lineHintSeen: boolean;
  newsletter: boolean;
}
const defaultPrefs: Prefs = { tickerDismissed: false, sound: false, lineHintSeen: false, newsletter: false };
export const prefsStore = createStore<Prefs>(
  defaultPrefs,
  { key: "wrng:prefs:v1", validate: (v) => (v && typeof v === "object" ? { ...defaultPrefs, ...(v as Partial<Prefs>) } : null) },
);
export const setPref = <K extends keyof Prefs>(k: K, v: Prefs[K]) => prefsStore.set((p) => ({ ...p, [k]: v }));

/* ───────────── Drop access ───────────── */
export const accessStore = createStore<{ unlocked: string[] }>({ unlocked: [] }, { key: "wrng:access:v1" });
export const useDropUnlocked = (dropId: string) => useStore(accessStore, (s) => s.unlocked.includes(dropId));

/* ───────────── Account (mocked) ───────────── */
export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}
export interface OrderLine {
  handle: string;
  title: string;
  variant: string;
  quantity: number;
  price: number;
  image: string;
}
export interface Order {
  id: string;
  createdAt: string;
  email: string;
  phone: string;
  payment: "UPI" | "CARD" | "COD";
  address: Omit<Address, "id" | "isDefault">;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: "PLACED" | "PACKED" | "SHIPPED" | "OUT FOR DELIVERY" | "DELIVERED";
  deliveryBy: string;
}
export interface AccountState {
  user: { name: string; phone: string; email: string } | null;
  addresses: Address[];
  orders: Order[];
}
export const accountStore = createStore<AccountState>({ user: null, addresses: [], orders: [] }, { key: "wrng:account:v1" });
