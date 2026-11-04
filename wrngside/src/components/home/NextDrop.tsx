"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { drops, copy, ui, site } from "@/lib/site-config";
import { countdownParts, pad2, formatDropSlot, fill } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import { REDUCED_MOTION } from "@/lib/device";
import { ContactField, validateContact, type ContactMode } from "@/components/ui/ContactField";
import { TLink } from "@/components/ui/TLink";
import { Lines } from "@/components/ui/Lines";
import "./countdown.css";

/**
 * A two-digit flap that flips when its value changes. `null` (before the
 * browser knows the time) shows dashes rather than a made-up number.
 */
export function Flap({ value, label }: { value: number | null; label: string }) {
  const v = value === null ? "--" : pad2(value);
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
            <Image src={`/campaign/${drop.id}.svg`} alt={fill(ui.home.nextDropAlt, { name: drop.name })} fill sizes="100vw" loading="lazy" />
          </div>
        </div>
      </div>
      <div className="wrap nd-body">
        <p className="t-meta">
          {live ? <span className="live-dot" aria-hidden="true" /> : null} {fill(ui.home.nextDrop, { number: drop.number, slot: formatDropSlot(drop.releaseAt!) })}
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
            <div className="countdown" role="timer" data-release={drop.releaseAt} aria-label={now === null ? ui.home.countdownIdle : fill(ui.home.countdownLabel, { days: cd.days, hours: cd.hours, minutes: cd.minutes, number: drop.number })}>
              <Flap value={now === null ? null : cd.days} label={ui.common.countdown.days} />
              <span className="flap-sep" aria-hidden="true">
                :
              </span>
              <Flap value={now === null ? null : cd.hours} label={ui.common.countdown.hours} />
              <span className="flap-sep" aria-hidden="true">
                :
              </span>
              <Flap value={now === null ? null : cd.minutes} label={ui.common.countdown.minutes} />
              <span className="flap-sep" aria-hidden="true">
                :
              </span>
              <Flap value={now === null ? null : cd.seconds} label={ui.common.countdown.seconds} />
              <span className="t-meta flap-tz">{site.timeZoneLabel}</span>
            </div>
            {done ? (
              <p className="t-h3 nd-done">{ui.home.notifyDone}</p>
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
