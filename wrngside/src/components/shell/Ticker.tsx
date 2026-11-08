"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { commerce, drops } from "@/lib/site-config";
import { formatDropSlot, formatPrice } from "@/lib/format";
import { setPref } from "@/lib/stores";
import { CloseIcon } from "@/components/ui/Icons";

function useTickerItems() {
  const live = drops.list.find((d) => d.id === drops.live)!;
  const next = drops.list.find((d) => d.id === drops.next);
  const [nextLive, setNextLive] = useState(false);
  useEffect(() => {
    if (!next?.releaseAt) return;
    const check = () => setNextLive(Date.now() >= Date.parse(next.releaseAt!));
    check();
    const id = window.setInterval(check, 30_000);
    return () => window.clearInterval(id);
  }, [next]);
  return useMemo(
    () => [
      nextLive && next ? `DROP ${next.number} IS LIVE` : `DROP ${live.number} IS LIVE`,
      `FREE SHIPPING ACROSS INDIA OVER ${formatPrice(commerce.freeShippingThreshold)}`,
      commerce.codAvailable ? "COD AVAILABLE" : "UPI, CARDS & NET BANKING",
      next && !nextLive && next.releaseAt ? `DROP ${next.number} · ${formatDropSlot(next.releaseAt)}` : "NEW PIECES EVERY DROP",
    ],
    [live, next, nextLive],
  );
}

/** Slow mono marquee (~40px/s). Pauses on hover. Dismissible and remembered. */
export function Ticker() {
  const items = useTickerItems();
  const track = useRef<HTMLDivElement>(null);
  const [dur, setDur] = useState(40);

  useEffect(() => {
    const el = track.current?.firstElementChild as HTMLElement | null;
    if (!el) return;
    const measure = () => setDur(Math.max(10, el.offsetWidth / 40));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items]);

  const run = (
    <span className="ticker-run">
      {items.map((t, i) => (
        <span key={i} className="ticker-item">
          {i === 0 && <span className="live-dot" aria-hidden="true" />}
          {t}
          <span className="ticker-sep" aria-hidden="true">
            —
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="ticker" role="region" aria-label="Announcements">
      <p className="sr-only">{items.join(". ")}</p>
      <div className="ticker-mask" aria-hidden="true">
        <div ref={track} className="ticker-track" style={{ "--dur": `${dur}s` } as React.CSSProperties}>
          {run}
          {run}
        </div>
      </div>
      <button
        type="button"
        className="ticker-close"
        aria-label="Dismiss announcements"
        onClick={() => {
          setPref("tickerDismissed", true);
          document.documentElement.setAttribute("data-ticker", "off");
        }}
      >
        <CloseIcon size={12} />
      </button>
    </div>
  );
}
