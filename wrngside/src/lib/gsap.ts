"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

let registered = false;
if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);
  // Brief easings: entrances, wipes/page transitions, UI.
  CustomEase.create("entrance", ".16,1,.3,1");
  CustomEase.create("wipe", ".76,0,.24,1");
  CustomEase.create("ui", ".2,.8,.2,1");
  gsap.defaults({ ease: "entrance", duration: 0.8 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export const EASE = {
  entrance: "cubic-bezier(.16,1,.3,1)",
  wipe: "cubic-bezier(.76,0,.24,1)",
  ui: "cubic-bezier(.2,.8,.2,1)",
} as const;

export { gsap, ScrollTrigger, useGSAP };
