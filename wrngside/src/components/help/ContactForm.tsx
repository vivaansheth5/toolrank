"use client";

import { useState } from "react";
import { copy, ui } from "@/lib/site-config";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", order: "", msg: "" });
  const [e, setE] = useState<Record<string, string | null>>({});
  const [sent, setSent] = useState(false);
  if (sent) return <p className="t-h3 contact-sent">{ui.help.contactForm.sent}</p>;
  return (
    <form
      className="contact-form"
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        const errs = {
          name: f.name.trim() ? null : copy.errors.required,
          email: EMAIL.test(f.email.trim()) ? null : copy.errors.email,
          msg: f.msg.trim().length > 4 ? null : copy.errors.required,
        };
        setE(errs);
        if (!Object.values(errs).some(Boolean)) setSent(true);
      }}
    >
      {(
        [
          ["name", ui.help.contactForm.name, "text"],
          ["email", ui.help.contactForm.email, "email"],
          ["order", ui.help.contactForm.order, "text"],
        ] as const
      ).map(([k, label, type]) => (
        <div key={k} className="field">
          <label htmlFor={`cf-${k}`}>{label}</label>
          <input id={`cf-${k}`} className="input" type={type} value={f[k]} onChange={(x) => setF((s) => ({ ...s, [k]: x.target.value }))} aria-invalid={Boolean(e[k]) || undefined} aria-describedby={e[k] ? `cf-${k}-err` : undefined} />
          {e[k] && (
            <p id={`cf-${k}-err`} className="field-error" role="alert">
              {e[k]}
            </p>
          )}
        </div>
      ))}
      <div className="field">
        <label htmlFor="cf-msg">{ui.help.contactForm.message}</label>
        <textarea id="cf-msg" className="input" rows={5} value={f.msg} onChange={(x) => setF((s) => ({ ...s, msg: x.target.value }))} aria-invalid={Boolean(e.msg) || undefined} aria-describedby={e.msg ? "cf-msg-err" : undefined} />
        {e.msg && (
          <p id="cf-msg-err" className="field-error" role="alert">
            {e.msg}
          </p>
        )}
      </div>
      <button type="submit" className="btn btn-solid">
        {ui.help.contactForm.send}
      </button>
    </form>
  );
}
