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

/**
 * A small version of THE LINE: a sagging cable with pieces pegged on it,
 * swaying gently (CSS only; still under reduced motion).
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
            <li key={it.key} className="mini-item" style={{ "--u": u, "--sag": sag } as React.CSSProperties}>
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
