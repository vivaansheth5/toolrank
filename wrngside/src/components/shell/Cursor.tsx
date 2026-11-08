"use client";

import { useEffect, useRef } from "react";
import { addFrame } from "@/lib/frame-loop";
import { FINE_POINTER, REDUCED_MOTION } from "@/lib/device";

type Mode = "dot" | "link" | "drag" | "view" | "soldout" | "hidden";

const LABEL: Partial<Record<Mode, string>> = { drag: "DRAG ← →", view: "VIEW", soldout: "SOLD OUT" };

/**
 * 10px bone dot (difference blend, lerp .18). Grows into a 76px labelled ring
 * over THE LINE ("DRAG ← →"), garments ("VIEW") and sold-out items; shrinks to
 * 4px over links; hands over to the native cursor on text inputs.
 */
export function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia(FINE_POINTER).matches) return;
    const el = root.current!;
    const html = document.documentElement;
    html.classList.add("has-cursor");
    const reduced = window.matchMedia(REDUCED_MOTION).matches;
    let tx = -100;
    let ty = -100;
    let x = tx;
    let y = ty;
    let mode: Mode = "dot";
    let visible = false;

    const setMode = (m: Mode) => {
      if (m === mode) return;
      mode = m;
      el.dataset.mode = m;
      if (label.current) label.current.textContent = LABEL[m] ?? "";
    };

    const resolve = (target: Element | null) => {
      const t = target as HTMLElement | null;
      if (!t || !t.closest) return setMode("dot");
      if (t.closest("input, textarea, select, [contenteditable], .native-cursor")) return setMode("hidden");
      const tagged = t.closest<HTMLElement>("[data-cursor]");
      if (tagged) return setMode((tagged.dataset.cursor as Mode) || "dot");
      if (t.closest("a, button, [role='button'], label, summary")) return setMode("link");
      setMode("dot");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        x = tx;
        y = ty;
        el.dataset.visible = "true";
      }
    };
    const onOver = (e: PointerEvent) => resolve(e.target as Element);
    const onLeave = () => {
      visible = false;
      el.dataset.visible = "false";
    };
    const onDown = () => el.classList.add("is-down");
    const onUp = () => el.classList.remove("is-down");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("wrng:cursor-refresh", () => resolve(document.elementFromPoint(tx, ty)));

    const loop = addFrame(
      "cursor",
      (_t, dt) => {
        const k = reduced ? 1 : 1 - Math.pow(1 - 0.18, dt * 60);
        x += (tx - x) * k;
        y += (ty - y) * k;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      },
      100,
    );
    return () => {
      loop.remove();
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div ref={root} className="cursor" data-mode="dot" data-visible="false" aria-hidden="true">
      <span className="cursor-dot" />
      <span className="cursor-ring">
        <span ref={label} className="cursor-label" />
      </span>
    </div>
  );
}
