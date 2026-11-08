"use client";

import { gsap } from "./gsap";
import type { SplitText as SplitTextClass } from "gsap/SplitText";

let loading: Promise<typeof SplitTextClass> | null = null;

/** SplitText is only needed below the fold, so it loads on demand. */
export function loadSplitText() {
  loading ??= import("gsap/SplitText").then(({ SplitText }) => {
    gsap.registerPlugin(SplitText);
    return SplitText;
  });
  return loading;
}
