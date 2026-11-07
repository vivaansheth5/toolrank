"use client";

import { gsap } from "./gsap";
import { prefersReducedMotion } from "./device";

/** A small copy of the product image flies on a curved path into the header bag. */
export function flyToBag(from: HTMLElement, src: string) {
  const bag = document.querySelector<HTMLElement>("[data-bag-target]");
  if (!bag || prefersReducedMotion()) return Promise.resolve();
  const a = from.getBoundingClientRect();
  const b = bag.getBoundingClientRect();
  const size = Math.min(a.width, 140);
  const img = document.createElement("img");
  img.src = src;
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  Object.assign(img.style, {
    position: "fixed",
    left: `${a.left + a.width / 2 - size / 2}px`,
    top: `${a.top + a.height / 2 - (size * 1.25) / 2}px`,
    width: `${size}px`,
    height: `${size * 1.25}px`,
    objectFit: "cover",
    zIndex: "165",
    pointerEvents: "none",
    boxShadow: "var(--e3)",
  });
  document.body.appendChild(img);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  return new Promise<void>((resolve) => {
    gsap
      .timeline({ onComplete: () => (img.remove(), resolve()) })
      .to(img, { x: dx, duration: 0.85, ease: "power1.in" }, 0)
      .to(img, { y: dy, duration: 0.85, ease: "back.in(1.6)" }, 0)
      .to(img, { scale: 0.12, rotation: -12, duration: 0.85, ease: "power2.in" }, 0)
      .to(img, { opacity: 0, duration: 0.15 }, 0.72);
  });
}
