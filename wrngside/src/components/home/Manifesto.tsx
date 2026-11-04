"use client";

import { useEffect, useRef } from "react";
import { copy, site } from "@/lib/site-config";
import { REDUCED_MOTION } from "@/lib/device";
import { ScrollTrigger } from "@/lib/gsap";

/** One huge statement, scrubbed word by word from 15% to 100% opacity. */
export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const words = copy.manifesto.split(" ");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = [...el.querySelectorAll<HTMLSpanElement>(".mw")];
    if (window.matchMedia(REDUCED_MOTION).matches) {
      spans.forEach((s) => (s.style.opacity = "1"));
      return;
    }
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 78%",
      end: "bottom 45%",
      onUpdate: (self) => {
        const n = spans.length;
        spans.forEach((s, i) => {
          const t = Math.max(0, Math.min(1, self.progress * (n + 2) - i));
          s.style.opacity = String(0.15 + 0.85 * t);
        });
      },
    });
    return () => st.kill();
  }, []);
  return (
    <div className="manifesto wrap">
      <h2 className="t-display manifesto-text" ref={ref} tabIndex={-1} aria-label={copy.manifesto}>
        {words.map((w, i) => (
          <span key={i} className={`mw${w.includes("CROSSED") || w.includes("OVER") ? " mw-x" : ""}`} aria-hidden="true">
            {w}{" "}
          </span>
        ))}
      </h2>
      <p className="t-meta manifesto-cap">
        EST. {site.established} — {site.city}, {site.country}
      </p>
    </div>
  );
}
