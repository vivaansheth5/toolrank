"use client";

/**
 * The ONE per-frame loop. Everything that runs every frame (Lenis, THE LINE
 * physics, parallax, lighting, the cursor, cable wobble) registers here and is
 * driven by gsap.ticker. Subscribers toggle `active` when their section leaves
 * the viewport; rAF itself stops when the tab is hidden.
 */
import { gsap } from "./gsap";

type FrameFn = (time: number, dt: number) => void;
interface Sub {
  fn: FrameFn;
  active: boolean;
  order: number;
}

const subs = new Map<string, Sub>();
let sorted: Sub[] = [];
let installed = false;
let lenisRaf: ((ms: number) => void) | null = null;

function resort() {
  sorted = [...subs.values()].sort((a, b) => a.order - b.order);
}

function tick(time: number, deltaMs: number) {
  if (lenisRaf) lenisRaf(time * 1000);
  // Clamp dt so a stalled tab doesn't explode the physics.
  const dt = Math.min(deltaMs / 1000, 1 / 20);
  for (const s of sorted) if (s.active) s.fn(time, dt);
}

function install() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
}

export function setLenisRaf(fn: ((ms: number) => void) | null) {
  install();
  lenisRaf = fn;
}

export function addFrame(id: string, fn: FrameFn, order = 0) {
  install();
  const sub: Sub = { fn, active: true, order };
  subs.set(id, sub);
  resort();
  return {
    setActive(v: boolean) {
      sub.active = v;
    },
    remove() {
      if (subs.get(id) === sub) {
        subs.delete(id);
        resort();
      }
    },
  };
}

/** Toggle a frame subscriber with an IntersectionObserver on `el`. */
export function activeWhileVisible(el: Element, handle: { setActive: (v: boolean) => void }, rootMargin = "100px") {
  const io = new IntersectionObserver(([e]) => handle.setActive(e.isIntersecting), { rootMargin });
  io.observe(el);
  return () => io.disconnect();
}
