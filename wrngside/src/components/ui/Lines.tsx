"use client";

import { useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/device";
import { loadSplitText } from "@/lib/split-text";

/**
 * Headline line reveal: each line rises from 110% inside an overflow-hidden
 * mask (60ms stagger).
 *
 * "mount" plays on mount in pure CSS, so above-the-fold headlines (often the
 * LCP element) never wait for JavaScript. Lines are the authored ones.
 *
 * "inview" waits for the RevealObserver. Shortly before the headline scrolls
 * in, GSAP SplitText splits it into its real visual lines, so a heading that
 * wraps on a phone still rises line by line. It re-splits on resize and when
 * fonts load (autoSplit), and is reverted on unmount by useGSAP.
 */
export function Lines({ lines, mode = "inview", delay = 0, className = "" }: { lines: string[]; mode?: "mount" | "inview"; delay?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const el = ref.current;
      if (mode !== "inview" || !el || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
      let alive = true;
      const split = contextSafe!((SplitText: Awaited<ReturnType<typeof loadSplitText>>) => {
        if (!alive) return;
        const index = () => el.querySelectorAll<HTMLElement>(".sl").forEach((l, i) => l.style.setProperty("--i", String(i)));
        el.querySelectorAll<HTMLElement>(".ln > span").forEach((part) => {
          SplitText.create(part, { type: "lines", tag: "span", linesClass: "sl", mask: "lines", aria: "none", autoSplit: true, onSplit: index });
        });
        index();
        el.setAttribute("data-split", "");
      });
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          void loadSplitText().then(split);
        },
        { rootMargin: "100%" },
      );
      io.observe(el);
      return () => {
        alive = false;
        io.disconnect();
        el.removeAttribute("data-split");
      };
    },
    { scope: ref, dependencies: [mode, lines.join("\n")], revertOnUpdate: true },
  );

  return (
    <span ref={ref} className={`lines ${className}`} data-mode={mode} style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      {lines.map((l, i) => (
        <span key={`${i}:${l}`} className="ln" style={{ "--i": i } as React.CSSProperties}>
          <span>{l}</span>
        </span>
      ))}
    </span>
  );
}
