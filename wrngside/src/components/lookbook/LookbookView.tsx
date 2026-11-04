"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { lookbook } from "@/lib/site-config";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { FINE_POINTER, REDUCED_MOTION } from "@/lib/device";
import { scrollToY } from "@/lib/scroll";
import { TLink } from "@/components/ui/TLink";
import type { Product } from "@/lib/commerce/types";
import { formatPrice } from "@/lib/format";

/** Full-screen chapters: a pinned horizontal walk on desktop, vertical on phones. */
export function LookbookView({ products }: { products: Record<string, Product> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const n = lookbook.chapters.length;

  useEffect(() => {
    const w = wrap.current;
    const t = track.current;
    if (!w || !t) return;
    const horizontal = window.matchMedia(FINE_POINTER).matches && !window.matchMedia(REDUCED_MOTION).matches;
    w.dataset.mode = horizontal ? "h" : "v";
    if (!horizontal) return;
    const ctx = gsap.context(() => {
      const tween = gsap.to(t, {
        x: () => -(t.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: { trigger: w, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
      });
      // Inner parallax per chapter image, against the horizontal movement.
      t.querySelectorAll<HTMLElement>(".lb-img-inner").forEach((img) => {
        gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: "none", scrollTrigger: { trigger: img.closest(".lb-ch"), containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
    }, w);
    // Deep links: #chapter-03.
    const go = () => {
      const id = window.location.hash.replace("#chapter-", "");
      const i = lookbook.chapters.findIndex((c) => c.id === id);
      if (i < 0) return;
      const top = w.getBoundingClientRect().top + window.scrollY;
      const dist = w.offsetHeight - window.innerHeight;
      scrollToY(top + (dist * i) / Math.max(1, n - 1), { immediate: true });
    };
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      go();
    });
    window.addEventListener("hashchange", go);
    return () => {
      window.removeEventListener("hashchange", go);
      ctx.revert();
    };
  }, [n]);

  return (
    <div ref={wrap} className="lb-wrap" style={{ "--n": n } as React.CSSProperties}>
      <div className="lb-sticky">
        <div ref={track} className="lb-track">
          {lookbook.chapters.map((c, i) => (
            <section key={c.id} id={`chapter-${c.id}`} className="lb-ch" aria-labelledby={`lb-t-${c.id}`}>
              <div className="lb-img" data-reveal="img">
                <div className="reveal-inner">
                  <div className="lb-img-inner">
                    <Image src={c.image} alt={`${c.title}: ${c.place} at ${c.time}`} fill sizes="(min-width: 1024px) 55vw, 100vw" preload={i === 0} loading={i === 0 ? "eager" : "lazy"} />
                  </div>
                </div>
              </div>
              <div className="lb-copy">
                <p className="t-meta">
                  CHAPTER {c.id} / {String(n).padStart(2, "0")}
                </p>
                <h2 id={`lb-t-${c.id}`} className="t-display lb-title">
                  {c.title}
                </h2>
                <p className="t-meta lb-cap">
                  {c.time} — {c.place}
                </p>
                <p className="t-lead">{c.text}</p>
                <ul className="lb-products" aria-label="In this chapter">
                  {c.products.map((h) => {
                    const p = products[h];
                    if (!p) return null;
                    return (
                      <li key={h}>
                        <TLink href={`/products/${h}`} className="lb-prod">
                          <span>{p.title}</span>
                          <span className="t-meta">
                            {p.wrng.type} · {formatPrice(p.wrng.price)}
                          </span>
                        </TLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
