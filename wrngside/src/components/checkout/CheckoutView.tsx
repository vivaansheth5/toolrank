"use client";

import { useMemo, useState } from "react";
import { useCart, cartActions, shippingFor } from "@/lib/commerce/cart";
import { getProductSync } from "@/lib/commerce";
import { accountStore, type Order } from "@/lib/stores";
import { useStore, useHydrated } from "@/lib/store";
import { codes, commerce, copy } from "@/lib/site-config";
import { formatPrice, formatShortDate } from "@/lib/format";
import { checkPincode, lookupPincode, isPincode } from "@/lib/delivery";
import { normalisePhone } from "@/components/ui/ContactField";
import { ProductImage } from "@/components/ui/ProductImage";
import { TLink } from "@/components/ui/TLink";
import { useNavigate } from "@/components/shell/PageTransition";
import { announce } from "@/components/shell/Announcer";

type Pay = "UPI" | "CARD" | "COD";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function luhn(num: string) {
  const d = num.replace(/\D/g, "");
  if (d.length < 13) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string | null; children: React.ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p id={`${id}-err`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Mocked checkout (UPI, card, COD). Swap for cart.checkoutUrl on Shopify. */
export function CheckoutView() {
  const cart = useCart();
  const hydrated = useHydrated();
  const account = useStore(accountStore);
  const navigate = useNavigate();
  const def = account.addresses.find((a) => a.isDefault) ?? account.addresses[0];
  const [f, setF] = useState({
    email: account.user?.email ?? "",
    phone: account.user?.phone ?? def?.phone ?? "",
    name: def?.name ?? account.user?.name ?? "",
    pincode: def?.pincode ?? "",
    line1: def?.line1 ?? "",
    line2: def?.line2 ?? "",
    city: def?.city ?? "",
    state: def?.state ?? "",
    upi: "",
    card: "",
    exp: "",
    cvv: "",
    code: "",
  });
  const [pay, setPay] = useState<Pay>("UPI");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [applied, setApplied] = useState<{ code: string; pct: number } | null>(null);
  const [codeMsg, setCodeMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;
    if (k === "pincode") {
      v = v.replace(/\D/g, "").slice(0, 6);
      if (isPincode(v)) {
        const { city, state } = lookupPincode(v);
        setF((s) => ({ ...s, pincode: v, city: s.city || city, state: s.state || state }));
        return;
      }
    }
    if (k === "card") v = v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
    if (k === "exp") v = v.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
    if (k === "cvv") v = v.replace(/\D/g, "").slice(0, 4);
    setF((s) => ({ ...s, [k]: v }));
  };

  const subtotal = Number(cart.cost.subtotalAmount.amount);
  const discount = applied ? Math.round((subtotal * applied.pct) / 100) : 0;
  const shipping = shippingFor(subtotal);
  const total = subtotal - discount + shipping + (pay === "COD" ? commerce.codFee : 0);
  const pin = useMemo(() => (isPincode(f.pincode) ? checkPincode(f.pincode) : null), [f.pincode]);
  const codOk = commerce.codAvailable && (!pin || (pin.ok && pin.cod)) && total <= commerce.codMaxOrderValue;

  const applyCode = () => {
    const c = f.code.trim().toUpperCase();
    const match = [codes.newsletter, codes.powerCut].find((x) => x.code === c);
    if (match) {
      setApplied({ code: match.code, pct: match.percentOff });
      setCodeMsg(`${match.code}: ${match.percentOff}% OFF APPLIED.`);
    } else {
      setApplied(null);
      setCodeMsg(copy.errors.code);
    }
  };

  const validate = () => {
    const e: Record<string, string | null> = {};
    e.email = !f.email.trim() ? copy.errors.required : EMAIL.test(f.email.trim()) ? null : copy.errors.email;
    e.phone = /^[6-9]\d{9}$/.test(normalisePhone(f.phone)) ? null : copy.errors.phone;
    e.name = f.name.trim().length > 1 ? null : copy.errors.required;
    e.pincode = !pin ? copy.errors.pincode : pin.ok ? null : pin.reason === "invalid" ? copy.errors.pincode : copy.errors.pincodeNoService.replace("{pin}", f.pincode);
    e.line1 = f.line1.trim().length > 3 ? null : copy.errors.required;
    e.city = f.city.trim() ? null : copy.errors.required;
    e.state = f.state.trim() ? null : copy.errors.required;
    if (pay === "UPI") e.upi = /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(f.upi.trim()) ? null : "THAT UPI ID LOOKS OFF. IT'S NAME@BANK.";
    if (pay === "CARD") {
      e.card = luhn(f.card) ? null : "THAT CARD NUMBER DOESN'T ADD UP.";
      const [mm, yy] = f.exp.split("/").map(Number);
      const now = new Date();
      const valid = mm >= 1 && mm <= 12 && yy >= 0 && (2000 + yy > now.getFullYear() || (2000 + yy === now.getFullYear() && mm >= now.getMonth() + 1));
      e.exp = valid ? null : "THAT EXPIRY DATE IS IN THE PAST.";
      e.cvv = /^\d{3,4}$/.test(f.cvv) ? null : "CHECK THE 3 DIGITS ON THE BACK.";
    }
    if (pay === "COD" && !codOk) e.pay = "COD ISN'T AVAILABLE FOR THIS ORDER. PICK UPI OR CARD.";
    setErrors(e);
    const first = Object.entries(e).find(([, v]) => v);
    if (first) {
      document.getElementById(`co-${first[0]}`)?.focus();
      announce(`Please fix: ${first[1]}`);
    }
    return !first;
  };

  const place = () => {
    if (!validate() || !pin || !pin.ok) return;
    setBusy(true);
    window.setTimeout(() => {
      const id = `WS${Math.floor(100000 + Math.random() * 900000)}`;
      const order: Order = {
        id,
        createdAt: new Date().toISOString(),
        email: f.email.trim(),
        phone: normalisePhone(f.phone),
        payment: pay,
        address: { name: f.name.trim(), phone: normalisePhone(f.phone), line1: f.line1.trim(), line2: f.line2.trim(), city: f.city.trim(), state: f.state.trim(), pincode: f.pincode },
        lines: cart.lines.map((l) => ({
          handle: l.merchandise.product.handle,
          title: `${l.merchandise.product.title} ${l.merchandise.product.productType}`,
          variant: l.merchandise.title,
          quantity: l.quantity,
          price: Number(l.cost.amountPerQuantity.amount),
          image: l.merchandise.product.featuredImage.url,
        })),
        subtotal,
        shipping,
        discount,
        total,
        status: "PLACED",
        deliveryBy: pin.deliveryBy.toISOString(),
      };
      accountStore.set((a) => ({ ...a, orders: [order, ...a.orders] }));
      try {
        sessionStorage.setItem("wrng:last-order", id);
      } catch {}
      cartActions.clear();
      void navigate(`/checkout/confirmed?id=${id}`, { replace: true });
    }, 1100);
  };

  if (!hydrated) return <div className="co-loading t-meta">LOADING YOUR BAG…</div>;
  if (!cart.lines.length)
    return (
      <div className="co-empty">
        <p className="t-h2">{copy.emptyBag}</p>
        <TLink href="/" className="btn btn-signal">
          {copy.ctas.shopTheLine}
        </TLink>
      </div>
    );

  const err = (k: string) => errors[k] ?? null;
  const aria = (k: string) => ({ "aria-invalid": Boolean(err(k)) || undefined, "aria-describedby": err(k) ? `co-${k}-err` : undefined });

  return (
    <form
      className="co"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        place();
      }}
    >
      <div className="co-main">
        <section className="co-sec" aria-labelledby="co-contact">
          <h2 id="co-contact" className="t-h3">
            01 CONTACT
          </h2>
          <div className="co-grid">
            <Field id="co-email" label="Email" error={err("email")}>
              <input id="co-email" className="input" type="email" autoComplete="email" value={f.email} onChange={set("email")} {...aria("email")} />
            </Field>
            <Field id="co-phone" label="Mobile (for WhatsApp updates)" error={err("phone")}>
              <div className="input-wrap">
                <span className="input-prefix t-mono">+91</span>
                <input id="co-phone" className="input" type="tel" inputMode="numeric" autoComplete="tel-national" value={f.phone} onChange={set("phone")} {...aria("phone")} />
              </div>
            </Field>
          </div>
        </section>

        <section className="co-sec" aria-labelledby="co-ship">
          <h2 id="co-ship" className="t-h3">
            02 DELIVERY
          </h2>
          <div className="co-grid">
            <Field id="co-name" label="Full name" error={err("name")}>
              <input id="co-name" className="input" autoComplete="name" value={f.name} onChange={set("name")} {...aria("name")} />
            </Field>
            <Field id="co-pincode" label="Pincode" error={err("pincode")}>
              <input id="co-pincode" className="input" inputMode="numeric" autoComplete="postal-code" value={f.pincode} onChange={set("pincode")} {...aria("pincode")} />
            </Field>
            <Field id="co-line1" label="House / flat, street" error={err("line1")}>
              <input id="co-line1" className="input" autoComplete="address-line1" value={f.line1} onChange={set("line1")} {...aria("line1")} />
            </Field>
            <Field id="co-line2" label="Area, landmark (optional)">
              <input id="co-line2" className="input" autoComplete="address-line2" value={f.line2} onChange={set("line2")} />
            </Field>
            <Field id="co-city" label="City" error={err("city")}>
              <input id="co-city" className="input" autoComplete="address-level2" value={f.city} onChange={set("city")} {...aria("city")} />
            </Field>
            <Field id="co-state" label="State" error={err("state")}>
              <input id="co-state" className="input" autoComplete="address-level1" value={f.state} onChange={set("state")} {...aria("state")} />
            </Field>
          </div>
          {pin && pin.ok && (
            <p className="t-meta co-eta" aria-live="polite">
              ARRIVES BY {formatShortDate(pin.deliveryBy).toUpperCase()} · {pin.cod ? "COD AVAILABLE" : "PREPAID ONLY"}
            </p>
          )}
        </section>

        <section className="co-sec" aria-labelledby="co-pay">
          <h2 id="co-pay" className="t-h3">
            03 PAYMENT
          </h2>
          <div className="co-pay" role="radiogroup" aria-label="Payment method">
            {(["UPI", "CARD", "COD"] as const).map((m) => {
              const disabled = m === "COD" && !codOk;
              return (
                <label key={m} className="co-pay-opt" data-checked={pay === m || undefined} data-disabled={disabled || undefined}>
                  <input type="radio" name="pay" value={m} checked={pay === m} disabled={disabled} onChange={() => setPay(m)} />
                  <span className="co-pay-title">{m === "UPI" ? "UPI" : m === "CARD" ? "CARD" : "CASH ON DELIVERY"}</span>
                  <span className="t-meta text-muted">{m === "UPI" ? "GPay, PhonePe, Paytm, any UPI app" : m === "CARD" ? "Visa, Mastercard, RuPay" : disabled ? "Not available for this order" : commerce.codFee ? `+${formatPrice(commerce.codFee)}` : "No extra fee"}</span>
                </label>
              );
            })}
          </div>
          {err("pay") && (
            <p className="field-error" role="alert">
              {err("pay")}
            </p>
          )}
          {pay === "UPI" && (
            <Field id="co-upi" label="UPI ID" error={err("upi")}>
              <input id="co-upi" className="input" autoComplete="off" placeholder="yourname@okbank" value={f.upi} onChange={set("upi")} {...aria("upi")} />
            </Field>
          )}
          {pay === "CARD" && (
            <div className="co-grid">
              <Field id="co-card" label="Card number" error={err("card")}>
                <input id="co-card" className="input t-mono" inputMode="numeric" autoComplete="cc-number" value={f.card} onChange={set("card")} {...aria("card")} />
              </Field>
              <div className="co-grid co-grid-2">
                <Field id="co-exp" label="Expiry (MM/YY)" error={err("exp")}>
                  <input id="co-exp" className="input t-mono" inputMode="numeric" autoComplete="cc-exp" value={f.exp} onChange={set("exp")} {...aria("exp")} />
                </Field>
                <Field id="co-cvv" label="CVV" error={err("cvv")}>
                  <input id="co-cvv" className="input t-mono" inputMode="numeric" autoComplete="cc-csc" value={f.cvv} onChange={set("cvv")} {...aria("cvv")} />
                </Field>
              </div>
            </div>
          )}
          {pay === "COD" && codOk && <p className="text-muted">Pay in cash or UPI when it arrives. Keep {formatPrice(total)} handy.</p>}
        </section>
      </div>

      <aside className="co-summary" aria-labelledby="co-sum">
        <h2 id="co-sum" className="t-h3">
          YOUR ORDER
        </h2>
        <ul className="co-lines">
          {cart.lines.map((l) => {
            const p = getProductSync(l.merchandise.product.handle);
            return (
              <li key={l.id} className="co-line">
                <span className="co-thumb">
                  <ProductImage src={l.merchandise.product.featuredImage.url} alt="" sizes="64px" tint={p?.wrng.colours[0].hex} />
                  <span className="co-qty tabular">{l.quantity}</span>
                </span>
                <span>
                  <span className="co-line-title">{l.merchandise.product.title}</span>
                  <span className="t-meta text-muted">{l.merchandise.title}</span>
                </span>
                <span className="tabular t-mono-lg">{formatPrice(Number(l.cost.totalAmount.amount))}</span>
              </li>
            );
          })}
        </ul>
        <div className="co-code">
          <div className="field">
            <label htmlFor="co-code">Discount code</label>
            <div className="pincode-row">
              <input id="co-code" className="input t-mono" value={f.code} onChange={set("code")} autoComplete="off" aria-describedby="co-code-msg" />
              <button type="button" className="btn btn-sm" onClick={applyCode} disabled={!f.code.trim()}>
                APPLY
              </button>
            </div>
            <p id="co-code-msg" className={applied ? "t-meta" : codeMsg ? "field-error" : "sr-only"} aria-live="polite">
              {codeMsg}
            </p>
          </div>
        </div>
        <dl className="co-totals tabular">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
          {discount > 0 && (
            <>
              <dt>Discount ({applied?.code})</dt>
              <dd>−{formatPrice(discount)}</dd>
            </>
          )}
          <dt>Shipping</dt>
          <dd>{shipping === 0 ? "FREE" : formatPrice(shipping)}</dd>
          <dt className="co-total">Total</dt>
          <dd className="co-total">{formatPrice(total)}</dd>
        </dl>
        <p className="t-meta text-muted">All prices include GST.</p>
        <button type="submit" className="btn btn-signal btn-block" data-loading={busy || undefined}>
          {pay === "COD" ? "PLACE ORDER" : `PAY ${formatPrice(total)}`}
        </button>
        <p className="t-meta text-muted">This is a demo checkout: nothing is charged. It hands off to Shopify checkout when connected.</p>
      </aside>
    </form>
  );
}
