"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Product, SortKey, Category } from "@/lib/commerce/types";
import { filterProducts, sortProducts, isLocked, fitTag, colourFamily, COLOUR_FAMILIES, PRICE_BANDS, categories, categoryLabel } from "@/lib/commerce/helpers";
import { commerce, copy } from "@/lib/site-config";
import { useNow, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { getNavType, getScrollY, scrollToY } from "@/lib/scroll";
import { accessStore } from "@/lib/stores";
import { useStore } from "@/lib/store";
import { ProductCard } from "./ProductCard";
import { TLink } from "@/components/ui/TLink";
import { CloseIcon, GridIcon } from "@/components/ui/Icons";

interface Filters {
  sizes: string[];
  colours: string[];
  fits: string[];
  price: number | null;
  sort: SortKey;
}

const EMPTY: Filters = { sizes: [], colours: [], fits: [], price: null, sort: "featured" };
const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "new", label: "New" },
  { key: "price-asc", label: "Price low–high" },
  { key: "price-desc", label: "Price high–low" },
];

function readUrl(): Filters {
  const q = new URLSearchParams(window.location.search);
  const list = (k: string) => (q.get(k) ? q.get(k)!.split(",").filter(Boolean) : []);
  const sort = (q.get("sort") as SortKey) || "featured";
  const price = q.get("price");
  return { sizes: list("size"), colours: list("colour"), fits: list("fit"), price: price !== null && PRICE_BANDS[Number(price)] ? Number(price) : null, sort: SORTS.some((s) => s.key === sort) ? sort : "featured" };
}

