"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/commerce/types";
import { addToBag } from "@/lib/commerce/actions";
import { isLocked, variantFor, totalStock } from "@/lib/commerce/helpers";
import { commerce, copy, legal, policies, sizeCharts, type SizeChartKey, ui } from "@/lib/site-config";
import { fill, formatDropSlot, formatPrice, countdownParts, pad2 } from "@/lib/format";
import { pushRecent, toast, useDropUnlocked } from "@/lib/stores";
import { useNow } from "@/lib/hooks";
import { flyToBag } from "@/lib/fly-to-bag";
import { ProductGallery } from "./ProductGallery";
import { SizeGuideDrawer } from "./SizeGuide";
import { Pincode } from "./Pincode";
import { Accordion } from "@/components/ui/Accordion";
import { SaveButton } from "@/components/ui/SaveButton";
import { openNotify } from "@/components/ui/NotifyDialog";
import { TLink } from "@/components/ui/TLink";
import { useNavigate } from "@/components/shell/PageTransition";
import { Lines } from "@/components/ui/Lines";
import "./product.css";

type AddState = "idle" | "loading" | "added";

export function ProductView({ product: p, renderedAt, dropLabel }: { product: Product; renderedAt: number; dropLabel: string }) {
  const [ci, setCi] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [wrong, setWrong] = useState(false);
  const [guide, setGuide] = useState(false);
  const [add, setAdd] = useState<AddState>("idle");
  const [sizeError, setSizeError] = useState(false);
  const [sticky, setSticky] = useState(false);
  const now = useNow(1000) ?? renderedAt;
  const unlocked = useDropUnlocked(p.wrng.drop);
  const locked = isLocked(p, now, unlocked);
  const colour = p.wrng.colours[ci];
  const soldOut = !p.availableForSale;
  const addBtn = useRef<HTMLButtonElement>(null);
  const sizesRef = useRef<HTMLFieldSetElement>(null);
  const navigate = useNavigate();
  const oneSize = p.wrng.sizes.length === 1;

  useEffect(() => {
    pushRecent(p.handle);
  }, [p.handle]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-size products are preselected
    if (oneSize && p.wrng.sizes[0].available) setSize(p.wrng.sizes[0].label);
  }, [oneSize, p.wrng.sizes]);

  // Sticky bar on phones once the main button scrolls away.
  useEffect(() => {
    const b = addBtn.current;
    if (!b) return;
    const io = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(b);
    return () => io.disconnect();
  }, []);

  const images = useMemo(
    () => [
      // The side the print is on comes first: it's where the flight from THE LINE lands.
      ...(p.wrng.lead === "back" ? (["back", "front"] as const) : (["front", "back"] as const)).map((side) => ({ src: colour.media[side], alt: `${p.title} ${p.wrng.type} in ${colour.name}, ${side}` })),
      ...colour.media.views.map((v) => ({ src: v.src, alt: `${p.title} ${p.wrng.type} in ${colour.name}, ${v.label}` })),
      ...colour.media.model.map((m) => ({ src: m, alt: `${p.title} ${p.wrng.type} in ${colour.name}, hanging on the line at night` })),
    ],
    [colour, p],
  );

  const doAdd = async (buyNow = false) => {
    if (!size) {
      setSizeError(true);
      sizesRef.current?.querySelector<HTMLElement>("button:not([aria-disabled='true'])")?.focus();
      sizesRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    setAdd("loading");
    const img = document.querySelector<HTMLElement>(".flip") ?? document.body;
    await new Promise((r) => window.setTimeout(r, 420));
    const ok = addToBag(p, colour.name, size, { openDrawer: !buyNow, quiet: buyNow });
    if (!ok) {
      setAdd("idle");
      toast(copy.errors.generic);
      return;
    }
    if (!buyNow) void flyToBag(img, images[0].src);
    setAdd("added");
    window.setTimeout(() => setAdd("idle"), 1800);
    if (buyNow) void navigate("/checkout");
  };

  const cd = p.wrng.releaseAt ? countdownParts(Date.parse(p.wrng.releaseAt) - now) : null;
  const stockTotal = totalStock(p);
  const chart = p.wrng.sizeChart as SizeChartKey;
  const selectedVariant = size ? variantFor(p, colour.name, size) : undefined;

  const accordions = [
    {
      title: ui.product.accordions.details,
      content: (
        <>
          <p>{p.description}</p>
          <ul className="dash-list">
            {p.wrng.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </>
      ),
    },
    {
      title: ui.product.accordions.fabric,
      content: (
        <p>
          {p.wrng.fabric}
          {p.wrng.gsm ? ` ${fill(ui.product.weight, { gsm: p.wrng.gsm })}` : ""}
        </p>
      ),
    },
    { title: ui.product.accordions.fit, content: <p>{p.wrng.fit}</p> },
    {
      title: ui.product.accordions.care,
      content: (
        <ul className="dash-list">
          {p.wrng.care.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      ),
    },
    {
      title: ui.product.accordions.shipping,
      content: (
        <>
          <p>{fill(policies.shipping.intro, { threshold: commerce.freeShippingThreshold.toLocaleString("en-IN"), fee: commerce.standardShipping })}</p>
          <p>
            {fill(ui.product.exchangesReturns, { exchange: commerce.exchangeWindowDays, returns: commerce.returnWindowDays })}{" "}
            <TLink href="/help/returns" className="link-u">
              {ui.product.fullPolicy}
            </TLink>
          </p>
        </>
      ),
    },
    {
      title: ui.product.accordions.origin,
      content: (
        <dl className="kv">
          <dt>{ui.product.origin}</dt>
          <dd>{legal.countryOfOrigin}</dd>
          <dt>{ui.product.manufacturer}</dt>
          <dd>{legal.manufacturer}</dd>
          <dt>{ui.product.marketer}</dt>
          <dd>{legal.marketer}</dd>
          <dt>{ui.product.sku}</dt>
          <dd className="t-mono">{(selectedVariant ?? p.variants[0]).sku}</dd>
        </dl>
      ),
    },
  ];

  return (
    <div className="pdp">
      <div className="pdp-media">
        <ProductGallery product={p} images={images} wrongSide={wrong} flipSrc={images[1].src} tint={colour.hex} />
      </div>
      <div className="pdp-info">
        <div className="pdp-sticky">
          <p className="t-meta text-muted">
            {dropLabel} · {p.wrng.type}
          </p>
          <h1 className="t-h1 pdp-title axis-hover">
            <Lines lines={[p.title]} mode="mount" />
          </h1>
          <div className="pdp-price">
            <span className="t-mono-lg">
              {ui.product.mrp} {p.wrng.compareAtPrice && <s className="text-muted">{formatPrice(p.wrng.compareAtPrice)}</s>} {formatPrice(p.wrng.price)}
            </span>
            <span className="t-meta text-muted">{ui.product.taxNote}</span>
          </div>
          <div className="pdp-badges">
            {p.wrng.isNew && <span className="badge">{ui.common.new}</span>}
            {p.wrng.isLimited && <span className="badge badge-outline">{ui.common.limitedRun}</span>}
            {!soldOut && !locked && stockTotal <= commerce.lowStockProductThreshold && <span className="badge badge-signal">{ui.common.lowStock}</span>}
          </div>

          {/* Colour */}
          <fieldset className="pdp-field">
            <legend className="t-meta">
              {ui.product.colour} <span className="text-muted">{colour.name}</span>
            </legend>
            <div className="swatches" role="radiogroup" aria-label="Colour">
              {p.wrng.colours.map((c, i) => (
                <button key={c.slug} type="button" role="radio" aria-checked={i === ci} aria-label={c.name} className="swatch" style={{ "--c": c.hex } as React.CSSProperties} onClick={() => setCi(i)} />
              ))}
            </div>
          </fieldset>

          {/* Size */}
          {!locked && (
            <fieldset className="pdp-field" ref={sizesRef}>
              <legend className="t-meta pdp-size-legend">
                <span>
                  {ui.product.size} {size && <span className="text-muted">{size}</span>}
                </span>
                <button type="button" className="link-u t-meta" onClick={() => setGuide(true)}>
                  {ui.product.sizeGuide}
                </button>
              </legend>
              <div className="sizes" role="radiogroup" aria-label="Size" aria-describedby={sizeError ? "size-err" : undefined}>
                {p.wrng.sizes.map((s) => {
                  const v = variantFor(p, colour.name, s.label);
                  const stock = v?.quantityAvailable ?? 0;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      role="radio"
                      aria-checked={size === s.label}
                      aria-disabled={!s.available || undefined}
                      className="chip size-chip"
                      data-soldout={!s.available || undefined}
                      aria-label={s.available ? `${s.label}${stock <= commerce.lowStockThreshold ? fill(ui.product.onlyLeftLabel, { n: stock }) : ""}` : `${s.label}, sold out. Notify me`}
                      onClick={() => {
                        if (!s.available) {
                          openNotify(p, s.label);
                          return;
                        }
                        setSize(s.label);
                        setSizeError(false);
                      }}
                    >
                      {s.label}
                      {s.available && stock <= commerce.lowStockThreshold && <span className="only-left">{fill(ui.common.onlyLeft, { n: stock })}</span>}
                    </button>
                  );
                })}
              </div>
              {sizeError && (
                <p id="size-err" className="field-error" role="alert">
                  {copy.errors.size}
                </p>
              )}
              {!soldOut && p.wrng.sizes.some((s) => !s.available) && <p className="t-meta text-muted">{ui.product.sizeNote}</p>}
            </fieldset>
          )}

          {/* Actions */}
          {locked && cd ? (
            <div className="pdp-locked">
              <p className="t-meta">{fill(ui.common.dropsAt, { slot: p.wrng.releaseAt ? formatDropSlot(p.wrng.releaseAt) : "" })}</p>
              <p className="t-h2 tabular" aria-live="off">
                {pad2(cd.days)}:{pad2(cd.hours)}:{pad2(cd.minutes)}:{pad2(cd.seconds)}
              </p>
              <button ref={addBtn} type="button" className="btn btn-signal btn-block" onClick={() => openNotify(p)}>
                {copy.ctas.notifyMe}
              </button>
              <TLink href="/drops" className="btn btn-block">
                {ui.product.enterAccessCode}
              </TLink>
            </div>
          ) : soldOut ? (
            <div className="pdp-actions">
              <p className="pdp-gone">{copy.soldOut}</p>
              <button ref={addBtn} type="button" className="btn btn-signal btn-block" onClick={() => openNotify(p)}>
                {p.wrng.restocking ? ui.common.notifyRestocking : copy.ctas.notifyMe}
              </button>
            </div>
          ) : (
            <div className="pdp-actions">
              <button ref={addBtn} type="button" className="btn btn-signal btn-block add-btn" data-state={add} onClick={() => doAdd(false)} aria-live="polite" disabled={add === "loading"}>
                <span className="add-label">{add === "added" ? ui.common.added : copy.ctas.addToBag}</span>
                <span className="add-progress" aria-hidden="true" />
              </button>
              <div className="pdp-row">
                <button type="button" className="btn btn-block" onClick={() => doAdd(true)}>
                  {copy.ctas.buyNow}
                </button>
                <SaveButton product={p} className="pdp-save" withLabel />
              </div>
            </div>
          )}

          <button type="button" className="wrongside-toggle t-meta" aria-pressed={wrong} onClick={() => setWrong((v) => !v)}>
            <span className="ws-dot" aria-hidden="true" />
            {wrong ? copy.ctas.seeRightSide : copy.ctas.seeWrongSide}
          </button>

          <Pincode />
          <Accordion items={accordions} defaultOpen={0} />
        </div>
      </div>

      <div className="pdp-bar" data-show={(sticky && !locked) || undefined} aria-hidden={!sticky}>
        <div>
          <p className="pdp-bar-title">{p.title}</p>
          <p className="t-meta tabular">
            {formatPrice(p.wrng.price)}
            {size ? ` · ${size}` : ""}
          </p>
        </div>
        {soldOut ? (
          <button type="button" className="btn btn-signal btn-sm" tabIndex={sticky ? 0 : -1} onClick={() => openNotify(p)}>
            {copy.ctas.notifyMe}
          </button>
        ) : (
          <button type="button" className="btn btn-signal btn-sm" tabIndex={sticky ? 0 : -1} onClick={() => doAdd(false)}>
            {add === "added" ? ui.common.added : copy.ctas.addToBag}
          </button>
        )}
      </div>

      <SizeGuideDrawer open={guide} onClose={() => setGuide(false)} chart={chart in sizeCharts ? chart : "tee"} title={p.title} />
    </div>
  );
}
