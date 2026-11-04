"use client";

import { useRef, useState } from "react";
import type { Product } from "@/lib/commerce/types";
import { accessStore, useDropUnlocked } from "@/lib/stores";
import { codes, copy } from "@/lib/site-config";
import { countdownParts, formatDropSlot } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/device";
import { Flap } from "@/components/home/NextDrop";
import { ContactField, validateContact, type ContactMode } from "@/components/ui/ContactField";
import { MiniLine } from "@/components/ui/MiniLine";
import { TLink } from "@/components/ui/TLink";
import { Lines } from "@/components/ui/Lines";
import { formatPrice } from "@/lib/format";
import { sound } from "@/components/sound/sound";
import { announce } from "@/components/shell/Announcer";

function Chain() {
  return (
    <svg className="chain" viewBox="0 0 220 360" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <ellipse key={i} cx={30 + (i % 2) * 160} cy={20 + i * 38} rx="30" ry="12" transform={`rotate(${i % 2 ? -22 : 22} ${30 + (i % 2) * 160} ${20 + i * 38})`} fill="none" stroke="#8d8a84" strokeWidth="7" />
      ))}
      <path d="M30 20 L190 58 L30 96 L190 134 L30 172 L190 210 L30 248 L190 286 L30 324" stroke="#5f5c57" strokeWidth="5" fill="none" strokeDasharray="10 8" />
    </svg>
  );
}

