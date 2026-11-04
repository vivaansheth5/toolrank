"use client";

import { useEffect, useState } from "react";
import { checkPincode, type PincodeResult } from "@/lib/delivery";
import { formatShortDate, fill } from "@/lib/format";
import { copy, ui } from "@/lib/site-config";

/** 6-digit pincode check → "Delivery by Fri, 8 Nov · COD available" (mocked courier). */
export function Pincode() {
  const [pin, setPin] = useState("");
  const [res, setRes] = useState<PincodeResult | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wrng:pincode");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the last pincode used
      if (saved) setPin(saved);
    } catch {}
  }, []);
  const submit = () => {
    setBusy(true);
    window.setTimeout(() => {
      const r = checkPincode(pin);
      setRes(r);
      setBusy(false);
      if (r.ok)
        try {
          localStorage.setItem("wrng:pincode", r.pin);
        } catch {}
    }, 350);
  };
  const error = res && !res.ok ? (res.reason === "invalid" ? copy.errors.pincode : fill(copy.errors.pincodeNoService, { pin: res.pin })) : null;
  return (
    <form
      className="pincode"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label htmlFor="pincode" className="t-meta">
        {ui.product.pincode.label}
      </label>
      <div className="pincode-row">
        <input
          id="pincode"
          className="input"
          inputMode="numeric"
          autoComplete="postal-code"
          pattern="[0-9]*"
          maxLength={6}
          placeholder={ui.product.pincode.placeholder}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, "").slice(0, 6));
            setRes(null);
          }}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby="pincode-msg"
        />
        <button type="submit" className="btn btn-sm" disabled={pin.length !== 6} data-loading={busy || undefined}>
          {ui.product.pincode.check}
        </button>
      </div>
      <p id="pincode-msg" className={res && !res.ok ? "field-error" : "t-meta pincode-ok"} aria-live="polite">
        {error ??
          (res && res.ok ? (
            <>
              {fill(ui.product.pincode.deliveryBy, { date: formatShortDate(res.deliveryBy) })} · {res.cod ? ui.product.pincode.cod : ui.product.pincode.prepaid}
            </>
          ) : (
            ""
          ))}
      </p>
    </form>
  );
}
