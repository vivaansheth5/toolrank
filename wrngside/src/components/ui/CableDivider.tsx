"use client";

import { useEffect, useRef } from "react";
import { addFrame, activeWhileVisible } from "@/lib/frame-loop";
import { REDUCED_MOTION } from "@/lib/device";

/**
 * Section divider: a thin cable that sags slightly and wobbles when you scroll
 * past it fast. Carries THE LINE motif through the whole site.
 */
export function CableDivider({ className = "", sag = 10 }: { className?: string; sag?: number }) {
  const path = useRef<SVGPathElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const restD = `M0 4 Q500 ${4 + sag * 2} 1000 4`;

  useEffect(() => {
    const p = path.current;
    const s = svg.current;
    if (!p || !s || window.matchMedia(REDUCED_MOTION).matches) return;
    let lastY = window.scrollY;
    let y = 0;
    let v = 0;
    let lastD = "";
    const loop = addFrame(`cable-${Math.random().toString(36).slice(2)}`, (_t, dt) => {
      const sy = window.scrollY;
      const speed = (sy - lastY) / Math.max(dt, 1 / 120);
      lastY = sy;
      // Fast scroll pulls the cable down; spring brings it back with a wobble.
      const force = Math.min(Math.abs(speed), 4000) * 0.0025;
      const acc = -90 * y - 4.5 * v + force * 6;
      v += acc * dt;
      y += v * dt;
      const mid = 4 + sag * 2 + y * 2;
      const d = `M0 4 Q500 ${mid.toFixed(2)} 1000 4`;
      if (d !== lastD) {
        p.setAttribute("d", d);
        lastD = d;
      }
    });
    loop.setActive(false);
    const stop = activeWhileVisible(s, loop, "50px");
    return () => {
      stop();
      loop.remove();
    };
  }, [sag]);

  return (
    <svg ref={svg} className={`cable-divider ${className}`} viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path ref={path} d={restD} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
