"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { lockScroll } from "./scroll";

/** Trap focus inside `ref` while `active`; restore focus to the opener on close. */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, opts: { onEscape?: () => void; initial?: string } = {}) {
  const onEscape = useRef(opts.onEscape);
  useEffect(() => {
    onEscape.current = opts.onEscape;
  });
  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    const opener = document.activeElement as HTMLElement | null;
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = () => [...el.querySelectorAll<HTMLElement>(selector)].filter((n) => n.offsetParent !== null || n === document.activeElement);
    const first = (opts.initial && el.querySelector<HTMLElement>(opts.initial)) || focusables()[0];
    requestAnimationFrame(() => (first ?? el).focus({ preventScroll: true }));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape.current?.();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) {
        e.preventDefault();
        return;
      }
      const a = list[0];
      const b = list[list.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        b.focus();
      } else if (!e.shiftKey && document.activeElement === b) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ref]);
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    return lockScroll();
  }, [active]);
}

/** Current time, ticking at `interval` ms. Null until mounted (avoids hydration mismatch). */
export function useNow(interval = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, interval);
    return () => window.clearInterval(id);
  }, [interval]);
  return now;
}

export function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(id);
  }, [value, ms]);
  return v;
}