function Padlock() {
  return (
    <svg className="padlock" viewBox="0 0 120 150" aria-hidden="true">
      <path d="M30 64 V42 a30 30 0 0 1 60 0 V64" fill="none" stroke="#a8a49c" strokeWidth="11" />
      <rect x="12" y="62" width="96" height="82" fill="#c39b4a" />
      <rect x="12" y="62" width="96" height="82" fill="url(#lockSheen)" />
      <circle cx="60" cy="96" r="9" fill="#2a2214" />
      <rect x="56" y="100" width="8" height="22" fill="#2a2214" />
      <defs>
        <linearGradient id="lockSheen" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DropLock({ dropId, number, name, releaseAt, story, pieces }: { dropId: string; number: string; name: string; releaseAt: string; story: string; pieces: Product[] }) {
  const now = useNow(1000);
  const codeUnlocked = useDropUnlocked(dropId);
  const timeUp = now !== null && now >= Date.parse(releaseAt);
  const open = codeUnlocked || timeUp;
  const [phase, setPhase] = useState<"locked" | "opening" | "open">("locked");
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const [mode, setMode] = useState<ContactMode>("email");
  const [value, setValue] = useState("");
  const [wErr, setWErr] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const cd = countdownParts(Date.parse(releaseAt) - (now ?? 0));

  // Already open when the page loaded (code entered on an earlier visit, or
  // the release has passed): show it open. The animation is for the live moment.
  // Decided on the first run (mount), before any open state can arrive.
  const openAtLoad = useRef<boolean | null>(null);

  // At zero (or with the code): the lamp flickers, the lock falls, pieces hang live.
  // No revertOnUpdate: the timeline must survive its own phase change.
  const { contextSafe } = useGSAP(
    () => {
      openAtLoad.current ??= accessStore.get().unlocked.includes(dropId) || Date.now() >= Date.parse(releaseAt);
      if (!open || phase !== "locked") return;
      const el = stage.current;
      if (!el || prefersReducedMotion() || openAtLoad.current) {
        setPhase("open");
        return;
      }
      setPhase("opening");
      sound.play("flicker");
      gsap
        .timeline({ onComplete: () => setPhase("open") })
        .to(".dl-lamp", { opacity: 1, duration: 0.06 })
        .to(".dl-lamp", { opacity: 0.1, duration: 0.09 })
        .to(".dl-lamp", { opacity: 1, duration: 0.04 })
        .to(".dl-lamp", { opacity: 0.15, duration: 0.22 })
        .to(".dl-lamp", { opacity: 1, duration: 0.4 })
        .to(".padlock", { rotation: 28, y: 30, duration: 0.25, ease: "power2.in" }, "-=0.2")
        .to(".padlock", { y: 900, rotation: 120, duration: 0.9, ease: "power3.in" })
        .to(".chain", { y: 400, opacity: 0, duration: 0.8, ease: "power3.in" }, "<0.1");
      announce(`DROP ${number} is unlocked.`);
    },
    { scope: stage, dependencies: [open, phase, number, dropId, releaseAt] },
  );
  const shake = contextSafe(() => {
    gsap.fromTo(".dl-code .input", { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  });

  const items = pieces.map((p) => ({
    key: p.handle,
    src: p.wrng.colours[0].media.cutout,
    alt: `${p.title} ${p.wrng.type}`,
    w: p.wrng.dims.w,
    h: p.wrng.dims.h,
    href: `/products/${p.handle}`,
    hang: p.wrng.hangStyle,
    caption: (
      <>
        <span className="mini-title">{p.title}</span>
        <span className="t-meta">{formatPrice(p.wrng.price)}</span>
      </>
    ),
  }));

  return (
    <section className="droplock theme-night" aria-labelledby="dl-title">
      <div ref={stage} className="dl-stage" data-phase={phase}>
        <div className="dl-visual" aria-hidden={phase === "open"}>
          <span className="dl-lamp" />
          <span className="dl-pole" />
          {phase !== "open" && (
            <>
              <Chain />
              <Padlock />
            </>
          )}
        </div>
        <div className="wrap dl-copy">
          <p className="t-meta">
            DROP {number} · {formatDropSlot(releaseAt)}
          </p>
          <h1 id="dl-title" className="t-display">
            <Lines lines={[name]} mode="mount" />
          </h1>
          <p className="t-lead dl-story">{story}</p>
          {phase === "open" ? (
            <div className="dl-open">
              <p className="t-meta">
                <span className="live-dot" aria-hidden="true" /> LIVE NOW ON THE LINE
              </p>
              <MiniLine items={items} dark label={`DROP ${number} pieces`} linkAs={(it, body) => <TLink href={it.href!}>{body}</TLink>} />
            </div>
          ) : (
            <>
              <div className="countdown" role="timer" aria-label={`${cd.days} days ${cd.hours} hours ${cd.minutes} minutes left`}>
                <Flap value={cd.days} label="DD" />
                <span className="flap-sep" aria-hidden="true">
                  :
                </span>
                <Flap value={cd.hours} label="HH" />
                <span className="flap-sep" aria-hidden="true">
                  :
                </span>
                <Flap value={cd.minutes} label="MM" />
                <span className="flap-sep" aria-hidden="true">
                  :
                </span>
                <Flap value={cd.seconds} label="SS" />
              </div>
              <div className="dl-forms">
                <form
                  className="dl-code"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (code.trim().toUpperCase() === codes.drop05Access) {
                      accessStore.set((s) => ({ unlocked: [...new Set([...s.unlocked, dropId])] }));
                      setCodeErr(null);
                    } else {
                      setCodeErr(copy.errors.code);
                      if (!prefersReducedMotion()) shake();
                    }
                  }}
                >
                  <div className="field">
                    <label htmlFor="dl-code-input">ENTER ACCESS CODE</label>
                    <div className="pincode-row">
                      <input id="dl-code-input" className="input t-mono" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} aria-invalid={Boolean(codeErr) || undefined} aria-describedby={codeErr ? "dl-code-err" : undefined} />
                      <button type="submit" className="btn btn-sm">
                        UNLOCK
                      </button>
                    </div>
                    {codeErr && (
                      <p id="dl-code-err" className="field-error" role="alert">
                        {codeErr}
                      </p>
                    )}
                  </div>
                </form>
                {joined ? (
                  <p className="t-h3">YOU&apos;RE ON THE WAITLIST. PHONE ON LOUD.</p>
                ) : (
                  <form
                    className="dl-wait"
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      const err = validateContact(mode, value);
                      setWErr(err);
                      if (!err) setJoined(true);
                    }}
                  >
                    <p className="t-meta">JOIN THE WAITLIST</p>
                    <ContactField mode={mode} onMode={setMode} value={value} onValue={setValue} error={wErr} idPrefix="dl" compact />
                    <button type="submit" className="btn btn-signal">
                      JOIN THE WAITLIST
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
