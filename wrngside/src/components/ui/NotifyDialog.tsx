"use client";

import { useEffect, useRef, useState } from "react";
import { createStore, useStore } from "@/lib/store";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { copy } from "@/lib/site-config";
import { CloseIcon } from "./Icons";
import { ContactField, validateContact, type ContactMode } from "./ContactField";
import { announce } from "@/components/shell/Announcer";

interface NotifyTarget {
  title: string;
  subtitle: string;
  key: string;
  size?: string;
}

const notifyStore = createStore<NotifyTarget | null>(null);
const signups = createStore<string[]>([], { key: "wrng:notify:v1" });

export function openNotify(p: { title: string; handle: string; wrng?: { type: string } }, size?: string) {
  notifyStore.set({ title: p.title, subtitle: p.wrng?.type ?? "", key: `${p.handle}${size ? `:${size}` : ""}`, size });
}
export function openNotifyFor(target: NotifyTarget) {
  notifyStore.set(target);
}

/** NOTIFY ME: email, or WhatsApp with +91. Mocked; wire to your ESP / WhatsApp BSP. */
export function NotifyDialog() {
  const target = useStore(notifyStore);
  const open = Boolean(target);
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<ContactMode>("email");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const close = () => notifyStore.set(null);
  useFocusTrap(ref, open, { onEscape: close });
  useScrollLock(open);
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the form each time it opens
    setDone(false);
    setError(null);
    setValue("");
  }, [open]);
  if (!target) return null;
  return (
    <div className="modal-root" data-open="true">
      <div className="modal-backdrop" onClick={close} aria-hidden="true" />
      <div ref={ref} className="modal theme-day" role="dialog" aria-modal="true" aria-labelledby="notify-title">
        <button type="button" className="icon-btn modal-close" onClick={close} aria-label="Close">
          <CloseIcon />
        </button>
        {done ? (
          <div className="modal-body">
            <p className="t-meta text-muted">ON THE LIST</p>
            <h2 id="notify-title" className="t-h2">
              WE&apos;LL PING YOU.
            </h2>
            <p>
              First word when {target.title}
              {target.size ? ` in ${target.size}` : ""} is back on the wire. One message. No spam.
            </p>
            <button type="button" className="btn btn-solid" onClick={close}>
              DONE
            </button>
          </div>
        ) : (
          <form
            className="modal-body"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const err = validateContact(mode, value);
              setError(err);
              if (err) return;
              setBusy(true);
              window.setTimeout(() => {
                signups.set((s) => [...new Set([...s, `${target.key}|${mode}:${value.trim()}`])]);
                setBusy(false);
                setDone(true);
                announce(`You'll be notified about ${target.title}.`);
              }, 500);
            }}
          >
            <p className="t-meta text-muted">{target.subtitle || "NOTIFY ME"}</p>
            <h2 id="notify-title" className="t-h2">
              {target.title}
              {target.size ? ` · ${target.size}` : ""}
            </h2>
            <p className="text-muted">{copy.soldOut}</p>
            <ContactField mode={mode} onMode={setMode} value={value} onValue={setValue} error={error} idPrefix="notify" />
            <button type="submit" className="btn btn-signal btn-block" data-loading={busy || undefined}>
              {copy.ctas.notifyMe}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
