"use client";

import { copy } from "@/lib/site-config";

export type ContactMode = "email" | "whatsapp";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Indian mobile: 10 digits starting 6–9, optional +91 / 0 prefix. */
export function normalisePhone(v: string) {
  const d = v.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) return d.slice(2);
  if (d.length === 11 && d.startsWith("0")) return d.slice(1);
  return d;
}

export function validateContact(mode: ContactMode, v: string): string | null {
  if (!v.trim()) return copy.errors.required;
  if (mode === "email") return EMAIL.test(v.trim()) ? null : copy.errors.email;
  return /^[6-9]\d{9}$/.test(normalisePhone(v)) ? null : copy.errors.phone;
}

/** Email or WhatsApp (+91) input with a mode switch. Inputs are 16px (no iOS zoom). */
export function ContactField({
  mode,
  onMode,
  value,
  onValue,
  error,
  idPrefix,
  compact = false,
}: {
  mode: ContactMode;
  onMode: (m: ContactMode) => void;
  value: string;
  onValue: (v: string) => void;
  error: string | null;
  idPrefix: string;
  compact?: boolean;
}) {
  const id = `${idPrefix}-contact`;
  const errId = `${idPrefix}-err`;
  return (
    <div className={`contact-field${compact ? " is-compact" : ""}`}>
      <div className="seg" role="radiogroup" aria-label="How should we reach you?">
        {(["email", "whatsapp"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            className="seg-btn"
            onClick={() => {
              onMode(m);
              onValue("");
            }}
          >
            {m === "email" ? "EMAIL" : "WHATSAPP"}
          </button>
        ))}
      </div>
      <div className="field">
        <label htmlFor={id}>{mode === "email" ? "Email address" : "WhatsApp number"}</label>
        <div className="input-wrap">
          {mode === "whatsapp" && <span className="input-prefix t-mono">+91</span>}
          <input
            id={id}
            className="input"
            type={mode === "email" ? "email" : "tel"}
            inputMode={mode === "email" ? "email" : "numeric"}
            autoComplete={mode === "email" ? "email" : "tel-national"}
            placeholder={mode === "email" ? "you@wherever.com" : "98XXXXXXXX"}
            value={value}
            onChange={(e) => onValue(e.target.value)}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? errId : undefined}
            maxLength={mode === "email" ? 120 : 14}
          />
        </div>
        {error && (
          <p id={errId} className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
