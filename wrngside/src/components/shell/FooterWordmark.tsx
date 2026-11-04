"use client";

import { useEffect, useRef } from "react";
import { addFrame, activeWhileVisible } from "@/lib/frame-loop";
import { FINE_POINTER, REDUCED_MOTION } from "@/lib/device";

const REST = { w: 100, g: 640 };
const PEAK = { w: 125, g: 900 };

/** Edge-to-edge wordmark; letters swell in width and weight as the cursor passes. */
export function FooterWordmark() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || !window.matchMedia(FINE_POINTER).matches || window.matchMedia(REDUCED_MOTION).matches) return;
    const letters = [...el.querySelectorAll<HTMLSpanElement>(".wm-ch")];
    const state = letters.map(() => ({ t: 0, cur: -1 }));
    let mx = -9999;
    let my = -9999;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    // Cells have fixed widths, so measure them once (document space) and on resize.
    let cells: { x: number; y: number; w: number }[] = [];
    const measure = () => {
      cells = letters.map((l) => {
        const r = l.parentElement!.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + window.scrollY + r.height / 2, w: r.width };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const loop = addFrame("footer-wordmark", (_t, dt) => {
      const k = 1 - Math.pow(1 - 0.12, dt * 60);
      const sy = window.scrollY;
      letters.forEach((l, i) => {
        const r = { width: cells[i].w };
        const cx = cells[i].x;
        const cy = cells[i].y - sy;
        const d = Math.hypot(mx - cx, (my - cy) * 0.6);
        const target = Math.max(0, 1 - d / (r.width * 2.2));
        const s = state[i];
        s.t += (target * target * (3 - 2 * target) - s.t) * k;
        const q = Math.round(s.t * 200) / 200;
        if (q !== s.cur) {
          s.cur = q;
          l.style.fontVariationSettings = `"wdth" ${REST.w + (PEAK.w - REST.w) * q}, "wght" ${REST.g + (PEAK.g - REST.g) * q}`;
        }
      });
    });
    loop.setActive(false);
    const stop = activeWhileVisible(
      el,
      {
        setActive: (v) => {
          if (v) measure();
          loop.setActive(v);
        },
      },
      "0px",
    );
    return () => {
      stop();
      ro.disconnect();
      loop.remove();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return (
    <div ref={root} className="wordmark" aria-hidden="true">
      {"WRNGSIDE".split("").map((ch, i) => (
        <span key={i} className="wm-cell">
          <span className={`wm-ch${i === 2 ? " wm-n" : ""}`}>{ch}</span>
        </span>
      ))}
    </div>
  );
}
