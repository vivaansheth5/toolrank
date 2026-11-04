"use client";

import { useState } from "react";
import { accountStore, type Order } from "@/lib/stores";
import { copy } from "@/lib/site-config";
import { normalisePhone } from "@/components/ui/ContactField";
import { formatPrice, formatShortDate } from "@/lib/format";

const STEPS = ["PLACED", "PACKED", "SHIPPED", "OUT FOR DELIVERY", "DELIVERED"] as const;

/** Order ID + phone → status timeline (mocked against orders placed on this device). */
export function TrackOrder() {
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  return (
    <div className="track">
      <form
        className="track-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const o = accountStore.get().orders.find((x) => x.id.toUpperCase() === id.trim().toUpperCase() && x.phone === normalisePhone(phone));
          setOrder(o ?? null);
          setErr(o ? null : copy.errors.order);
        }}
      >
        <div className="field">
          <label htmlFor="tr-id">Order ID</label>
          <input id="tr-id" className="input t-mono" placeholder="WS123456" value={id} onChange={(e) => setId(e.target.value)} autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="tr-ph">Phone number</label>
          <div className="input-wrap">
            <span className="input-prefix t-mono">+91</span>
            <input id="tr-ph" className="input" type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={Boolean(err) || undefined} aria-describedby={err ? "tr-err" : undefined} />
          </div>
        </div>
        <button type="submit" className="btn btn-solid">
          TRACK
        </button>
        {err && (
          <p id="tr-err" className="field-error" role="alert">
            {err}
          </p>
        )}
      </form>
      {order && (
        <div className="track-result" aria-live="polite">
          <p className="t-meta">
            ORDER {order.id} · {formatPrice(order.total)} · ARRIVES BY {formatShortDate(new Date(order.deliveryBy)).toUpperCase()}
          </p>
          <ol className="track-steps">
            {STEPS.map((s, i) => (
              <li key={s} data-done={i <= STEPS.indexOf(order.status) || undefined}>
                <span className="track-dot" aria-hidden="true" />
                <span className="t-meta">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
