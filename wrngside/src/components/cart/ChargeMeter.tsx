"use client";

import { useEffect, useRef, useState } from "react";
import { commerce } from "@/lib/site-config";
import { formatPrice } from "@/lib/format";

/** Free-shipping meter drawn as a charging cable with a spark at its head. */
export function ChargeMeter({ subtotal }: { subtotal: number }) {
  const t = commerce.freeShippingThreshold;
  const p = Math.min(1, subtotal / t);
  const away = Math.max(0, t - subtotal);
  const done = away === 0;
  const prev = useRef(done);
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (done && !prev.current) {
      setPulse(true);
      const id = window.setTimeout(() => setPulse(false), 1400);
      prev.current = done;
      return () => window.clearTimeout(id);
    }
    prev.current = done;
  }, [done]);
  // Parabolic sag; the spark rides the curve.
  const W = 400;
  const sag = 10;
  const y = 6 + sag * 4 * p * (1 - p);
  return (
    <div className="charge" data-done={done || undefined} data-pulse={pulse || undefined}>
      <p className="t-meta charge-label" aria-live="polite">
        {done ? "FREE SHIPPING: POWERED ON" : `${formatPrice(away)} AWAY FROM FREE SHIPPING`}
      </p>
      <svg viewBox={`0 0 ${W} 26`} className="charge-svg" role="progressbar" aria-label="Progress to free shipping" aria-valuemin={0} aria-valuemax={t} aria-valuenow={Math.min(subtotal, t)} preserveAspectRatio="none">
        <path className="charge-track" d={`M0 6 Q${W / 2} ${6 + sag * 2} ${W} 6`} />
        <path className="charge-fill" d={`M0 6 Q${W / 2} ${6 + sag * 2} ${W} 6`} pathLength={1} style={{ strokeDasharray: `${p} 1` }} />
      </svg>
      <span className="charge-spark" style={{ left: `${p * 100}%`, top: `${(y / 26) * 100}%` }} aria-hidden="true" />
    </div>
  );
}
