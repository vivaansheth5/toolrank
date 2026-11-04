"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ui, uiStore } from "@/lib/stores";
import { useStore } from "@/lib/store";
import { useDebounced, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { searchProductsSync, categoryLabel } from "@/lib/commerce";
import { trendingSearches, copy } from "@/lib/site-config";
import { formatPrice } from "@/lib/format";
import { CloseIcon, ArrowIcon } from "@/components/ui/Icons";
import { ProductImage } from "@/components/ui/ProductImage";
import { useNavigate } from "@/components/shell/PageTransition";

/** Full-screen search: big input, live results (150ms debounce), trending, full keyboard support. */
export function SearchOverlay() {
  const open = useStore(uiStore, (s) => s.searchOpen);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(-1);
  const debounced = useDebounced(q, 150);
  const results = useMemo(() => searchProductsSync(debounced, 8), [debounced]);
  const navigate = useNavigate();
  const listId = useId();
  useFocusTrap(root, open, { onEscape: ui.closeSearch, initial: "input" });
  useScrollLock(open);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset selection when results change
    setActive(-1);
  }, [debounced]);

  const go = (href: string) => {
    ui.closeSearch();
    void navigate(href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(`/products/${results[active].handle}`);
    }
  };

  return (
    <div ref={root} className="search theme-night" data-open={open} role="dialog" aria-modal="true" aria-label="Search" inert={!open} data-lenis-prevent>
      <div className="wrap search-inner">
        <div className="search-top">
          <p className="t-meta text-muted">SEARCH THE WIRE · PRESS ESC TO CLOSE</p>
          <button type="button" className="icon-btn" onClick={ui.closeSearch} aria-label="Close search">
            <CloseIcon />
          </button>
        </div>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
          }}
        >
          <label htmlFor="search-q" className="sr-only">
            Search products
          </label>
          <input
            ref={input}
            id="search-q"
            className="search-input t-h1"
            type="search"
            autoComplete="off"
            spellCheck={false}
            placeholder="HOODIE, CARGOS, LIVE WIRE…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          />
        </form>

        {!debounced.trim() ? (
          <div className="search-trending">
            <p className="t-meta text-muted">TRENDING</p>
            <ul>
              {trendingSearches.map((t) => (
                <li key={t}>
                  <button type="button" className="chip" onClick={() => setQ(t)}>
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : results.length === 0 ? (
          <p className="t-h2 search-empty">{copy.emptySearch}</p>
        ) : (
          <>
            <p className="t-meta text-muted" aria-live="polite">
              {results.length} ON THE WIRE
            </p>
            <ul id={listId} role="listbox" className="search-results" aria-label="Results">
              {results.map((p, i) => (
                <li key={p.handle} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <a
                    href={`/products/${p.handle}`}
                    className="search-result"
                    data-active={i === active || undefined}
                    tabIndex={-1}
                    onMouseEnter={() => setActive(i)}
                    onClick={(e) => {
                      e.preventDefault();
                      go(`/products/${p.handle}`);
                    }}
                  >
                    <span className="search-thumb">
                      <ProductImage src={p.featuredImage.url} alt="" sizes="80px" tint={p.wrng.colours[0].hex} />
                    </span>
                    <span className="search-name">
                      <span className="t-h3">{p.title}</span>
                      <span className="t-meta text-muted">
                        {p.wrng.type} · {categoryLabel(p.wrng.category)}
                        {!p.availableForSale && " · SOLD OUT"}
                      </span>
                    </span>
                    <span className="t-mono-lg tabular">{formatPrice(p.wrng.price)}</span>
                    <ArrowIcon className="search-arrow" />
                  </a>
                </li>
              ))}
            </ul>
            <button type="button" className="btn search-all" onClick={() => go(`/search?q=${encodeURIComponent(q.trim())}`)}>
              SEE ALL RESULTS FOR “{q.trim().toUpperCase()}”
            </button>
          </>
        )}
      </div>
    </div>
  );
}
