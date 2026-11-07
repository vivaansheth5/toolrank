"use client";

import { CartBody } from "./CartDrawer";
import { useHydrated } from "@/lib/store";
import { ui } from "@/lib/site-config";

export function CartPageView() {
  const hydrated = useHydrated();
  if (!hydrated) return <p className="t-meta">{ui.common.loadingBag}</p>;
  return (
    <div className="cart-page-body drawer theme-day" style={{ position: "relative", transform: "none", width: "100%", boxShadow: "none" }}>
      <CartBody page />
    </div>
  );
}
