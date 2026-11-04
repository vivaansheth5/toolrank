"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "@/lib/gsap";
import { setLenisRaf } from "@/lib/frame-loop";
import { FINE_POINTER, REDUCED_MOTION } from "@/lib/device";
import { mapWheel, setLenis } from "@/lib/scroll";

/**
 * Lenis smooth scroll on fine pointers only (native scrolling on touch and for
 * reduced motion). Synced to GSAP: lenis.raf runs inside the single ticker
 * loop, ScrollTrigger updates on Lenis scroll, lag smoothing off.
 */
export function SmoothScroll() {
  // Sections with content-visibility: auto report a placeholder height until
  // they first render; re-measure scroll triggers when one does.
  useEffect(() => {
    let t = 0;
    const onState = (e: Event) => {
      if ((e as Event & { skipped?: boolean }).skipped) return;
      window.clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    };
    document.addEventListener("contentvisibilityautostatechange", onState, true);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("contentvisibilityautostatechange", onState, true);
    };
  }, []);

  useEffect(() => {
    const fine = window.matchMedia(FINE_POINTER).matches;
    const reduced = window.matchMedia(REDUCED_MOTION).matches;
    if (!fine || reduced) {
      ScrollTrigger.refresh();
      return;
    }
    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
      anchors: true,
      virtualScroll: mapWheel,
    });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    setLenisRaf((ms) => lenis.raf(ms));
    ScrollTrigger.refresh();
    return () => {
      setLenisRaf(null);
      setLenis(null);
      lenis.destroy();
    };
  }, []);
  return null;
}
