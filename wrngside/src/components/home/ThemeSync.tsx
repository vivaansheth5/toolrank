"use client";

import { useEffect } from "react";
import { site } from "@/lib/site-config";

/** theme-color follows the lighting state: night over THE LINE, daylight after LIGHTS ON. */
export function ThemeSync({ targetId }: { targetId: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!el) return;
    const apply = (day: boolean) => {
      meta?.setAttribute("content", day ? site.themeColor.day : site.themeColor.night);
      document.documentElement.dataset.light = day ? "day" : "night";
    };
    const io = new IntersectionObserver(([e]) => apply(e.boundingClientRect.top <= window.innerHeight * 0.5), { threshold: [0, 0.01, 0.5, 1], rootMargin: "0px 0px -50% 0px" });
    io.observe(el);
    const onScroll = () => apply(el.getBoundingClientRect().top <= window.innerHeight * 0.5);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      delete document.documentElement.dataset.light;
      meta?.setAttribute("content", site.themeColor.night);
    };
  }, [targetId]);
  return null;
}
