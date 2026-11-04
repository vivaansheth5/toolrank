/* Custom line icons, drawn for WRNGSIDE (1.5px strokes, square caps). */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size: number) => ({ width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "square" as const, "aria-hidden": true });

/** Wooden clothes peg. Filled = pegged. */
export function PegIcon({ size = 20, filled = false, ...p }: P & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" {...base(size)} {...p}>
      <path d="M7.2 1.5 L9 1.5 L9.6 18.5 L7.6 18.5 Z" fill={filled ? "currentColor" : "none"} />
      <path d="M11 1.5 L12.8 1.5 L12.4 18.5 L10.4 18.5 Z" fill={filled ? "currentColor" : "none"} />
      <path d="M6.2 9.2 H13.8 M6.2 11 H13.8" />
    </svg>
  );
}

export function BagIcon({ size = 18, ...p }: P) {
  return (
    <svg viewBox="0 0 18 18" {...base(size)} {...p}>
      <path d="M3 6 H15 L14 16.5 H4 Z" />
      <path d="M6 6 V4.5 A3 3 0 0 1 12 4.5 V6" />
    </svg>
  );
}

export function SearchIcon({ size = 18, ...p }: P) {
  return (
    <svg viewBox="0 0 18 18" {...base(size)} {...p}>
      <circle cx="7.5" cy="7.5" r="5.5" />
      <path d="M11.6 11.6 L16 16" />
    </svg>
  );
}

export function CloseIcon({ size = 18, ...p }: P) {
  return (
    <svg viewBox="0 0 18 18" {...base(size)} {...p}>
      <path d="M3 3 L15 15 M15 3 L3 15" />
    </svg>
  );
}

export function ArrowIcon({ size = 18, dir = "right", ...p }: P & { dir?: "right" | "left" | "down" | "up" }) {
  const rot = { right: 0, down: 90, left: 180, up: 270 }[dir];
  return (
    <svg viewBox="0 0 18 18" {...base(size)} {...p} style={{ transform: `rotate(${rot}deg)`, ...(p.style || {}) }}>
      <path d="M2 9 H15 M10 4 L15 9 L10 14" />
    </svg>
  );
}

export function PlusIcon({ size = 14, ...p }: P) {
  return (
    <svg viewBox="0 0 14 14" {...base(size)} {...p}>
      <path d="M7 1 V13 M1 7 H13" />
    </svg>
  );
}

export function MinusIcon({ size = 14, ...p }: P) {
  return (
    <svg viewBox="0 0 14 14" {...base(size)} {...p}>
      <path d="M1 7 H13" />
    </svg>
  );
}

export function InstagramIcon({ size = 18, ...p }: P) {
  return (
    <svg viewBox="0 0 18 18" {...base(size)} {...p}>
      <rect x="2" y="2" width="14" height="14" />
      <circle cx="9" cy="9" r="3.4" />
      <path d="M13 4.6 V4.8" strokeWidth="2" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 18, ...p }: P) {
  return (
    <svg viewBox="0 0 18 18" {...base(size)} {...p}>
      <path d="M2.5 15.5 L3.6 12.2 A6.8 6.8 0 1 1 6 14.5 Z" />
      <path d="M6.6 6.4 C6.6 9 8.8 11.4 11.6 11.4 L12 10.2 L10.6 9.6 L9.9 10.3 C9 9.9 8.2 9.1 7.8 8.2 L8.5 7.5 L7.9 6 Z" strokeWidth="1.1" />
    </svg>
  );
}

export function MailIcon({ size = 18, ...p }: P) {
  return (
    <svg viewBox="0 0 18 18" {...base(size)} {...p}>
      <rect x="2" y="4" width="14" height="10" />
      <path d="M2 4.5 L9 10 L16 4.5" />
    </svg>
  );
}

export function GridIcon({ size = 16, cols = 2, ...p }: P & { cols?: number }) {
  const w = (16 - (cols - 1) * 2) / cols;
  return (
    <svg viewBox="0 0 16 16" {...base(size)} {...p}>
      {Array.from({ length: cols }, (_, i) => (
        <rect key={i} x={i * (w + 2)} y="1" width={w} height="14" />
      ))}
    </svg>
  );
}

export function LockIcon({ size = 18, ...p }: P) {
  return (
    <svg viewBox="0 0 18 18" {...base(size)} {...p}>
      <rect x="3.5" y="8" width="11" height="8" />
      <path d="M6 8 V5.5 A3 3 0 0 1 12 5.5 V8" />
    </svg>
  );
}
