"use client";

import { useMemo } from "react";
import { useSaved, toggleSaved } from "@/lib/stores";
import { useHydrated } from "@/lib/store";
import { getProductsByHandlesSync } from "@/lib/commerce";
import { copy } from "@/lib/site-config";
import { formatPrice } from "@/lib/format";
import { MiniLine } from "@/components/ui/MiniLine";
import { TLink } from "@/components/ui/TLink";
import { Lines } from "@/components/ui/Lines";

/** YOUR LINE: saved pieces hang on a mini version of THE LINE. */
export function SavedView() {
  const hydrated = useHydrated();
  const saved = useSaved();
  const products = useMemo(() => getProductsByHandlesSync(saved), [saved]);
  return (
    <div className="wrap pt-header saved">
      <p className="t-meta text-muted">SAVED · {products.length} PEGGED</p>
      <h1 className="t-h1">
        <Lines lines={["YOUR LINE."]} mode="mount" />
      </h1>
      {!hydrated ? null : products.length === 0 ? (
        <div className="saved-empty">
          <MiniLine items={[]} label="Your line is empty" />
          <p className="t-h2">{copy.emptySaved}</p>
          <TLink href="/" className="btn btn-signal">
            {copy.ctas.shopTheLine}
          </TLink>
        </div>
      ) : (
        <>
          {Array.from({ length: Math.ceil(products.length / 4) }, (_, row) => (
            <MiniLine
              key={row}
              label={`Saved pieces ${row * 4 + 1} to ${Math.min(products.length, row * 4 + 4)}`}
              items={products.slice(row * 4, row * 4 + 4).map((p) => ({
                key: p.handle,
                src: p.wrng.colours[0].media.cutout,
                alt: `${p.title} ${p.wrng.type}`,
                w: p.wrng.dims.w,
                h: p.wrng.dims.h,
                href: `/products/${p.handle}`,
                hang: p.wrng.hangStyle,
                caption: (
                  <>
                    <span className="mini-title">{p.title}</span>
                    <span className="t-meta">
                      {formatPrice(p.wrng.price)}
                      {!p.availableForSale ? " · SOLD OUT" : ""}
                    </span>
                  </>
                ),
                action: (
                  <button type="button" className="t-meta link-u" onClick={() => toggleSaved(p.handle)} aria-label={`Unpeg ${p.title}`}>
                    UNPEG
                  </button>
                ),
              }))}
              linkAs={(it, body) => (
                <TLink href={it.href!} aria-label={it.alt}>
                  {body}
                </TLink>
              )}
            />
          ))}
        </>
      )}
    </div>
  );
}
