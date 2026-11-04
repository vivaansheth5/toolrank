"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/commerce/types";
import { landFlight, hasPendingFlight } from "@/lib/flight";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { FINE_POINTER, REDUCED_MOTION } from "@/lib/device";
import { ZoomOverlay } from "./ZoomOverlay";
import { ui } from "@/lib/site-config";
import { fill } from "@/lib/format";

export interface GalleryImage {
  src: string;
  alt: string;
}

/**
 * Desktop: large images stacked, each with subtle inner parallax. Mobile: a
 * full-width swipe gallery with a progress cable and counter. The first image
 * is the landing pad for the garment flying in from THE LINE, and flips in 3D
 * to show the garment inside out (SEE THE WRONG SIDE).
 */
export function ProductGallery({ product, images, wrongSide, insideOut, tint }: { product: Product; images: GalleryImage[]; wrongSide: boolean; insideOut: string; tint: string }) {
  const root = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  const [landing, setLanding] = useState(() => typeof window !== "undefined" && hasPendingFlight());

  // Land the flight from THE LINE.
  useEffect(() => {
    if (!first.current || !hasPendingFlight()) return;
    void landFlight(product.handle, first.current).then(() => setLanding(false));
  }, [product.handle]);

  // Inner parallax (desktop, not reduced motion).
  useGSAP(
    () => {
      const el = root.current;
      if (!el || !window.matchMedia(FINE_POINTER).matches || window.matchMedia(REDUCED_MOTION).matches) return;
      el.querySelectorAll<HTMLElement>(".gal-item").forEach((item) => {
        const inner = item.querySelector(".gal-parallax");
        if (!inner) return;
        gsap.fromTo(inner, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true } });
      });
      ScrollTrigger.refresh();
    },
    { scope: root, dependencies: [images], revertOnUpdate: true },
  );

  // Mobile swipe progress.
  useEffect(() => {
    const s = strip.current;
    if (!s) return;
    const onScroll = () => setIndex(Math.round(s.scrollLeft / Math.max(1, s.clientWidth)));
    s.addEventListener("scroll", onScroll, { passive: true });
    return () => s.removeEventListener("scroll", onScroll);
  }, []);

  const n = images.length;
  return (
    <div ref={root} className="gallery">
      <div ref={strip} className="gal-strip no-scrollbar" aria-roledescription="carousel" aria-label={`${product.title} images`}>
        {images.map((img, i) => (
          <figure key={img.src} className="gal-item" aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}>
            <button type="button" className="gal-btn" onClick={() => setZoom(i)} aria-label={fill(ui.product.zoomLabel, { alt: img.alt })} data-cursor="view">
              {i === 0 ? (
                <div ref={first} className="flip" data-wrong={wrongSide || undefined} data-landing={landing || undefined}>
                  <div className="flip-face flip-front gal-parallax">
                    <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" preload className="gal-img" style={{ backgroundColor: "var(--dust)" }} />
                  </div>
                  <div className="flip-face flip-back">
                    <Image src={insideOut} alt={`${product.title} turned inside out: seams, labels and the reverse of the fabric`} fill sizes="(min-width: 1024px) 58vw, 100vw" className="gal-img" />
                  </div>
                </div>
              ) : (
                <div className="gal-frame">
                  <div className="gal-parallax">
                    <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" loading="lazy" className="gal-img" style={{ backgroundColor: i === n - 1 ? "#111" : tint }} />
                  </div>
                </div>
              )}
            </button>
          </figure>
        ))}
      </div>
      <div className="gal-progress" aria-hidden="true">
        <span className="t-meta tabular">
          {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        <svg viewBox="0 0 200 12" preserveAspectRatio="none">
          <path d="M0 2 Q100 10 200 2" className="lm-track" />
          <path d="M0 2 Q100 10 200 2" className="lm-fill" pathLength={1} style={{ strokeDasharray: `${(index + 1) / n} 1` }} />
        </svg>
      </div>
      {zoom !== null && <ZoomOverlay images={images} start={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}
