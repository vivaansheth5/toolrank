"use client";

import { useRef, useState } from "react";
import type { Product } from "@/lib/commerce/types";
import { badgesFor, type Badge } from "@/lib/commerce/helpers";
import { addToBag } from "@/lib/commerce/actions";
import { TLink } from "@/components/ui/TLink";
import { ProductImage } from "@/components/ui/ProductImage";
import { Price } from "@/components/ui/Price";
import { SaveButton } from "@/components/ui/SaveButton";
import { openNotify } from "@/components/ui/NotifyDialog";
import { useDropUnlocked } from "@/lib/stores";
import { formatDropSlot, fill } from "@/lib/format";
import { prefersReducedMotion } from "@/lib/device";
import "./shop.css";
import { ui, copy } from "@/lib/site-config";

const BADGE_CLASS: Record<Badge, string> = {
  NEW: "badge",
  "LOW STOCK": "badge badge-signal",
  "SOLD OUT": "badge badge-outline",
  RESTOCKING: "badge badge-outline",
  LIMITED: "badge badge-outline",
  LOCKED: "badge",
};

/**
 * Product card: 4:5 images on dust, leading with the side the print is on.
 * Swipe the image (or use the arrow, with a mouse) to see the other side;
 * dots show which. Desktop hover slides up a quick-add size row. Badges come
 * from real stock.
 */
export function ProductCard({ product: p, now, priority = false, sizes = "(min-width: 1024px) 25vw, 50vw" }: { product: Product; now: number; priority?: boolean; sizes?: string }) {
  const unlocked = useDropUnlocked(p.wrng.drop);
  const badges = badgesFor(p, now, unlocked);
  const locked = badges.includes("LOCKED");
  const soldOut = !p.availableForSale;
  const colour = p.wrng.colours[0];
  // Lead with the side the print is on; hover shows the other.
  const lead = p.wrng.lead;
  const other = lead === "back" ? "front" : "back";
  const [adding, setAdding] = useState<string | null>(null);
  const strip = useRef<HTMLSpanElement>(null);
  const [slide, setSlide] = useState(0);
  const showSlide = (i: number) => {
    const s = strip.current;
    if (s) s.scrollTo({ left: i * s.clientWidth, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };
  const href = `/products/${p.handle}`;

  return (
    <article className="pcard" data-soldout={soldOut || undefined} data-locked={locked || undefined} data-flip-id={p.handle}>
      <div className="pcard-media">
        <TLink href={href} className="pcard-link" data-cursor={soldOut ? "soldout" : "view"} aria-label={`${p.title} ${p.wrng.type}`}>
          <span
            ref={strip}
            className="pcard-strip no-scrollbar"
            onScroll={(e) => {
              const s = e.currentTarget;
              const i = Math.round(s.scrollLeft / Math.max(1, s.clientWidth));
              if (i !== slide) setSlide(i);
            }}
          >
            <span className="pcard-img">
              <ProductImage src={colour.media[lead]} alt={`${p.title} ${p.wrng.type} in ${colour.name}, ${lead}`} sizes={sizes} tint={colour.hex} priority={priority} />
            </span>
            <span className="pcard-img" aria-hidden="true">
              <ProductImage src={colour.media[other]} alt="" sizes={sizes} tint={colour.hex} />
            </span>
          </span>
          {soldOut && (
            <span className="stamp" aria-hidden="true">
              {ui.common.soldOut}
            </span>
          )}
        </TLink>
        <span className="pcard-dots" aria-hidden="true">
          <i data-on={slide === 0 || undefined} />
          <i data-on={slide === 1 || undefined} />
        </span>
        <button type="button" className="pcard-flip" onClick={() => showSlide(slide ? 0 : 1)} aria-label={fill(ui.common.showSide, { side: slide ? lead : other, title: p.title })}>
          <span aria-hidden="true">{slide ? "←" : "→"}</span>
        </button>
        <div className="pcard-badges">
          {badges
            .filter((b) => b !== "LOCKED")
            .map((b) => (
              <span key={b} className={BADGE_CLASS[b]}>
                {b}
              </span>
            ))}
          {locked && p.wrng.releaseAt && <span className="badge">{fill(ui.common.dropsAt, { slot: formatDropSlot(p.wrng.releaseAt) })}</span>}
        </div>
        <SaveButton product={p} className="pcard-save" />
        <div className="pcard-quick" role="group" aria-label={fill(ui.common.quickAddLabel, { title: p.title })}>
          {soldOut || locked ? (
            <button type="button" className="pcard-notify t-meta" onClick={() => openNotify(p)}>
              {locked ? ui.common.notifyWhenDrops : p.wrng.restocking ? ui.common.notifyRestocking : copy.ctas.notifyMe}
            </button>
          ) : (
            <>
              <span className="t-meta pcard-quick-label">{ui.common.quickAdd}</span>
              <span className="pcard-sizes">
                {p.wrng.sizes.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    className="pcard-size"
                    disabled={!s.available}
                    data-loading={adding === s.label || undefined}
                    aria-label={s.available ? fill(ui.common.addSizeLabel, { title: p.title, size: s.label }) : fill(ui.common.soldOutSizeLabel, { title: p.title, size: s.label })}
                    onClick={() => {
                      setAdding(s.label);
                      window.setTimeout(() => {
                        addToBag(p, colour.name, s.label);
                        setAdding(null);
                      }, 260);
                    }}
                  >
                    {s.label.replace(ui.common.oneSize, "OS").replace("UK ", "")}
                  </button>
                ))}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="pcard-info">
        <h3 className="pcard-title">
          <TLink href={href}>{p.title}</TLink>
        </h3>
        <Price amount={p.wrng.price} compareAt={p.wrng.compareAtPrice} className="pcard-price" />
        <p className="t-meta text-muted pcard-meta">
          {p.wrng.type}
          {p.wrng.colours.length > 1 ? ` · ${fill(ui.common.colourCount, { n: p.wrng.colours.length })}` : ""}
        </p>
      </div>
    </article>
  );
}
