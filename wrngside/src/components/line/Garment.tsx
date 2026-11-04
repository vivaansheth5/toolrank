import Image from "next/image";
import type { GarmentSpec } from "./layout";
import { formatPrice } from "@/lib/format";
import { hashString } from "./hash";

export function Peg({ open = false }: { open?: boolean }) {
  return (
    <svg className="peg" viewBox="0 0 30 100" aria-hidden="true" focusable="false" data-open={open || undefined}>
      <g className="peg-l">
        <path d="M5 2 L14 2 L15.2 98 L9 98 Q5 60 5 2 Z" fill="#c79a62" />
        <path d="M5 2 L8 2 L9.6 97 L9 98 Q5 60 5 2 Z" fill="#e2bd86" opacity="0.7" />
      </g>
      <g className="peg-r">
        <path d="M16 2 L25 2 Q25 60 21 98 L14.8 98 L16 2 Z" fill="#b8884f" />
        <path d="M22 2 L25 2 Q25 60 21 98 L20 98 Z" fill="#000" opacity="0.18" />
      </g>
      <path d="M3 40 C3 34 27 34 27 40 C27 46 3 46 3 40 Z" fill="none" stroke="#9ea3a6" strokeWidth="2.4" />
      <path d="M3 40 C3 46 27 46 27 40" stroke="#5b6064" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

/** Wire hanger hook (the shoulders sit inside the garment, so only the hook shows). */
function Hanger() {
  return (
    <svg className="hanger" viewBox="0 0 44 16" aria-hidden="true" focusable="false">
      <path d="M22 13.5 L22 9.4 C22 8.2 24.8 7.4 25.4 5.2 C26 3 24.6 0.7 22.3 0.6 C20 0.5 18.6 2 18.6 3.8" fill="none" stroke="#8d9296" strokeWidth="0.42" strokeLinecap="round" />
      <path d="M22 13.5 L22 9.4 C22 8.2 24.8 7.4 25.4 5.2" fill="none" stroke="#d6dadc" strokeWidth="0.16" strokeLinecap="round" />
      <path d="M21.4 10 L22.6 10.6 M21.4 11 L22.6 11.6 M21.4 12 L22.6 12.6" stroke="#6b7074" strokeWidth="0.2" />
    </svg>
  );
}

function Barcode({ seed }: { seed: string }) {
  let h = hashString(seed);
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  while (x < 58) {
    h = (h * 1103515245 + 12345) >>> 0;
    const w = 0.6 + ((h >>> 8) % 3) * 0.7;
    bars.push({ x, w });
    x += w + 0.6 + ((h >>> 4) % 2) * 0.8;
  }
  return (
    <svg className="tag-barcode" viewBox="0 0 60 14" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y="0" width={b.w} height="14" fill="#1b1611" />
      ))}
    </svg>
  );
}

export function SwingTag({ g, dropNumber }: { g: GarmentSpec; dropNumber: string }) {
  const soldOut = g.sizes.every((s) => !s.available);
  return (
    <div className="tag" style={{ "--tx": g.tagCm } as React.CSSProperties} data-tag={g.index}>
      <span className="tag-string" aria-hidden="true" />
      <div className="tag-card">
        <div className="tag-face tag-front" aria-hidden="true">
          <span className="tag-hole" />
          <span className="tag-brand">
            WR<span className="mirror">N</span>GSIDE
          </span>
          <span className="tag-name">{g.title}</span>
          <span className="tag-type">{g.type}</span>
          <span className="tag-price">{formatPrice(g.price)}</span>
          <span className="tag-drop">DROP {dropNumber}</span>
          <Barcode seed={g.handle} />
          <span className="tag-sizes">
            {g.sizes.map((s) => (
              <span key={s.label} className={s.available ? "" : "gone"}>
                {s.label.replace("ONE SIZE", "OS")}
              </span>
            ))}
          </span>
        </div>
        <div className="tag-face tag-back" role="group" aria-label={`Quick add ${g.title}`}>
          <span className="tag-hole" aria-hidden="true" />
          <span className="tag-qa">{soldOut ? "GONE" : "QUICK ADD"}</span>
          <span className="tag-qa-sizes">
            {g.sizes.map((s) => (
              <button
                key={s.label}
                type="button"
                className="tag-size"
                data-action="quick-add"
                data-handle={g.handle}
                data-colour={g.colourName}
                data-size={s.label}
                disabled={!s.available}
                aria-label={s.available ? `Add ${g.title} size ${s.label} to bag` : `${g.title} size ${s.label} sold out`}
              >
                {s.label.replace("ONE SIZE", "OS").replace("UK ", "")}
              </button>
            ))}
          </span>
          <span className="tag-price">{formatPrice(g.price)}</span>
        </div>
      </div>
    </div>
  );
}

export function Garment({ g, priority }: { g: GarmentSpec; priority: boolean }) {
  return (
    <a className="g-link" href={`/products/${g.handle}`} aria-label={g.label} data-cursor="view" draggable={false} data-handle={g.handle}>
      <span className="g-body" data-hang={g.hangStyle}>
        {g.hangStyle === "hanger" && <Hanger />}
        <span className="g-img">
          <Image src={g.cutout} alt="" fill sizes="(hover: hover) and (pointer: fine) 24vw, 62vw" preload={priority} loading={priority ? "eager" : "lazy"} draggable={false} />
        </span>
        {g.pegs.map((p, i) => (
          <span key={i} className="g-peg" style={{ "--px": p } as React.CSSProperties}>
            <Peg />
          </span>
        ))}
      </span>
    </a>
  );
}
