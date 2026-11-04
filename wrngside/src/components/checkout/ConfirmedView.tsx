"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { accountStore, type Order } from "@/lib/stores";
import { useHydrated } from "@/lib/store";
import { formatPrice, formatShortDate } from "@/lib/format";
import { TLink } from "@/components/ui/TLink";
import { Lines } from "@/components/ui/Lines";
import { copy } from "@/lib/site-config";

export function ConfirmedView() {
  const hydrated = useHydrated();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id") ?? sessionStorage.getItem("wrng:last-order");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the order once on mount
    setOrder(accountStore.get().orders.find((o) => o.id === id) ?? null);
  }, []);
  if (!hydrated || order === undefined) return <p className="t-meta">FINDING YOUR ORDER…</p>;
  if (!order)
    return (
      <div className="co-empty">
        <p className="t-h2">{copy.errors.order}</p>
        <TLink href="/help/track-order" className="btn">
          TRACK AN ORDER
        </TLink>
      </div>
    );
  return (
    <div className="confirmed">
      <p className="t-meta">ORDER {order.id}</p>
      <h1 className="t-display confirmed-title">
        <Lines lines={["YOU'RE ON", "THE WIRE."]} mode="mount" />
      </h1>
      <p className="t-lead">
        Thanks, {order.address.name.split(" ")[0]}. We&apos;ll WhatsApp tracking to +91 {order.phone} and email {order.email} the moment it ships. Arrives by {formatShortDate(new Date(order.deliveryBy))}.
      </p>
      <div className="confirmed-grid">
        <ul className="co-lines">
          {order.lines.map((l) => (
            <li key={l.handle + l.variant} className="co-line">
              <span className="co-thumb">
                <Image src={l.image} alt="" fill sizes="64px" />
                <span className="co-qty tabular">{l.quantity}</span>
              </span>
              <span>
                <span className="co-line-title">{l.title}</span>
                <span className="t-meta text-muted">{l.variant}</span>
              </span>
              <span className="tabular t-mono-lg">{formatPrice(l.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="co-totals tabular">
          <dt>Payment</dt>
          <dd>{order.payment === "COD" ? "Cash on delivery" : order.payment}</dd>
          <dt>Ship to</dt>
          <dd>
            {order.address.line1}, {order.address.city} {order.address.pincode}
          </dd>
          <dt className="co-total">Total</dt>
          <dd className="co-total">{formatPrice(order.total)}</dd>
        </dl>
      </div>
      <div className="confirmed-cta">
        <TLink href="/" className="btn btn-signal">
          {copy.ctas.backToTheLine}
        </TLink>
        <TLink href="/account" className="btn">
          SEE YOUR ORDERS
        </TLink>
      </div>
    </div>
  );
}
