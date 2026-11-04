import { copy } from "@/lib/site-config";
import { Lines } from "@/components/ui/Lines";

/** Care symbols, drawn (wash 30, no bleach, dry flat, iron low, no tumble). */
function CareIcons() {
  return (
    <svg className="care-icons" viewBox="0 0 220 32" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 8 L8 26 H30 L34 8" />
        <path d="M4 12 Q10 9 14 12 T24 12 T34 12" />
        <text x="19" y="23" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" fontFamily="monospace">
          30
        </text>
        <path d="M50 26 L62 6 L74 26 Z" />
        <path d="M54 8 L72 26 M72 8 L54 26" />
        <rect x="90" y="7" width="20" height="20" />
        <path d="M94 17 H106" />
        <path d="M128 22 H154 L150 10 H132 Z" />
        <circle cx="141" cy="17" r="1.4" fill="currentColor" />
        <rect x="170" y="7" width="20" height="20" />
        <circle cx="180" cy="17" r="7" />
        <path d="M172 9 L188 25 M188 9 L172 25" />
      </g>
    </svg>
  );
}

/** THE WRONG SIDE: the inside of a garment. Stitches draw themselves as the labels slide in. */
export function Craft() {
  return (
    <section className="craft theme-night" aria-labelledby="craft-title">
      <div className="craft-fabric" aria-hidden="true">
        <svg className="craft-stitches" viewBox="0 0 1200 700" preserveAspectRatio="none">
          <path className="st st-1" d="M0 120 C300 140 600 100 1200 130" />
          <path className="st st-2" d="M0 132 C300 152 600 112 1200 142" />
          <path className="st st-ol" d="M80 0 L96 700" />
          <path className="st st-ol" d="M1110 0 L1094 700" />
          <path className="st st-3" d="M0 610 C400 590 800 630 1200 600" />
        </svg>
      </div>
      <div className="wrap craft-inner">
        <div className="craft-copy">
          <p className="t-meta text-muted">06 — CRAFT</p>
          <h2 id="craft-title" className="t-h1">
            <Lines lines={[copy.craft.title]} />
          </h2>
          <p className="t-lead craft-intro">{copy.craft.intro}</p>
        </div>
        <div className="craft-labels">
          <div className="label-woven" data-reveal="fade">
            <span className="woven-mark">
              WR<span className="mirror">N</span>GSIDE
            </span>
            <span className="woven-sub">NEW DELHI · DROP 04</span>
          </div>
          <div className="label-care" data-reveal="fade" style={{ "--d": "160ms" } as React.CSSProperties}>
            <ul aria-label="What goes into every piece">
              {copy.craft.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <CareIcons />
            <p className="care-small">WASH COLD · INSIDE OUT · DRY IN SHADE · RN 04-2026</p>
          </div>
          <div className="label-size" data-reveal="fade" style={{ "--d": "300ms" } as React.CSSProperties} aria-hidden="true">
            L
          </div>
        </div>
      </div>
    </section>
  );
}
