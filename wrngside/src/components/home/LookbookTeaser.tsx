"use client";

import Image from "next/image";
import { useRef } from "react";
import { lookbook, ui } from "@/lib/site-config";
import { gsap, useGSAP } from "@/lib/gsap";
import { REDUCED_MOTION } from "@/lib/device";
import { TLink } from "@/components/ui/TLink";
import { Lines } from "@/components/ui/Lines";
import { fill } from "@/lib/format";

const LAYOUT = [
  { x: 1, y: 2, w: 28, speed: 0.85, rot: -2.5 },
  { x: 36, y: 0, w: 22, speed: 1.15, rot: 1.8 },
  { x: 66, y: 6, w: 30, speed: 0.9, rot: -1.2 },
  { x: 8, y: 54, w: 24, speed: 1.25, rot: 2.2 },
  { x: 36, y: 50, w: 27, speed: 0.8, rot: -2 },
  { x: 77, y: 60, w: 20, speed: 1.1, rot: 3 },
];

/** Parallax collage: images at different depths and tilts; hover straightens and lifts. */
export function LookbookTeaser() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      // Phones and tablets get a plain staggered grid (see home.css): no parallax to overlap it.
      if (!el || window.matchMedia(REDUCED_MOTION).matches || window.matchMedia("(max-width: 1023px)").matches) return;
      el.querySelectorAll<HTMLElement>("[data-speed]").forEach((card) => {
        const s = Number(card.dataset.speed);
        gsap.fromTo(card, { y: (s - 1) * 260 }, { y: (1 - s) * 260, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
    },
    { scope: ref },
  );
  // One card per chapter (the collage has six places, the lookbook six chapters).
  const items = lookbook.chapters.slice(0, LAYOUT.length);
  return (
    <section className="lbt theme-night" aria-labelledby="lbt-title">
      <div className="wrap sec-head">
        <h2 id="lbt-title" className="t-h2">
          <Lines lines={[ui.home.lookbook]} />
          <span className="t-meta lbt-sub">{lookbook.season}</span>
        </h2>
        <TLink href="/lookbook" className="t-meta link-u">
          {ui.home.walkChapters}
        </TLink>
      </div>
      <div ref={ref} className="lbt-collage wrap">
        {items.map((c, i) => {
          const L = LAYOUT[i];
          return (
            <figure key={i} className="lbt-card" data-speed={L.speed} style={{ "--x": `${L.x}%`, "--y": `${L.y}%`, "--w": `${L.w}%`, "--r": `${L.rot}deg` } as React.CSSProperties}>
              <TLink href={`/lookbook#chapter-${c.id}`} className="lbt-link" aria-label={fill(ui.home.chapterLabel, { id: c.id, title: c.title, time: c.time, place: c.place })}>
                <span className="lbt-img">
                  <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 30vw, 60vw" loading="lazy" />
                </span>
              </TLink>
              <figcaption className="t-meta">
                {c.time} — {c.place}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
