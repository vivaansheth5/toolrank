"use client";

import { useEffect, useMemo, useState } from "react";
import { searchProductsSync } from "@/lib/commerce";
import { copy, trendingSearches, ui } from "@/lib/site-config";
import { useNow } from "@/lib/hooks";
import { ProductCard } from "@/components/shop/ProductCard";
import { Lines } from "@/components/ui/Lines";
import "@/components/shop/shop.css";

export function SearchResults() {
  const [q, setQ] = useState("");
  const [ready, setReady] = useState(false);
  const now = useNow(60_000) ?? 0;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read ?q after hydration
    setQ(new URLSearchParams(window.location.search).get("q") ?? "");
    setReady(true);
  }, []);
  const results = useMemo(() => searchProductsSync(q, 24), [q]);
  const update = (v: string) => {
    setQ(v);
    window.history.replaceState(window.history.state, "", v ? `/search?q=${encodeURIComponent(v)}` : "/search");
  };
  return (
    <div className="wrap pt-header search-page">
      <p className="t-meta text-muted">{ui.search.kicker}</p>
      <h1 className="t-h1">
        <Lines lines={[q ? `“${q.toUpperCase()}”` : ui.search.title]} mode="mount" key={q} />
      </h1>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="search-page-form">
        <label htmlFor="sp-q" className="sr-only">
          {ui.search.label}
        </label>
        <input id="sp-q" type="search" className="input" value={q} onChange={(e) => update(e.target.value)} placeholder={ui.search.placeholder} autoComplete="off" />
      </form>
      {ready && q.trim() && (
        <p className="t-meta" aria-live="polite">
          {results.length} {results.length === 1 ? ui.search.result : ui.search.results}
        </p>
      )}
      {ready && q.trim() && results.length === 0 && <p className="t-h2">{copy.emptySearch}</p>}
      {(!q.trim() || results.length === 0) && (
        <div className="search-trending">
          <p className="t-meta text-muted">{ui.search.trending}</p>
          <ul>
            {trendingSearches.map((t) => (
              <li key={t}>
                <button type="button" className="chip" onClick={() => update(t)}>
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="pgrid" data-cols="4">
        {results.map((p) => (
          <ProductCard key={p.handle} product={p} now={now} />
        ))}
      </div>
    </div>
  );
}
