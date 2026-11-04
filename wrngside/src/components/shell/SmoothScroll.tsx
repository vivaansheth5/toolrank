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
