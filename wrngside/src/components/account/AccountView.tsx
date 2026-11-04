"use client";

import { useState } from "react";
import Image from "next/image";
import { accountStore, type Address } from "@/lib/stores";
import { useStore, useHydrated } from "@/lib/store";
import { copy } from "@/lib/site-config";
import { formatPrice, formatShortDate } from "@/lib/format";
import { lookupPincode, isPincode } from "@/lib/delivery";
import { ContactField, normalisePhone, validateContact, type ContactMode } from "@/components/ui/ContactField";
import { Lines } from "@/components/ui/Lines";
import { TLink } from "@/components/ui/TLink";
import { announce } from "@/components/shell/Announcer";

function Login() {
  const [mode, setMode] = useState<ContactMode>("whatsapp");
  const [value, setValue] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [step, setStep] = useState<"id" | "otp">("id");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="acct-login">
      <p className="t-meta text-muted">ACCOUNT</p>
      <h1 className="t-h1">
        <Lines lines={["SIGN IN."]} mode="mount" />
      </h1>
      <p className="t-lead text-muted">No passwords. We send a 6-digit code to your phone or email.</p>
      {step === "id" ? (
        <form
          className="acct-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const v = validateContact(mode, value);
            setErr(v);
            if (v) return;
            setBusy(true);
            window.setTimeout(() => {
              setBusy(false);
              setStep("otp");
              announce("Code sent.");
            }, 600);
          }}
        >
          <ContactField mode={mode} onMode={setMode} value={value} onValue={setValue} error={err} idPrefix="acct" />
          <button type="submit" className="btn btn-signal" data-loading={busy || undefined}>
            SEND CODE
          </button>
        </form>
      ) : (
        <form
          className="acct-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^\d{6}$/.test(otp)) {
              setErr(copy.errors.otp);
              return;
            }
            accountStore.set((a) => ({ ...a, user: { name: "", phone: mode === "whatsapp" ? normalisePhone(value) : "", email: mode === "email" ? value.trim() : "" } }));
            announce("Signed in.");
          }}
        >
          <div className="field">
            <label htmlFor="acct-otp">Code sent to {mode === "whatsapp" ? `+91 ${normalisePhone(value)}` : value}</label>
            <input id="acct-otp" className="input t-mono otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} aria-invalid={Boolean(err) || undefined} aria-describedby={err ? "otp-err" : "otp-hint"} />
            <p id="otp-hint" className="t-meta text-muted">
              Demo: any 6 digits work.
            </p>
            {err && (
              <p id="otp-err" className="field-error" role="alert">
                {err}
              </p>
            )}
          </div>
          <div className="acct-row">
            <button type="submit" className="btn btn-signal">
              VERIFY
            </button>
            <button type="button" className="btn" onClick={() => setStep("id")}>
              CHANGE {mode === "whatsapp" ? "NUMBER" : "EMAIL"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const EMPTY_ADDR: Omit<Address, "id"> = { name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false };

function Addresses() {
  const { addresses } = useStore(accountStore);
  const [editing, setEditing] = useState<Address | Omit<Address, "id"> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const save = () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.line1.trim() || !isPincode(editing.pincode) || !/^[6-9]\d{9}$/.test(normalisePhone(editing.phone))) {
      setErr("FILL IN NAME, PHONE, ADDRESS AND A VALID PINCODE.");
      return;
    }
    accountStore.set((a) => {
      const id = "id" in editing ? editing.id : `addr-${Date.now()}`;
      const next = { ...editing, id, isDefault: editing.isDefault || a.addresses.length === 0 } as Address;
      const list = a.addresses.some((x) => x.id === id) ? a.addresses.map((x) => (x.id === id ? next : x)) : [...a.addresses, next];
      return { ...a, addresses: next.isDefault ? list.map((x) => ({ ...x, isDefault: x.id === id })) : list };
    });
    setEditing(null);
    setErr(null);
  };
  return (
    <section className="acct-sec" aria-labelledby="acct-addr">
      <div className="sec-head">
        <h2 id="acct-addr" className="t-h2">
          <Lines lines={["ADDRESSES"]} />
        </h2>
        <button type="button" className="btn btn-sm" onClick={() => setEditing({ ...EMPTY_ADDR })}>
          ADD ADDRESS
        </button>
      </div>
      {addresses.length === 0 && !editing && <p className="text-muted">No addresses yet. Add one for faster checkout.</p>}
      <ul className="addr-list">
        {addresses.map((a) => (
          <li key={a.id} className="addr">
            <p>
              <strong>{a.name}</strong> {a.isDefault && <span className="badge">DEFAULT</span>}
            </p>
            <p className="text-muted">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
            </p>
            <p className="t-meta">+91 {a.phone}</p>
            <div className="acct-row">
              <button type="button" className="link-u t-meta" onClick={() => setEditing(a)}>
                EDIT
              </button>
              {!a.isDefault && (
                <button type="button" className="link-u t-meta" onClick={() => accountStore.set((s) => ({ ...s, addresses: s.addresses.map((x) => ({ ...x, isDefault: x.id === a.id })) }))}>
                  MAKE DEFAULT
                </button>
              )}
              <button type="button" className="link-u t-meta" onClick={() => accountStore.set((s) => ({ ...s, addresses: s.addresses.filter((x) => x.id !== a.id) }))}>
                DELETE
              </button>
            </div>
          </li>
        ))}
      </ul>
      {editing && (
        <form
          className="addr-form co-grid"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          {(
            [
              ["name", "Full name", "name"],
              ["phone", "Mobile", "tel-national"],
              ["pincode", "Pincode", "postal-code"],
              ["line1", "House / flat, street", "address-line1"],
              ["line2", "Area, landmark", "address-line2"],
              ["city", "City", "address-level2"],
              ["state", "State", "address-level1"],
            ] as const
          ).map(([k, label, ac]) => (
            <div key={k} className="field">
              <label htmlFor={`ad-${k}`}>{label}</label>
              <input
                id={`ad-${k}`}
                className="input"
                autoComplete={ac}
                value={editing[k]}
                onChange={(e) => {
                  const v = k === "pincode" ? e.target.value.replace(/\D/g, "").slice(0, 6) : e.target.value;
                  setEditing((s) => {
                    if (!s) return s;
                    const next = { ...s, [k]: v };
                    if (k === "pincode" && isPincode(v)) {
                      const l = lookupPincode(v);
                      next.city = next.city || l.city;
                      next.state = next.state || l.state;
                    }
                    return next;
                  });
                }}
              />
            </div>
          ))}
          {err && (
            <p className="field-error" role="alert">
              {err}
            </p>
          )}
          <div className="acct-row">
            <button type="submit" className="btn btn-solid">
              SAVE ADDRESS
            </button>
            <button type="button" className="btn" onClick={() => setEditing(null)}>
              CANCEL
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export function AccountView() {
  const hydrated = useHydrated();
  const { user, orders } = useStore(accountStore);
  if (!hydrated) return <div className="wrap pt-header t-meta">LOADING…</div>;
  if (!user)
    return (
      <div className="wrap pt-header acct">
        <Login />
      </div>
    );
  return (
    <div className="wrap pt-header acct">
      <p className="t-meta text-muted">SIGNED IN AS {user.phone ? `+91 ${user.phone}` : user.email}</p>
      <h1 className="t-h1">
        <Lines lines={["YOUR ACCOUNT."]} mode="mount" />
      </h1>
      <div className="acct-row">
        <TLink href="/saved" className="btn btn-sm">
          YOUR LINE
        </TLink>
        <button type="button" className="btn btn-sm" onClick={() => accountStore.set((a) => ({ ...a, user: null }))}>
          SIGN OUT
        </button>
      </div>
      <section className="acct-sec" aria-labelledby="acct-orders">
        <h2 id="acct-orders" className="t-h2">
          <Lines lines={["ORDERS"]} />
        </h2>
        {orders.length === 0 ? (
          <p className="text-muted">
            Nothing yet.{" "}
            <TLink href="/" className="link-u">
              The line is waiting.
            </TLink>
          </p>
        ) : (
          <ul className="orders">
            {orders.map((o) => (
              <li key={o.id} className="order">
                <div className="order-top">
                  <span className="t-mono-lg">{o.id}</span>
                  <span className="badge">{o.status}</span>
                </div>
                <p className="t-meta text-muted">
                  {formatShortDate(new Date(o.createdAt)).toUpperCase()} · {o.lines.reduce((a, l) => a + l.quantity, 0)} ITEMS · {formatPrice(o.total)} · ARRIVES BY {formatShortDate(new Date(o.deliveryBy)).toUpperCase()}
                </p>
                <div className="order-thumbs">
                  {o.lines.map((l) => (
                    <span key={l.handle + l.variant} className="co-thumb">
                      <Image src={l.image} alt={l.title} fill sizes="56px" />
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Addresses />
    </div>
  );
}
