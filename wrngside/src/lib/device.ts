"use client";

import { useSyncExternalStore } from "react";

export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeMQ(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

/** Media query hook; `serverValue` is used during SSR and hydration. */
export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    subscribeMQ(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const matches = (q: string) => typeof window !== "undefined" && window.matchMedia(q).matches;
export const hasFinePointer = () => matches(FINE_POINTER);
export const prefersReducedMotion = () => matches(REDUCED_MOTION);

/** Low-end hardware hint for lite mode (frame-rate watchdog does the rest). */
export function isLowEndDevice() {
  if (typeof navigator === "undefined") return false;
  const hc = navigator.hardwareConcurrency;
  const dm = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return (typeof hc === "number" && hc > 0 && hc <= 4) || (typeof dm === "number" && dm <= 2);
}
