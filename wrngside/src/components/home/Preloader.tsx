"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { copy } from "@/lib/site-config";
import { InlineScript } from "@/components/ui/InlineScript";

// Decide before first paint: skip if already seen this session or reduced motion.
const gate = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem('wrng:loaded')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.setAttribute('data-preloaded','');}else{d.setAttribute('data-loading','');}}catch(e){d.setAttribute('data-preloaded','');}})();`;

/**
 * First visit per session (1.8s max): black screen, counter 000→100 tied to
 * real loading (fonts + first hero images), "CHARGING THE LINE". The scene is
 * server-rendered underneath, so the loader never delays content.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const html = document.documentElement;
    const el = root.current;
    if (!el || html.hasAttribute("data-preloaded") || !html.hasAttribute("data-loading")) {
      html.removeAttribute("data-loading");
      return;
    }
    const started = performance.now();
    const shown = { v: 0 };
    let target = 0;
    let finished = false;
    const tasks: Promise<unknown>[] = [];
    tasks.push(document.fonts?.ready ?? Promise.resolve());
    const imgs = [...document.querySelectorAll<HTMLImageElement>(".g img")].slice(0, 4);
    imgs.forEach((img) =>
      tasks.push(
        img.complete
          ? Promise.resolve()
          : new Promise((r) => {
              img.addEventListener("load", r, { once: true });
              img.addEventListener("error", r, { once: true });
            }),
      ),
    );
    ["/scene/buildings.svg", "/scene/wall.svg", "/scene/sky.svg"].forEach((src) => {
      tasks.push(
        new Promise((r) => {
          const i = new Image();
          i.onload = i.onerror = () => r(null);
          i.src = src;
        }),
      );
    });
    let done = 0;
    tasks.forEach((t) => void t.then(() => ((done += 1), (target = done / tasks.length))));
    const render = () => {
      if (num.current) num.current.textContent = String(Math.round(shown.v * 100)).padStart(3, "0");
    };
    const tick = () => {
      if (finished) return;
      const elapsed = (performance.now() - started) / 1000;
      // Never more than 1.8s: time pushes the counter if loading is slow.
      const floor = Math.min(1, elapsed / 1.8);
      const goal = Math.max(target * 0.96, floor);
      shown.v += (goal - shown.v) * 0.18;
      render();
      if ((target >= 1 && shown.v > 0.985) || elapsed >= 1.8) finish();
      else requestAnimationFrame(tick);
    };
    const finish = () => {
      finished = true;
      shown.v = 1;
      render();
      try {
        sessionStorage.setItem("wrng:loaded", "1");
      } catch {}
      window.dispatchEvent(new Event("wrng:intro"));
      gsap.to(el, {
        opacity: 0,
        duration: 0.45,
        delay: 0.12,
        ease: "ui",
        onComplete: () => {
          el.style.display = "none";
        },
      });
      // Headline reveals after the garments have dropped onto the cable.
      window.setTimeout(() => {
        html.removeAttribute("data-loading");
        window.dispatchEvent(new Event("wrng:loaded"));
      }, 1500);
    };
    requestAnimationFrame(tick);
    return () => {
      finished = true;
    };
  }, []);
  return (
    <>
      <div ref={root} id="preloader" className="preloader" aria-hidden="true">
        <span ref={num} className="preloader-num tabular">
          000
        </span>
        <span className="preloader-label t-meta">{copy.loader}</span>
        <span className="preloader-wire" />
      </div>
      <InlineScript html={gate} />
    </>
  );
}
