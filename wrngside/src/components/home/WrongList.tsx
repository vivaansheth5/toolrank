"use client";

import { useEffect, useRef, useState } from "react";
import { codes, copy, hindi } from "@/lib/site-config";
import { setPref, toast } from "@/lib/stores";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/device";
import { ContactField, validateContact, type ContactMode } from "@/components/ui/ContactField";
import { sound } from "@/components/sound/sound";
import { announce } from "@/components/shell/Announcer";
import { Lines } from "@/components/ui/Lines";

const STRIPS = 7;
const rand = () => Math.random();

/**
 * GET ON THE WRONG LIST: a flyer pasted on a pole. Tear-off strips can be
 * dragged down and torn; they fall with gravity and spin away. The last strip
 * reveals the code.
 */
export function WrongList() {
  const [mode, setMode] = useState<ContactMode>("email");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [torn, setTorn] = useState<number[]>([]);
  const strips = useRef<(HTMLButtonElement | null)[]>([]);
  // A pull that was let go early springs back; its trailing click must not tear.
  const pulled = useRef(new Set<number>());
  const section = useRef<HTMLElement>(null);
  const copyBtn = useRef<HTMLButtonElement>(null);
  // Keyboard focus follows the tearing: next strip, then the revealed code.
  const [focusCode, setFocusCode] = useState(false);
  const revealed = torn.length >= STRIPS;

  useEffect(() => {
    if (focusCode && revealed) copyBtn.current?.focus();
  }, [focusCode, revealed]);
  // Tweens made in handlers join this context and are cleaned up on unmount.
  const { contextSafe } = useGSAP({ scope: section });

  const tear = (i: number, vx = 0) => {
    const el = strips.current[i];
    if (!el || torn.includes(i) || el.dataset.falling !== undefined) return;
    sound.play("tear");
    // A falling strip can't be grabbed again.
    el.dataset.falling = "";
    if (document.activeElement === el) {
      const next = strips.current.find((s, j) => j !== i && s && !torn.includes(j) && s.dataset.falling === undefined);
      if (next) next.focus();
      else setFocusCode(true);
    }
    const done = () => setTorn((t) => (t.includes(i) ? t : [...t, i]));
    if (prefersReducedMotion()) {
      done();
      return;
    }
    // Fall with gravity, spin away.
    const dir = vx || (rand() - 0.5) * 2;
    contextSafe(() => {
      gsap
        .timeline({ onComplete: done })
        .to(el, { y: "+=40", rotation: dir * 12, duration: 0.12, ease: "power1.out" })
        .to(el, { y: "+=640", x: `+=${dir * 120 + (rand() - 0.5) * 80}`, rotation: `+=${dir * 220 + 180}`, opacity: 0, duration: 1.1, ease: "power2.in" });
    })();
  };

  const onDown = (i: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const startY = e.clientY;
    const startX = e.clientX;
    // No text selection or native drag while pulling with a mouse.
    if (e.pointerType === "mouse") e.preventDefault();
    el.setPointerCapture(e.pointerId);
    pulled.current.delete(i);
    const move = contextSafe((ev: PointerEvent) => {
      const dy = Math.max(0, ev.clientY - startY);
      if (dy > 6) pulled.current.add(i);
      gsap.set(el, { y: dy * 0.6, rotation: (ev.clientX - startX) * 0.08 });
      if (dy > 70) {
        cleanup();
        tear(i, Math.sign(ev.clientX - startX) || 1);
      }
    });
    const up = contextSafe(() => {
      cleanup();
      if (!torn.includes(i)) gsap.to(el, { y: 0, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
    });
    const cleanup = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  return (
    <section ref={section} className="wronglist" aria-labelledby="wl-title">
      <div className="wl-pole" aria-hidden="true">
        <span className="wl-plate">
          <span>{hindi.danger}</span>
          <span>440V</span>
        </span>
      </div>
      <div className="wl-flyer">
        <span className="tape wl-tape-l" aria-hidden="true" />
        <span className="tape wl-tape-r" aria-hidden="true" />
        <div className="wl-body">
          <p className="t-meta">NOTICE · NOTICE · NOTICE</p>
          <h2 id="wl-title" className="t-h1">
            <Lines lines={[copy.newsletter.title]} />
          </h2>
          <p className="t-lead">{copy.newsletter.body}</p>
          {state === "done" ? (
            <p className="t-h3 wl-done" role="status">
              {copy.newsletter.success}
            </p>
          ) : (
            <form
              noValidate
              className="wl-form"
              onSubmit={(e) => {
                e.preventDefault();
                const err = validateContact(mode, value);
                setError(err);
                if (err) return;
                setState("busy");
                window.setTimeout(() => {
                  setState("done");
                  setPref("newsletter", true);
                  announce(copy.newsletter.success);
                }, 600);
              }}
            >
              <ContactField mode={mode} onMode={setMode} value={value} onValue={setValue} error={error} idPrefix="wl" />
              <button type="submit" className="btn btn-solid" data-loading={state === "busy" || undefined}>
                GET ON IT
              </button>
              <p className="t-meta text-muted">{copy.newsletter.consent}</p>
            </form>
          )}
        </div>
        <div className="wl-strips" aria-label={`${copy.newsletter.tearHint}: ${STRIPS - torn.length} strips left`} role="group">
          {Array.from({ length: STRIPS }, (_, i) =>
            torn.includes(i) ? (
              <span key={i} className="wl-strip-gap" aria-hidden="true" />
            ) : (
              <button
                key={i}
                ref={(el) => {
                  strips.current[i] = el;
                }}
                type="button"
                className="wl-strip"
                onPointerDown={onDown(i)}
                // Dragging is never the only way (WCAG 2.5.7): a click, tap,
                // Enter or Space tears the strip too.
                onClick={() => {
                  if (pulled.current.delete(i)) return;
                  tear(i);
                }}
                aria-label={`Tear off strip ${i + 1}`}
              >
                <span>WRNGSIDE.COM/LIST</span>
              </button>
            ),
          )}
          {revealed && (
            <div className="wl-code" role="status">
              <span className="t-meta">YOU TORE IT ALL. HERE.</span>
              <span className="wl-code-text">{codes.newsletter.code}</span>
              <button
                ref={copyBtn}
                type="button"
                className="btn btn-sm btn-solid"
                onClick={() => {
                  void navigator.clipboard?.writeText(codes.newsletter.code).catch(() => {});
                  toast(copy.newsletter.copied);
                }}
              >
                COPY CODE
              </button>
            </div>
          )}
        </div>
        {!revealed && (
          <p className="t-meta wl-hint" aria-hidden="true">
            ↓ {copy.newsletter.tearHint}
          </p>
        )}
      </div>
    </section>
  );
}
