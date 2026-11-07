import { copy, ui, drops } from "@/lib/site-config";
import { fill, formatPosterDate, formatDropSlot } from "@/lib/format";
import { Lines } from "@/components/ui/Lines";

/**
 * Wall layer (depth 0.8): a tall concrete side wall carrying the giant opening
 * poster, then a street wall painted over with pieces, throw-ups and tags
 * (scene plate), with two wheat-pastes for the live and next drop on top.
 * x positions are in P units along the wall.
 */
export function Wall({ dropNumber, dropName, pieces }: { dropNumber: string; dropName: string; pieces: number }) {
  const live = drops.list.find((d) => d.id === drops.live)!;
  const next = drops.list.find((d) => d.id === drops.next)!;
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
              WR<span className="mirror">N</span>GSIDE {fill(ui.scene.poster.drop, { drop: dropNumber })}
            </span>
            <span>{dropName}</span>
            <span>{fill(ui.scene.poster.pieces, { n: pieces })}</span>
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

      {/* Two wheat-pastes over the paint: the live drop and the next one. */}
      <div className="wall-art" aria-hidden="true">
        <div className="paste paste-yellow" style={{ "--wx": 1.9, "--wy": 0.53, "--r": "-1.5deg" } as React.CSSProperties}>
          <span className="paste-k">{fill(ui.scene.paste.dropPoster, { drop: dropNumber })}</span>
          <span className="paste-big">{dropName}</span>
          <span className="paste-k">{live.releasedAt ? formatPosterDate(live.releasedAt) : ""}</span>
        </div>
        <div className="paste paste-ink" style={{ "--wx": 11.9, "--wy": 0.5, "--r": "-1.5deg" } as React.CSSProperties}>
          <span className="paste-k">{ui.scene.paste.nextOnTheLine}</span>
          <span className="paste-big">{fill(ui.scene.paste.dropPoster, { drop: next.number })}</span>
          <span className="paste-k">{next.releaseAt ? formatDropSlot(next.releaseAt) : ""}</span>
        </div>
      </div>
    </div>
  );
}
