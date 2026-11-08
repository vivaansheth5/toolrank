"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { REDUCED_MOTION } from "@/lib/device";

/** Scroll-scrubbed type: words go from 15% to 100% opacity as you read down. */
export function ScrubText({ text, as: Tag = "p", className = "" }: { text: string; as?: "p" | "h2" | "h3"; className?: string }) {
  const ref = useRef<HTMLElement>(null);
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
      start: "top 82%",
      end: "bottom 55%",
      onUpdate: (self) => {
        const n = spans.length;
        spans.forEach((s, i) => (s.style.opacity = String(0.15 + 0.85 * Math.max(0, Math.min(1, self.progress * (n + 1) - i)))));
      },
    });
    return () => st.kill();
  }, []);
  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="mw" aria-hidden="true">
          {w}{" "}
        </span>
      ))}
    </Tag>
  );
}
