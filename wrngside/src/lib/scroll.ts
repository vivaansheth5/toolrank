"use client";

import type Lenis from "lenis";
import type { VirtualScrollData } from "lenis";

/** Unified scrolling API: Lenis on fine pointers, native everywhere else. */
let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};
export const getLenis = () => lenis;

export function getScrollY() {
  return lenis ? lenis.scroll : window.scrollY;
}

export function scrollToY(y: number, opts: { immediate?: boolean; duration?: number; easing?: (t: number) => number; onComplete?: () => void } = {}) {
  if (lenis) {
    lenis.scrollTo(y, { immediate: opts.immediate, duration: opts.duration ?? 1.1, easing: opts.easing, force: true, onComplete: opts.onComplete ? () => opts.onComplete!() : undefined });
  } else {
    window.scrollTo({ top: y, behavior: opts.immediate ? "instant" : "smooth" });
    if (opts.onComplete) setTimeout(opts.onComplete, opts.immediate ? 0 : 600);
  }
}

/** THE LINE installs this while pinned to turn sideways trackpad swipes into scroll. */
let wheelMapper: ((data: VirtualScrollData) => void) | null = null;
export const setWheelMapper = (fn: typeof wheelMapper) => {
  wheelMapper = fn;
};
export const mapWheel = (data: VirtualScrollData) => {
  wheelMapper?.(data);
  return true;
};

/* ───────────── scroll lock (drawers, menus, modals) ───────────── */
let locks = 0;
const listeners = new Set<(locked: boolean) => void>();
export function lockScroll() {
  locks++;
  if (locks === 1) apply(true);
  return () => {
    locks = Math.max(0, locks - 1);
    if (locks === 0) apply(false);
  };
}
function apply(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.classList.toggle("scroll-locked", locked);
  listeners.forEach((l) => l(locked));
}
export const onScrollLock = (fn: (locked: boolean) => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/* ───────────── navigation type (for back-button memory) ───────────── */
let navType: "push" | "pop" = "push";
export const getNavType = () => navType;
export const setNavType = (t: "push" | "pop") => {
  navType = t;
};
