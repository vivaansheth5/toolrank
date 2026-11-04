import { copy, hindi } from "@/lib/site-config";
import { fill } from "@/lib/format";
import { Lines } from "@/components/ui/Lines";

/**
 * Wall layer (depth 0.8): a tall plastered side wall carrying the giant opening
 * poster, then a boundary wall covered in wheat-paste posters and stickers.
 * x positions are in P units along the wall.
 */
export function Wall({ dropNumber, dropName, pieces }: { dropNumber: string; dropName: string; pieces: number }) {
  const [subText] = fill(copy.hero.sub, { drop: dropNumber }).split("→");
  const [subTouch] = fill(copy.hero.subTouch, { drop: dropNumber }).split("→");
  return (
    <div className="lyr lyr-wall" data-depth="0.8">
      <div className="wall-base" aria-hidden="true" />
      <div className="wall-tall" aria-hidden="true" />

      {/* Opening frame: the giant poster. */}
      <div className="poster-hero">
        <div className="poster-hero-paper" aria-hidden="true" />
        <div className="poster-hero-inner">
          <p className="poster-kicker t-meta" aria-hidden="true">
            <span>
              WR<span className="mirror">N</span>GSIDE · DROP {dropNumber}
            </span>
            <span>{dropName}</span>
            <span>{pieces} PIECES</span>
          </p>
          <h1 id="line-title" className="t-display poster-title">
            <Lines lines={[...copy.hero.headline]} mode="mount" />
          </h1>
          <p className="poster-sub t-mono-lg">
            <span className="hint-desk">{subText.trim()}</span>
            <span className="hint-touch">{subTouch.trim()}</span> <span className="poster-arrow" aria-hidden="true">→</span>
          </p>
        </div>
        <span className="tape tape-tl" aria-hidden="true" />
        <span className="tape tape-br" aria-hidden="true" />
      </div>

      {/* Wheat-paste wall. */}
      <div className="wall-art" aria-hidden="true">
        <div className="paste paste-yellow" style={{ "--wx": 1.9, "--wy": 0.53, "--r": "-1.5deg" } as React.CSSProperties}>
          <span className="paste-k">DROP {dropNumber}</span>
          <span className="paste-big">LIVE WIRE</span>
          <span className="paste-k">16.10.26 · 8 PM IST</span>
        </div>
        <div className="paste-grid" style={{ "--wx": 2.75, "--wy": 0.5 } as React.CSSProperties}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="paste paste-pink" style={{ "--r": `${(i % 3) - 1}deg` } as React.CSSProperties}>
              <span className="paste-mid">WRONG SIDE ONLY</span>
              <span className="paste-arrow">←</span>
            </div>
          ))}
        </div>
        <div className="sticker sticker-noentry" style={{ "--wx": 3.55, "--wy": 0.62 } as React.CSSProperties} />
        <div className="stencil deva" style={{ "--wx": 4.0, "--wy": 0.6 } as React.CSSProperties}>
          {hindi.wrongSide}
        </div>
        <div className="paste paste-ink" style={{ "--wx": 5.05, "--wy": 0.52, "--r": "1deg" } as React.CSSProperties}>
          <span className="paste-k">440 VOLTS OF</span>
          <span className="paste-big">HEAVY COTTON</span>
          <span className="paste-k">240 GSM · PUFF PRINT</span>
        </div>
        <div className="flyer" style={{ "--wx": 5.85, "--wy": 0.56, "--r": "-2deg" } as React.CSSProperties}>
          <span className="flyer-title">LOST: ONE SOCK</span>
          <span className="flyer-body">Last seen on the line. Answers to SPARK. Reward.</span>
          <span className="flyer-tabs">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i}>WRNGSIDE.COM</span>
            ))}
          </span>
        </div>
        <div className="sticker sticker-440" style={{ "--wx": 6.4, "--wy": 0.72 } as React.CSSProperties}>
          440V
        </div>
        <div className="paste paste-green" style={{ "--wx": 7.0, "--wy": 0.5, "--r": "2deg" } as React.CSSProperties}>
          <span className="paste-k">REVERSIBLE</span>
          <span className="paste-big">U-TURN</span>
          <span className="paste-k">WEAR IT WRONG</span>
        </div>
        <div className="torn" style={{ "--wx": 7.9, "--wy": 0.58 } as React.CSSProperties} />
        <div className="paste paste-yellow" style={{ "--wx": 8.6, "--wy": 0.54, "--r": "-1deg" } as React.CSSProperties}>
          <span className="paste-k">NOW SHOWING</span>
          <span className="paste-big">SHORT CIRCUIT</span>
          <span className="paste-k">CARGOS · 6 POCKETS</span>
        </div>
        <div className="stencil stencil-arrow" style={{ "--wx": 9.6, "--wy": 0.66 } as React.CSSProperties}>
          ← WRONG WAY
        </div>
        <div className="paste-grid paste-grid-sm" style={{ "--wx": 10.4, "--wy": 0.52 } as React.CSSProperties}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="paste paste-bone" style={{ "--r": `${(i % 2) * 2 - 1}deg` } as React.CSSProperties}>
              <span className="paste-mid">NO SPAM ONLY VOLTAGE</span>
            </div>
          ))}
        </div>
        <div className="sticker sticker-n" style={{ "--wx": 11.3, "--wy": 0.64 } as React.CSSProperties}>
          <span className="mirror">N</span>
        </div>
        <div className="paste paste-ink" style={{ "--wx": 11.9, "--wy": 0.5, "--r": "-1.5deg" } as React.CSSProperties}>
          <span className="paste-k">NEXT ON THE LINE</span>
          <span className="paste-big">DROP 05</span>
          <span className="paste-k">FRI · 8 PM IST</span>
        </div>
      </div>
    </div>
  );
}
