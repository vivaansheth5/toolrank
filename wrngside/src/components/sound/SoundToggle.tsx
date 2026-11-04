"use client";

import { useState } from "react";
import { sound } from "./sound";
import { ui } from "@/lib/site-config";

/** Tiny animated waveform. Sound is off by default and only starts on click. */
export function SoundToggle() {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      className="sound-toggle"
      data-on={on || undefined}
      aria-pressed={on}
      aria-label={on ? ui.shell.soundOn : ui.shell.soundOff}
      onClick={async () => {
        if (on) {
          sound.disable();
          setOn(false);
        } else {
          await sound.enable();
          setOn(true);
        }
      }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} style={{ "--i": i } as React.CSSProperties} />
      ))}
    </button>
  );
}
