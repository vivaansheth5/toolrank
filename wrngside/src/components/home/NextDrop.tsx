"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { drops, copy } from "@/lib/site-config";
import { countdownParts, pad2, formatDropSlot } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import { REDUCED_MOTION } from "@/lib/device";
import { ContactField, validateContact, type ContactMode } from "@/components/ui/ContactField";
import { TLink } from "@/components/ui/TLink";
import { Lines } from "@/components/ui/Lines";
import "./countdown.css";

/** A two-digit flap that flips when its value changes. */
export function Flap({ value, label }: { value: number; label: string }) {
  const v = pad2(value);
  return (
    <span className="flap">
      <span className="flap-digits tabular" aria-hidden="true">
        {v.split("").map((d, i) => (
          <span key={`${i}-${d}`} className="flap-d">
            {d}
          </span>
        ))}
      </span>
      <span className="flap-label t-meta">{label}</span>
    </span>
  );
}

export function NextDrop() {
  const drop = drops.list.find((d) => d.id === drops.next)!;
  const target = Date.parse(drop.releaseAt!);
  const now = useNow(1000);
  const cd = countdownParts(target - (now ?? 0));
  const live = now !== null && cd.done;
  const media = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<ContactMode>("email");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Inner parallax: the image moves at 0.85 inside its frame.
  useGSAP(
    () => {
      const el = media.current;
      if (!el || window.matchMedia(REDUCED_MOTION).matches) return;
      gsap.fromTo(".nd-img", { yPercent: -7.5 }, { yPercent: 7.5, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: media },
  );

  return (
    <section className="nextdrop theme-night" aria-labelledby="nd-title">
      <div ref={media} className="nd-media" data-reveal="img">
        <div className="reveal-inner nd-inner">
          <div className="nd-img">
            <Image src="/campaign/drop-05.svg" alt="The WRONG WAY varsity jacket hanging under a single streetlamp on a flyover at night" fill sizes="100vw" loading="lazy" />
          </div>
        </div>
      </div>
      <div className="wrap nd-body">
        <p className="t-meta">
          {live ? <span className="live-dot" aria-hidden="true" /> : null} NEXT DROP · {drop.number} · {formatDropSlot(drop.releaseAt!)}
        </p>
        <h2 id="nd-title" className="t-display nd-title axis-hover">
          <Lines lines={drop.name.split(" ")} />
        </h2>
        <p className="nd-story t-lead">{drop.story}</p>
        {live ? (
          <TLink href="/drops" className="btn btn-signal nd-cta">
            {copy.ctas.shopTheDrop}
          </TLink>
        ) : (
          <>
            <div className="countdown" role="timer" aria-label={now === null ? "Countdown" : `${cd.days} days, ${cd.hours} hours, ${cd.minutes} minutes until DROP ${drop.number}`}>
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
              <span className="t-meta flap-tz">IST</span>
            </div>
            {done ? (
              <p className="t-h3 nd-done">YOU&apos;LL HEAR FIRST. PHONE ON LOUD.</p>
            ) : (
              <form
                className="nd-form"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  const err = validateContact(mode, value);
                  setError(err);
                  if (!err) setDone(true);
                }}
              >
                <ContactField mode={mode} onMode={setMode} value={value} onValue={setValue} error={error} idPrefix="nd" compact />
                <button type="submit" className="btn btn-signal">
                  {copy.ctas.notifyMe}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </section>
  );
}
