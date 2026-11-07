"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { ArrowIcon, CloseIcon } from "@/components/ui/Icons";
import type { GalleryImage } from "./ProductGallery";

/** Full-screen zoom: mouse pans on desktop, pinch-zoom and drag on touch, Esc closes. */
export function ZoomOverlay({ images, start, onClose }: { images: GalleryImage[]; start: number; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(start);
  const t = useRef({ x: 0, y: 0, s: 2 });
  useFocusTrap(root, true, { onEscape: onClose });
  useScrollLock(true);

  const apply = () => {
    const el = stage.current?.firstElementChild as HTMLElement | null;
    if (el) el.style.transform = `translate3d(${t.current.x}px, ${t.current.y}px, 0) scale(${t.current.s})`;
  };

  useEffect(() => {
    t.current = { x: 0, y: 0, s: window.matchMedia("(pointer: fine)").matches ? 2 : 1 };
    apply();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((v) => (v + 1) % images.length);
      if (e.key === "ArrowLeft") setI((v) => (v - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, images.length]);

  // Pointer handling: desktop pans with the mouse; touch pinches and drags.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const pts = new Map<number, { x: number; y: number }>();
    let pinch: { d: number; s: number } | null = null;
    let drag: { x: number; y: number; tx: number; ty: number } | null = null;
    const clampT = () => {
      const r = el.getBoundingClientRect();
      const s = t.current.s;
      const mx = ((s - 1) * r.width) / 2;
      const my = ((s - 1) * r.height) / 2;
      t.current.x = Math.max(-mx, Math.min(mx, t.current.x));
      t.current.y = Math.max(-my, Math.min(my, t.current.y));
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        const r = el.getBoundingClientRect();
        const s = t.current.s;
        t.current.x = -((e.clientX - r.left) / r.width - 0.5) * (s - 1) * r.width;
        t.current.y = -((e.clientY - r.top) / r.height - 0.5) * (s - 1) * r.height;
        apply();
        return;
      }
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const list = [...pts.values()];
      if (list.length === 2 && pinch) {
        const d = Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
        t.current.s = Math.max(1, Math.min(4, (pinch.s * d) / pinch.d));
      } else if (list.length === 1 && drag) {
        t.current.x = drag.tx + (e.clientX - drag.x);
        t.current.y = drag.ty + (e.clientY - drag.y);
      }
      clampT();
      apply();
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      el.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const list = [...pts.values()];
      if (list.length === 2) pinch = { d: Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y), s: t.current.s };
      else drag = { x: e.clientX, y: e.clientY, tx: t.current.x, ty: t.current.y };
    };
    const up = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (pts.size === 0) drag = null;
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  const img = images[i];
  return (
    <div ref={root} className="zoom" role="dialog" aria-modal="true" aria-label="Zoomed image" data-lenis-prevent>
      <div ref={stage} className="zoom-stage" onDoubleClick={() => ((t.current.s = t.current.s > 1 ? 1 : 2.5), apply())}>
        <div className="zoom-img">
          <Image src={img.src} alt={img.alt} fill sizes="100vw" style={{ objectFit: "contain" }} />
        </div>
      </div>
      <div className="zoom-ui">
        <span className="t-meta tabular">
          {String(i + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </span>
        <div className="zoom-nav">
          <button type="button" className="icon-btn" aria-label="Previous image" onClick={() => setI((v) => (v - 1 + images.length) % images.length)}>
            <ArrowIcon dir="left" />
          </button>
          <button type="button" className="icon-btn" aria-label="Next image" onClick={() => setI((v) => (v + 1) % images.length)}>
            <ArrowIcon />
          </button>
          <button type="button" className="icon-btn" aria-label="Close zoom" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
