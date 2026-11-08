import type { PoleSpec } from "./layout";
import { hindi, ui, copy } from "@/lib/site-config";
import { categoryLabel } from "@/lib/commerce";

/** Lamp head position relative to the pole centre, in H units. */
export const LAMP = { dx: 0.092, y: 0.112 } as const;

function seeded(n: number) {
  let s = n * 9301 + 49297;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Concrete pole in a 300×1000 viewBox (1 unit = H/1000). Rendered inline so
 * its type uses the page fonts (Archivo, Teko for Devanagari).
 */
export function Pole({ pole }: { pole: PoleSpec }) {
  const id = `p${pole.index}`;
  const R = seeded(pole.index + 3);
  const flyers = Array.from({ length: 2 + Math.floor(R() * 3) }, (_, i) => ({
    y: 560 + i * 62 + R() * 30,
    w: 26 + R() * 14,
    h: 30 + R() * 22,
    rot: (R() - 0.5) * 10,
    c: ["#d9d2c2", "#e1c54b", "#d48f97", "#c9d0c4", "#ece6da"][Math.floor(R() * 5)],
    tear: R() > 0.55,
    dx: (R() - 0.5) * 10,
  }));
  const board = pole.board;
  return (
    <svg className="pole-svg" viewBox="0 0 300 1000" preserveAspectRatio="xMidYMin meet" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}c`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#3b3835" />
          <stop offset="0.45" stopColor="#6f6a64" />
          <stop offset="0.8" stopColor="#8d877e" />
          <stop offset="1" stopColor="#b9a58a" />
        </linearGradient>
        <linearGradient id={`${id}v`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.55" stopColor="#000" stopOpacity="0.18" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
        <filter id={`${id}sh`} x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      {/* Shadow on the wall, cast by the pole's own lamp (falls left and down). */}
      <path d="M118 470 L131 470 L112 905 L86 905 Z" fill="#000" opacity="0.45" filter={`url(#${id}sh)`} />

      {/* Upper crossarm with two insulators. */}
      <rect x="104" y="232" width="92" height="9" fill="#2c2b2a" />
      <rect x="104" y="232" width="92" height="2.5" fill="#7d776f" />
      {[114, 186].map((x) => (
        <g key={x}>
          <rect x={x - 4} y="214" width="8" height="18" fill="#e9e4da" />
          <ellipse cx={x} cy="216" rx="8" ry="3" fill="#f3efe7" />
          <ellipse cx={x} cy="223" rx="7" ry="2.6" fill="#d8d2c6" />
        </g>
      ))}

      {/* Lamp bracket and cobra-head luminaire (to the right). The group drops
          below the fixed header (--lamp-drop, in these units); the light layer
          follows the same offset. */}
      <g className="pole-lamp">
        <path d="M150 140 C150 108 178 92 226 94" stroke="#2a2927" strokeWidth="5" fill="none" />
        <path d="M150 156 C160 128 186 110 212 104" stroke="#2a2927" strokeWidth="2.5" fill="none" />
        <path d="M218 88 C232 84 262 88 270 98 C262 106 236 108 220 102 Z" fill="#34322f" />
        <path d="M223 101 C236 104 256 104 266 100 L262 106 C248 110 232 110 224 106 Z" className="lamp-lens" fill="#fff6e4" />
      </g>

      {/* Pole body. */}
      <path d="M141 92 L159 92 L166 905 L134 905 Z" fill={`url(#${id}c)`} />
      <path d="M141 92 L159 92 L166 905 L134 905 Z" fill={`url(#${id}v)`} />
      <path d="M148.5 120 L151.5 120 L152.5 880 L147.5 880 Z" fill="#000" opacity="0.28" />
      {Array.from({ length: 11 }, (_, i) => (
        <circle key={i} cx="150" cy={160 + i * 64} r="2.4" fill="#000" opacity="0.55" />
      ))}
      <path d="M158 92 L165 905" stroke="#d9b98a" strokeOpacity="0.35" strokeWidth="1.5" />
      <rect x="138" y="88" width="24" height="7" fill="#4a4743" />

      {/* Main crossarm (garment cable) with insulator. */}
      <rect x="96" y="300" width="108" height="10" fill="#2a2928" />
      <rect x="96" y="300" width="108" height="2.5" fill="#857e75" />
      {[106, 194].map((x) => (
        <g key={x}>
          <rect x={x - 4.5} y="279" width="9" height="21" fill="#e9e4da" />
          <ellipse cx={x} cy="281" rx="9" ry="3.2" fill="#f5f1ea" />
          <ellipse cx={x} cy="289" rx="8" ry="2.8" fill="#d6d0c4" />
        </g>
      ))}
      <path d="M128 300 L150 318 L172 300" stroke="#2a2928" strokeWidth="3" fill="none" />

      {/* Coiled service cable. */}
      <g fill="none" stroke="#111" strokeWidth="2.6">
        <ellipse cx="174" cy="352" rx="16" ry="22" transform="rotate(-12 174 352)" />
        <ellipse cx="177" cy="356" rx="15" ry="20" transform="rotate(-6 177 356)" />
        <ellipse cx="171" cy="350" rx="14" ry="23" transform="rotate(-18 171 350)" />
        <path d="M160 320 C166 330 170 334 172 332" />
      </g>

      {/* Danger plate, redone as a brand badge. */}
      <g transform="translate(150 486)">
        <rect x="-29" y="-38" width="58" height="72" fill="#ffd400" />
        <rect x="-26" y="-35" width="52" height="66" fill="none" stroke="#c4170c" strokeWidth="2" />
        <circle cx="0" cy="-20" r="7.5" fill="#c4170c" />
        <rect x="-4.5" y="-14.5" width="9" height="5" fill="#c4170c" />
        <circle cx="-2.8" cy="-21" r="1.8" fill="#ffd400" />
        <circle cx="2.8" cy="-21" r="1.8" fill="#ffd400" />
        <path d="M-9 -9 L9 -1 M9 -9 L-9 -1" stroke="#c4170c" strokeWidth="2.4" />
        <text x="0" y="9" textAnchor="middle" className="svg-deva" fontSize="11" fill="#c4170c">
          {hindi.danger}
        </text>
        <text x="0" y="17" textAnchor="middle" className="svg-display" fontSize="6.6" fill="#c4170c">
          {ui.scene.plate.danger}
        </text>
        <text x="0" y="25" textAnchor="middle" className="svg-display" fontSize="7.4" fill="#111">
          {ui.scene.plate.volts}
        </text>
        <text x="0" y="31" textAnchor="middle" className="svg-mono" fontSize="3.6" fill="#111" letterSpacing="0.4">
          {ui.scene.plate.brand}
        </text>
      </g>

      {/* Flyers, tape, a tear-off sheet. */}
      {flyers.map((f, i) => (
        <g key={i} transform={`translate(${150 + f.dx} ${f.y}) rotate(${f.rot})`}>
          <rect x={-f.w / 2} y={-f.h / 2} width={f.w} height={f.h} fill={f.c} opacity="0.92" />
          <rect x={-f.w / 2 + 3} y={-f.h / 2 + 4} width={f.w - 6} height="3" fill="#222" opacity="0.6" />
          <rect x={-f.w / 2 + 3} y={-f.h / 2 + 10} width={f.w * 0.6} height="1.6" fill="#222" opacity="0.45" />
          <rect x={-f.w / 2 + 3} y={-f.h / 2 + 14} width={f.w * 0.7} height="1.6" fill="#222" opacity="0.45" />
          {f.tear &&
            Array.from({ length: 4 }, (_, k) => <rect key={k} x={-f.w / 2 + 1 + k * (f.w / 4)} y={f.h / 2 - 1} width={f.w / 4 - 1.5} height="9" fill={f.c} opacity="0.9" />)}
          <rect x={-5} y={-f.h / 2 - 3} width="10" height="5" fill="#e8e2c8" opacity="0.5" />
        </g>
      ))}

      {pole.transformer && (
        <g className="transformer-art">
          <path d="M92 196 L92 300 M80 202 L104 202" stroke="#2a2928" strokeWidth="4" />
          <rect x="44" y="214" width="66" height="84" fill="#5d625c" />
          <rect x="44" y="214" width="66" height="84" fill={`url(#${id}v)`} />
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={48 + i * 9} y="226" width="4" height="62" fill="#3f433f" />
          ))}
          <rect x="40" y="208" width="74" height="9" fill="#4b504a" />
          {[56, 77, 98].map((x) => (
            <g key={x}>
              <rect x={x - 3} y="186" width="6" height="22" fill="#d9d3c6" />
              <ellipse cx={x} cy="190" rx="6.5" ry="2.4" fill="#ece7dc" />
              <ellipse cx={x} cy="198" rx="6" ry="2.2" fill="#ece7dc" />
              <path d={`M${x} 186 C${x + 10} 170 ${x + 40} 222 112 230`} stroke="#121212" strokeWidth="1.8" fill="none" />
            </g>
          ))}
          <rect x="58" y="262" width="26" height="16" fill="#ffd400" />
          <path d="M71 264 L66 271 L72 271 L68 277" stroke="#111" strokeWidth="1.6" fill="none" />
        </g>
      )}

      {board && (
        <g transform="translate(150 392)">
          <path d="M-10 -40 L-10 40 M10 -40 L10 40" stroke="#2a2928" strokeWidth="3" />
          <rect x="-74" y="-31" width="148" height="62" fill="#14593b" />
          <rect x="-70" y="-27" width="140" height="54" fill="none" stroke="#f3efe6" strokeWidth="2" />
          <text x="0" y="-3" textAnchor="middle" className="svg-display" fontSize={Math.min(15, 132 / ((categoryLabel(board).length + 5) * 0.86))} fill="#f3efe6">
            {categoryLabel(board)} {ui.scene.board.marg}
          </text>
          <text x="0" y="19" textAnchor="middle" className="svg-deva" fontSize="18" fill="#f3efe6">
            {hindi.marg[board]}
          </text>
          <rect x="-74" y="-31" width="148" height="62" fill="url(#boardSheen)" opacity="0.25" />
        </g>
      )}

      {pole.last && (
        <g transform="translate(150 420)">
          <path d="M-36 -64 L-36 64 M36 -64 L36 64" stroke="#2a2928" strokeWidth="4" />
          <rect x="-112" y="-58" width="224" height="116" fill="#eeeae3" />
          <rect x="-106" y="-52" width="212" height="104" fill="none" stroke="#0b0b0b" strokeWidth="2.5" />
          <text x="0" y="-8" textAnchor="middle" className="svg-display" fontSize="25" fill="#0b0b0b">
            {copy.hero.endBoard.split(" ")[0]}
          </text>
          <text x="0" y="22" textAnchor="middle" className="svg-display" fontSize="25" fill="#0b0b0b">
            {copy.hero.endBoard.split(" ").slice(1).join(" ")}
          </text>
          <path d="M-22 38 L18 38 M8 30 L18 38 L8 46" stroke="#ff3b1f" strokeWidth="4" fill="none" />
        </g>
      )}

      <defs>
        <linearGradient id="boardSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