function writeUrl(f: Filters) {
  const q = new URLSearchParams();
  if (f.sizes.length) q.set("size", f.sizes.join(","));
  if (f.colours.length) q.set("colour", f.colours.join(","));
  if (f.fits.length) q.set("fit", f.fits.join(","));
  if (f.price !== null) q.set("price", String(f.price));
  if (f.sort !== "featured") q.set("sort", f.sort);
  const s = q.toString();
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${s ? `?${s}` : ""}`);
}

const memKey = () => `wrng:shop:${window.location.pathname}${window.location.search}`;

export function ShopView({ products, renderedAt, category }: { products: Product[]; renderedAt: number; category: Category | "all" }) {
  const liveNow = useNow(30_000);
  const now = liveNow ?? renderedAt;
  const unlocked = useStore(accessStore, (s) => s.unlocked);
  const [f, setF] = useState<Filters>(EMPTY);
  const [cols, setCols] = useState<number>(4);
  const [visible, setVisible] = useState<number>(commerce.shopPageSize);
  const [drawer, setDrawer] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<unknown>(null);
  const restored = useRef(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(drawerRef, drawer, { onEscape: () => setDrawer(false) });
  useScrollLock(drawer);

  // Hydrate filters from the URL after mount (the server renders the unfiltered grid).
  useEffect(() => {
    const fromUrl = readUrl();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- adopt URL state after hydration
    setF(fromUrl);
    try {
      const v = Number(localStorage.getItem("wrng:density"));
      if (v >= 1 && v <= 4) setCols(v);
    } catch {}
  }, []);

  const pool = useMemo(() => products.filter((p) => !isLocked(p, now, unlocked.includes(p.wrng.drop))), [products, now, unlocked]);
  const result = useMemo(() => {
    const filtered = filterProducts(pool, { sizes: f.sizes, colours: f.colours, fits: f.fits, price: f.price !== null ? PRICE_BANDS[f.price].range : null });
    return sortProducts(filtered, f.sort);
  }, [pool, f]);
  const shown = result.slice(0, visible);

  // Facets from what's actually here.
  const facet = useMemo(() => {
    const sizes = [...new Set(pool.flatMap((p) => p.wrng.sizes.map((s) => s.label)))];
    const order = ["S", "M", "L", "XL", "XXL", "UK 6–8", "UK 9–11", "ONE SIZE"];
    sizes.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const colours = COLOUR_FAMILIES.filter((c) => pool.some((p) => p.wrng.colours.some((x) => colourFamily(x.name) === c.name)));
    const fits = [...new Set(pool.map(fitTag))];
    return { sizes, colours, fits };
  }, [pool]);

  const visibleRef = useRef(visible);
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  // Restore LOAD MORE count + scroll on back navigation.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = sessionStorage.getItem(memKey());
      if (raw && getNavType() === "pop") {
        const { v, y } = JSON.parse(raw) as { v: number; y: number };
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a remembered list length
        setVisible(v);
        requestAnimationFrame(() => requestAnimationFrame(() => scrollToY(y, { immediate: true })));
      }
    } catch {}
    const save = () => {
      try {
        sessionStorage.setItem(memKey(), JSON.stringify({ v: visibleRef.current, y: getScrollY() }));
      } catch {}
    };
    let t = 0;
    const onScroll = () => {
      window.clearTimeout(t);
      t = window.setTimeout(save, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      save();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Animate grid changes with Flip (lazy-loaded plugin).
  const flipRef = useRef<null | { getState: (t: Element[] | NodeListOf<Element>, o?: object) => unknown; from: (s: unknown, o: object) => unknown }>(null);
  useEffect(() => {
    void import("gsap/Flip").then(async (m) => {
      const { gsap } = await import("@/lib/gsap");
      gsap.registerPlugin(m.Flip);
      flipRef.current = m.Flip as unknown as typeof flipRef.current;
    });
  }, []);
  const capture = useCallback(() => {
    const grid = gridRef.current;
    if (!grid || !flipRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    flipState.current = flipRef.current.getState(grid.querySelectorAll(".pcard"));
  }, []);
  useLayoutEffect(() => {
    const grid = gridRef.current;
    const st = flipState.current;
    if (!grid || !st || !flipRef.current) return;
    flipState.current = null;
    flipRef.current.from(st, {
      targets: grid.querySelectorAll(".pcard"),
      duration: 0.6,
      ease: "entrance",
      absolute: true,
      nested: true,
      onEnter: (els: Element[]) => import("@/lib/gsap").then(({ gsap }) => gsap.fromTo(els, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: "entrance" })),
      onLeave: (els: Element[]) => import("@/lib/gsap").then(({ gsap }) => gsap.to(els, { opacity: 0, duration: 0.25 })),
    });
  });

  const update = (next: Partial<Filters>) => {
    capture();
    const merged = { ...f, ...next };
    setF(merged);
    setVisible(commerce.shopPageSize);
    writeUrl(merged);
  };
  const toggle = (k: "sizes" | "colours" | "fits", v: string) => update({ [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] } as Partial<Filters>);
  const setDensity = (n: number) => {
    capture();
    setCols(n);
    try {
      localStorage.setItem("wrng:density", String(n));
    } catch {}
  };
  const activeCount = f.sizes.length + f.colours.length + f.fits.length + (f.price !== null ? 1 : 0);

  const filterGroups = (
    <>
      <fieldset className="fgroup">
        <legend className="t-meta">CATEGORY</legend>
        <div className="fgroup-row">
          <TLink href="/shop" className="chip" data-selected={category === "all" || undefined}>
            ALL
          </TLink>
          {categories.map((c) => (
            <TLink key={c} href={`/shop/${c}`} className="chip" data-selected={category === c || undefined}>
              {categoryLabel(c)}
            </TLink>
          ))}
        </div>
      </fieldset>
      <fieldset className="fgroup">
        <legend className="t-meta">SIZE</legend>
        <div className="fgroup-row">
          {facet.sizes.map((s) => (
            <button key={s} type="button" className="chip" aria-pressed={f.sizes.includes(s)} onClick={() => toggle("sizes", s)}>
              {s}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="fgroup">
        <legend className="t-meta">COLOUR</legend>
        <div className="fgroup-row">
          {facet.colours.map((c) => (
            <button key={c.name} type="button" className="chip chip-swatch" aria-pressed={f.colours.includes(c.name)} onClick={() => toggle("colours", c.name)}>
              <span className="swatch-dot" style={{ background: c.hex }} aria-hidden="true" />
              {c.name}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="fgroup">
        <legend className="t-meta">FIT</legend>
        <div className="fgroup-row">
          {facet.fits.map((x) => (
            <button key={x} type="button" className="chip" aria-pressed={f.fits.includes(x)} onClick={() => toggle("fits", x)}>
              {x}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="fgroup">
        <legend className="t-meta">PRICE</legend>
        <div className="fgroup-row">
          {PRICE_BANDS.map((b, i) => (
            <button key={b.label} type="button" className="chip" aria-pressed={f.price === i} onClick={() => update({ price: f.price === i ? null : i })}>
              {b.label}
            </button>
          ))}
        </div>
      </fieldset>
    </>
  );

  return (
    <div className="shop">
      <div className="filterbar" role="region" aria-label="Filter and sort">
        <div className="wrap filterbar-row">
          <button type="button" className="filterbar-btn t-meta" onClick={() => setDrawer(true)} aria-expanded={drawer} aria-controls="filter-drawer">
            FILTER{activeCount ? ` (${activeCount})` : ""}
          </button>
          <div className="filterbar-inline">{filterGroups}</div>
          <div className="filterbar-right">
            <label className="sort t-meta">
              <span className="sr-only">Sort by</span>
              <span aria-hidden="true">SORT</span>
              <select value={f.sort} onChange={(e) => update({ sort: e.target.value as SortKey })} className="sort-select">
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="density" role="group" aria-label="Grid density">
              {[2, 3, 4].map((n) => (
                <button key={n} type="button" className="density-btn density-desk" aria-pressed={cols === n} onClick={() => setDensity(n)} aria-label={`${n} columns`}>
                  <GridIcon cols={n} />
                </button>
              ))}
              {[1, 2].map((n) => (
                <button key={`m${n}`} type="button" className="density-btn density-mob" aria-pressed={(cols > 2 ? 2 : cols) === n} onClick={() => setDensity(n)} aria-label={`${n} column${n > 1 ? "s" : ""}`}>
                  <GridIcon cols={n} />
                </button>
              ))}
            </div>
          </div>
        </div>
        {activeCount > 0 && (
          <div className="wrap active-filters t-meta">
            <span className="text-muted">
              {result.length} {result.length === 1 ? "PIECE" : "PIECES"}
            </span>
            <button type="button" className="link-u" onClick={() => update({ ...EMPTY, sort: f.sort })}>
              CLEAR ALL
            </button>
          </div>
        )}
      </div>

      <div className="wrap">
        {result.length === 0 ? (
          <div className="shop-empty">
            <svg viewBox="0 0 400 140" className="empty-wire" aria-hidden="true">
              <path d="M0 20 Q200 90 400 20" />
              <path d="M195 74 v30 M205 74 v30" />
            </svg>
            <p className="t-h2">{copy.emptyShop}</p>
            <button type="button" className="btn btn-solid" onClick={() => update({ ...EMPTY })}>
              RESET FILTERS
            </button>
          </div>
        ) : (
          <>
            <div ref={gridRef} className="pgrid" data-cols={cols} aria-live="polite" aria-busy="false">
              {shown.map((p, i) => (
                <ProductCard key={p.handle} product={p} now={now} priority={i < 4} sizes={cols >= 4 ? "(min-width: 1024px) 25vw, 50vw" : cols === 3 ? "(min-width: 1024px) 33vw, 50vw" : cols === 1 ? "100vw" : "50vw"} />
              ))}
            </div>
            <div className="loadmore">
              <p className="t-meta">
                SHOWING {shown.length} OF {result.length}
              </p>
              <svg viewBox="0 0 300 16" className="loadmore-cable" aria-hidden="true" preserveAspectRatio="none">
                <path d="M0 3 Q150 14 300 3" className="lm-track" />
                <path d="M0 3 Q150 14 300 3" className="lm-fill" pathLength={1} style={{ strokeDasharray: `${shown.length / result.length} 1` }} />
              </svg>
              {shown.length < result.length && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    capture();
                    setVisible((v) => v + commerce.shopPageSize);
                  }}
                >
                  {copy.ctas.loadMore}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="drawer-root" data-open={drawer}>
        <div className="drawer-backdrop" onClick={() => setDrawer(false)} aria-hidden="true" />
        <div id="filter-drawer" ref={drawerRef} className="drawer drawer-left theme-day" role="dialog" aria-modal="true" aria-label="Filters" inert={!drawer} data-lenis-prevent>
          <header className="drawer-head">
            <h2 className="t-h3">FILTER</h2>
            <button type="button" className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close filters">
              <CloseIcon />
            </button>
          </header>
          <div className="drawer-filters">{filterGroups}</div>
          <footer className="drawer-foot">
            <button type="button" className="btn btn-solid btn-block" onClick={() => setDrawer(false)}>
              SHOW {result.length} {result.length === 1 ? "PIECE" : "PIECES"}
            </button>
            {activeCount > 0 && (
              <button type="button" className="btn btn-block" onClick={() => update({ ...EMPTY, sort: f.sort })}>
                CLEAR ALL
              </button>
            )}
          </footer>
        </div>
      </div>
    </div>
  );
}
