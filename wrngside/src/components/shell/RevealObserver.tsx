"use client";

import { useEffect } from "react";

/**
 * Plays [data-reveal] and inview line reveals once, when they enter the
 * viewport. During a page transition, reveals wait for the lights to come back.
 */
export function RevealObserver() {
  useEffect(() => {
    const html = document.documentElement;
    const pending = new Set<Element>();
    const show = (el: Element) => el.classList.add("is-in");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          if (html.hasAttribute("data-transitioning") || html.hasAttribute("data-loading")) pending.add(e.target);
          else show(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll('[data-reveal]:not(.is-in), .lines[data-mode="inview"]:not(.is-in)').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    };
    scan();
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });
    const flush = () => {
      let i = 0;
      pending.forEach((el) => {
        window.setTimeout(() => show(el), i++ * 50);
      });
      pending.clear();
    };
    window.addEventListener("wrng:page-enter", flush);
    window.addEventListener("wrng:loaded", flush);
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("wrng:page-enter", flush);
      window.removeEventListener("wrng:loaded", flush);
    };
  }, []);
  return null;
}
