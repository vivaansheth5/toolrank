"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { TransitionProvider } from "./PageTransition";
import { SmoothScroll } from "./SmoothScroll";
import { RevealObserver } from "./RevealObserver";
import { TabTitle } from "./TabTitle";
import { Toaster } from "./Toaster";
import { Cursor } from "./Cursor";
import { MobileMenu } from "./MobileMenu";
import { ui, uiStore } from "@/lib/stores";
import { useStore } from "@/lib/store";
import { Announcer } from "./Announcer";
import { NotifyDialog } from "@/components/ui/NotifyDialog";
import { hasFinePointer } from "@/lib/device";

// Overlays load on first use (and on idle), keeping them out of the first paint.
const loadCart = () => import("@/components/cart/CartDrawer");
const loadSearch = () => import("@/components/search/SearchOverlay");
const CartDrawer = dynamic(() => loadCart().then((m) => m.CartDrawer), { ssr: false });
const SearchOverlay = dynamic(() => loadSearch().then((m) => m.SearchOverlay), { ssr: false });

/** Once an overlay has opened, keep it mounted so it can animate out. */
function useLatch(flag: boolean) {
  const [latched, setLatched] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-way latch
    if (flag) setLatched(true);
  }, [flag]);
  return latched || flag;
}

function Overlays() {
  const cartOpen = useStore(uiStore, (s) => s.cartOpen);
  const searchOpen = useStore(uiStore, (s) => s.searchOpen);
  const cartUsed = useLatch(cartOpen);
  const searchUsed = useLatch(searchOpen);
  return (
    <>
      {cartUsed && <CartDrawer />}
      {searchUsed && <SearchOverlay />}
    </>
  );
}

function GlobalKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.closest("input, textarea, select, [contenteditable]");
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        ui.openSearch();
      }
    };
    window.addEventListener("keydown", onKey);
    // The bag is tiny and always preloaded. Search carries the catalogue (~30 KB),
    // so phones fetch it on intent (a finger on a search button), not at idle.
    const fine = hasFinePointer();
    const onIntent = (e: PointerEvent) => {
      if ((e.target as Element).closest?.(".hdr-search, .menu-search")) void loadSearch();
    };
    if (!fine) window.addEventListener("pointerdown", onIntent, { capture: true, passive: true });
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const preload = () => {
      void loadCart();
      if (fine) void loadSearch();
    };
    const id = idle ? idle(preload) : window.setTimeout(preload, 2500);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onIntent, { capture: true });
      if (!idle) window.clearTimeout(id);
    };
  }, []);
  return null;
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TransitionProvider>
      <SmoothScroll />
      <RevealObserver />
      <TabTitle />
      <GlobalKeys />
      {children}
      <MobileMenu />
      <Overlays />
      <NotifyDialog />
      <Toaster />
      <Announcer />
      <Cursor />
    </TransitionProvider>
  );
}
