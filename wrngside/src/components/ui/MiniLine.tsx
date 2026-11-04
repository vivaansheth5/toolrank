import Image from "next/image";
import type { ReactNode } from "react";
import { Peg } from "@/components/line/Garment";

export interface MiniItem {
  key: string;
  src: string;
  alt: string;
  /** Real-world size in cm, for true relative scale. */
  w: number;
  h: number;
  href?: string;
  hang?: string;
  caption?: ReactNode;
  action?: ReactNode;
}

/** Where a piece's top sits relative to the cable (px): pegs grip it, hangers hook over it. */
const HANG_OFFSET: Record<string, number> = { hanger: 22, folded: -6, handles: -10 };

/** A wire hanger hook curling over the cable. */
function Hook() {
  return (
    <svg className="mini-hook" viewBox="0 0 16 28" aria-hidden="true" focusable="false">
      <path d="M8 28 V15 C8 10 13 9.5 13 5.5 C13 1.5 8.5 0.5 5.5 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A small version of THE LINE: a sagging cable with pieces hung on it the way
 * they hang on the real one, swaying gently (CSS only; still under reduced
 * motion). On phones each row gets its own straight cable.
 */
export function MiniLine({ items, scale = 4.2, dark = false, label, linkAs }: { items: MiniItem[]; scale?: number; dark?: boolean; label: string; linkAs?: (it: MiniItem, body: ReactNode) => ReactNode }) {
  const n = Math.max(1, items.length);
  return (
    <div className={`mini-line${dark ? " is-dark" : ""}`} style={{ "--n": n, "--k": scale } as React.CSSProperties}>
      <svg className="mini-cable" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-10 10 Q500 70 1010 10" vectorEffect="non-scaling-stroke" />
      </svg>
      <ul className="mini-items" aria-label={label}>
        {items.map((it, i) => {
          const u = (i + 0.5) / n;
          const sag = 4 * u * (1 - u);
          const body = (
            <span className="mini-g" style={{ "--w": it.w, "--h": it.h, "--d": `${(i % 3) * -1.3}s` } as React.CSSProperties}>
              {it.hang === "hanger" && <Hook />}
              <span className="mini-img">
                <Image src={it.src} alt={it.alt} fill sizes="240px" loading="lazy" />
              </span>
              {it.hang !== "hanger" && it.hang !== "folded" && it.hang !== "handles" && (
                <span className="mini-peg" aria-hidden="true">
                  <Peg />
                </span>
              )}
            </span>
          );
          return (
            <li key={it.key} className="mini-item" style={{ "--u": u, "--sag": sag, "--off": `${HANG_OFFSET[it.hang ?? ""] ?? -2}px` } as React.CSSProperties}>
              {linkAs ? linkAs(it, body) : body}
              {it.caption && <div className="mini-cap">{it.caption}</div>}
              {it.action}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
