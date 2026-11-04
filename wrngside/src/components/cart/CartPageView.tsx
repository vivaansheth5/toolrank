"use client";

import { CartBody } from "./CartDrawer";
import { useHydrated } from "@/lib/store";

export function CartPageView() {
  const hydrated = useHydrated();
  if (!hydrated) return <p className="t-meta">LOADING YOUR BAG…</p>;
  return (
    <div className="cart-page-body drawer theme-day" style={{ position: "relative", transform: "none", width: "100%", boxShadow: "none" }}>
      <CartBody page />
    </div>
  );
}
