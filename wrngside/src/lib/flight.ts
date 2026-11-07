"use client";

/**
 * Shared-element flight: a garment lifts off THE LINE and lands in the product
 * page's main image (FLIP with GSAP; works without the View Transitions API).
 */
import { gsap } from "./gsap";

interface Flight {
  handle: string;
  clone: HTMLImageElement;
  from: DOMRect;
  rotation: number;
  started: number;
}

let current: Flight | null = null;

export const hasPendingFlight = () => Boolean(current);

export function launchFlight(handle: string, source: HTMLElement, src: string, rotation = 0) {
  cancelFlight();
  const r = source.getBoundingClientRect();
  const clone = document.createElement("img");
  clone.src = src;
  clone.alt = "";
  clone.setAttribute("aria-hidden", "true");
  clone.className = "flight-clone";
  Object.assign(clone.style, {
    position: "fixed",
    left: `${r.left}px`,
    top: `${r.top}px`,
    width: `${r.width}px`,
    height: `${r.height}px`,
    zIndex: "160",
    pointerEvents: "none",
    objectFit: "contain",
    transformOrigin: "50% 0%",
    transform: `rotate(${rotation}deg)`,
    filter: "drop-shadow(0 30px 40px rgb(0 0 0 / .45))",
  });
  document.body.appendChild(clone);
  // Lift: rise a little toward the viewer while the page goes dark.
  gsap.to(clone, { y: -18, scale: 1.06, rotation: 0, duration: 0.5, ease: "entrance" });
  current = { handle, clone, from: r, rotation, started: performance.now() };
  // Safety: never leave a stray clone behind.
  window.setTimeout(() => {
    if (current && current.clone === clone) cancelFlight();
  }, 6000);
}

export function cancelFlight() {
  if (!current) return;
  const c = current.clone;
  current = null;
  gsap.to(c, { opacity: 0, duration: 0.3, onComplete: () => c.remove() });
}

/** Land the pending flight for `handle` into `target`. Resolves when done. */
export function landFlight(handle: string, target: HTMLElement): Promise<boolean> {
  if (!current || current.handle !== handle) return Promise.resolve(false);
  const f = current;
  current = null;
  const clone = f.clone;
  const t = target.getBoundingClientRect();
  // Fit the cutout into the frame the way the product shot frames it.
  const pad = 0.12;
  const box = { x: t.left + t.width * pad, y: t.top + t.height * pad, w: t.width * (1 - pad * 2), h: t.height * (1 - pad * 2) };
  // Freeze the clone where it currently is, without transforms, then FLIP.
  gsap.killTweensOf(clone);
  const cur = clone.getBoundingClientRect();
  gsap.set(clone, { clearProps: "transform" });
  Object.assign(clone.style, { left: `${cur.left}px`, top: `${cur.top}px`, width: `${cur.width}px`, height: `${cur.height}px`, transformOrigin: "0% 0%" });
  const aspect = cur.width / Math.max(1, cur.height);
  let w = box.w;
  let h = w / aspect;
  if (h > box.h) {
    h = box.h;
    w = h * aspect;
  }
  const toX = box.x + (box.w - w) / 2;
  const toY = box.y + (box.h - h) / 2;
  const scale = w / cur.width;
  const dx = toX - cur.left;
  const dy = toY - cur.top;
  return new Promise((resolve) => {
    gsap
      .timeline({
        onComplete: () => {
          gsap.to(clone, { opacity: 0, duration: 0.35, ease: "ui", onComplete: () => clone.remove() });
          resolve(true);
        },
      })
      .to(clone, { x: dx, duration: 0.9, ease: "power2.inOut" }, 0)
      .to(clone, { y: dy, duration: 0.9, ease: "power3.out" }, 0)
      .to(clone, { scale, duration: 0.9, ease: "entrance", filter: "drop-shadow(0 6px 10px rgb(0 0 0 / .15))" }, 0);
  });
}
