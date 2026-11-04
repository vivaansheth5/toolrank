import Image from "next/image";
import { getLineProducts, accessibleName, liveDrop } from "@/lib/commerce";
import { copy, codes, hindi } from "@/lib/site-config";
import { fill } from "@/lib/format";
import { buildLineLayout, spanPathD, type LineGarmentInput, LINE } from "./layout";
import { Pole, LAMP } from "./Pole";
import { Garment, SwingTag } from "./Garment";
import { Wall } from "./Wall";
import { Crow } from "./Crow";
import { sceneAnchors } from "./scene-anchors";
import { LineController } from "./LineController";
import "./line.css";

const SHOP_SIGNS = ["चाय", "SHARMA ELECTRICALS", "मोबाइल रिपेयर", "JAI HIND TAILORS", "जनरल स्टोर", "NEW DELHI XEROX", "बिजली घर", "LUCKY STAR CYCLES"];

export async function TheLine() {
  const products = await getLineProducts();
  const drop = liveDrop();
  const items: LineGarmentInput[] = products.map((p) => ({
    handle: p.handle,
    title: p.title,
    type: p.wrng.type,
    category: p.wrng.category,
    kind: p.wrng.kind,
    hangStyle: p.wrng.hangStyle,
    weight: p.wrng.weight,
    dims: p.wrng.dims,
    colourName: p.wrng.colours[0].name,
    colourHex: p.wrng.colours[0].hex,
    price: p.wrng.price,
    cutout: p.wrng.colours[0].media.cutout,
    sizes: p.wrng.sizes.map((s) => ({ label: s.label, available: s.available })),
    drop: p.wrng.drop,
    label: accessibleName(p),
  }));
  const layout = buildLineLayout(items);
  const { poles, spans, garments, endX } = layout;
  const cableW = endX + 1;
  const sk = sceneAnchors.skyline;
  const bd = sceneAnchors.buildings;

  // Engine data (kept small: numbers only).
  const data = {
    endX,
    spans: spans.map((s) => ({ x0: s.x0, x1: s.x1, sag: s.sag })),
    garments: garments.map((g) => ({
      handle: g.handle,
      category: g.category,
      x: g.x,
      span: g.span,
      u: g.u,
      w: g.dims.w,
      h: g.dims.h,
      top: g.topCm,
      tag: g.tagCm,
      weight: g.weight,
      hang: g.hangStyle,
      cutout: g.cutout,
      title: g.title,
      colour: g.colourName,
    })),
    poles: poles.map((p) => ({ x: p.x, transformer: p.transformer })),
    lamp: LAMP,
    perches: layout.perches,
    y0: LINE.y0,
    dropNumber: drop.number,
  };

  return (
    <section id="the-line" className="line" aria-labelledby="line-title" style={{ "--endX": endX } as React.CSSProperties}>
      <div className="line-pin" data-line-pin>
        <div className="line-stage" data-line-stage data-cursor="drag">
          {/* 1. Sky (0.04) */}
          <div className="lyr lyr-sky" data-depth="0.04" aria-hidden="true">
            <Image className="moon" src="/scene/moon.svg" alt="" width={400} height={400} preload />
          </div>
          {/* 2. Far skyline (0.12) */}
          <div className="lyr lyr-skyline" data-depth="0.12" aria-hidden="true">
            {[0, 1, 2, 3].map((k) =>
              sk.towerLights.map((l, i) => (
                <span key={`${k}-${i}`} className="aviation" style={{ "--ax": (k * sk.w + l.x) / sk.h, "--ay": l.y / sk.h } as React.CSSProperties} />
              )),
            )}
          </div>
          {/* 3. Mid buildings (0.3) */}
          <div className="lyr lyr-buildings" data-depth="0.3" aria-hidden="true">
            {[0, 1, 2, 3].map((k) => (
              <div key={k} className="bld-tile" style={{ "--k": k } as React.CSSProperties}>
                {bd.flicker.map((f, i) => (
                  <span key={`f${i}`} className={`win-flicker${f.warm ? "" : " cool"}`} style={{ "--ax": f.x / bd.h, "--ay": f.y / bd.h, "--aw": f.w / bd.h, "--ah": f.h / bd.h, "--dl": `${(i * 1.7 + k * 2.3) % 7}s` } as React.CSSProperties} />
                ))}
                {bd.tv.map((f, i) => (
                  <span key={`t${i}`} className="win-tv" style={{ "--ax": f.x / bd.h, "--ay": f.y / bd.h, "--aw": f.w / bd.h, "--ah": f.h / bd.h } as React.CSSProperties} />
                ))}
                {bd.signs.map((s, i) => {
                  const text = SHOP_SIGNS[(i + k * 3) % SHOP_SIGNS.length];
                  const deva = /[ऀ-ॿ]/.test(text);
                  return (
                    <span key={`s${i}`} className={`shop-sign${deva ? " deva" : ""}`} style={{ "--ax": s.x / bd.h, "--ay": s.y / bd.h, "--aw": s.w / bd.h, "--ah": s.h / bd.h } as React.CSSProperties}>
                      {text}
                    </span>
                  );
                })}
              </div>
            ))}
            <span className="neon">
              WR<span className="neon-n">N</span>GSIDE
            </span>
          </div>
          {/* 4. Wall (0.8) */}
          <Wall dropNumber={drop.number} dropName={drop.name} pieces={garments.length} />

          <div className="night night-under" aria-hidden="true">
            {poles.map((p) => (
              <span key={p.index} className="pool" style={{ "--x": p.x } as React.CSSProperties} />
            ))}
          </div>

          {/* 5. The line (1.0) */}
          <div className="line-scroller no-scrollbar" data-line-scroller>
            <div className="line-track" data-line-track>
              <svg className="cables" viewBox={`${LINE.pole0 * 1000 - 500} 0 ${cableW * 1000 + 1000} 1000`} preserveAspectRatio="none" aria-hidden="true" focusable="false" style={{ "--cw": cableW + 1, "--cx0": LINE.pole0 - 0.5 } as React.CSSProperties}>
                {spans.map((s) => (
                  <g key={s.index}>
                    <path className="wire wire-hi" d={`M${s.x0 * 1000} 228 Q${((s.x0 + s.x1) / 2) * 1000} ${228 + s.sag * 1300} ${s.x1 * 1000} 228`} vectorEffect="non-scaling-stroke" />
                    <path className="wire wire-hi2" d={`M${s.x0 * 1000} 216 Q${((s.x0 + s.x1) / 2) * 1000} ${216 + s.sag * 900} ${s.x1 * 1000} 216`} vectorEffect="non-scaling-stroke" />
                    <path className="wire wire-bundle" d={`M${s.x0 * 1000} 330 Q${((s.x0 + s.x1) / 2) * 1000} ${330 + s.sag * 2300} ${s.x1 * 1000} 330`} vectorEffect="non-scaling-stroke" />
                    <path className="wire wire-main" data-span={s.index} d={spanPathD(s)} vectorEffect="non-scaling-stroke" />
                    <path className="wire wire-main-hi" data-span-hi={s.index} d={spanPathD(s)} vectorEffect="non-scaling-stroke" />
                  </g>
                ))}
              </svg>

              <div className="shadows" aria-hidden="true">
                {garments.map((g) => (
                  <div key={g.index} className="g-shadow" data-shadow={g.index} style={{ "--x": g.x, "--y": g.y, "--w": g.dims.w, "--h": g.dims.h, "--top": g.topCm, "--ldx": g.lampDx } as React.CSSProperties}>
                    <Image src={g.cutout} alt="" fill sizes="20vw" loading={g.index < 4 ? "eager" : "lazy"} />
                  </div>
                ))}
              </div>

              <div className="poles">
                {poles.map((p) => (
                  <div key={p.index} className={`pole${p.transformer ? " has-transformer" : ""}`} style={{ "--x": p.x } as React.CSSProperties} data-pole={p.index}>
                    <Pole pole={p} />
                    {p.transformer && <button type="button" className="transformer-hit" data-action="transformer" aria-label="Transformer" tabIndex={-1} />}
                    {p.last && (
                      <a href="/shop" className="end-board" data-action="shop">
                        <span className="sr-only">{copy.hero.endBoard}: shop everything</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <div className="egg-code" style={{ "--x": (poles.find((p) => p.transformer)?.x ?? 6) - 0.36 } as React.CSSProperties}>
                <button type="button" data-action="copy-egg" className="egg-code-btn" tabIndex={-1} aria-hidden="true">
                  <span className="t-meta">FOUND IN THE DARK</span>
                  <span className="egg-code-text">{codes.powerCut.code}</span>
                  <span className="t-meta">{codes.powerCut.percentOff}% OFF</span>
                </button>
              </div>

              <ul className="garments" aria-label={`DROP ${drop.number} — THE LINE, ${garments.length} pieces. Use left and right arrow keys to move along the line.`}>
                {garments.map((g) => (
                  <li
                    key={g.index}
                    className="g"
                    data-g={g.index}
                    style={{ "--x": g.x, "--y": g.y, "--w": g.dims.w, "--h": g.dims.h, "--top": g.topCm } as React.CSSProperties}
                    data-soldout={g.sizes.every((s) => !s.available) || undefined}
                  >
                    <Garment g={g} priority={g.index < 4} />
                    <SwingTag g={g} dropNumber={drop.number} />
                  </li>
                ))}
              </ul>

              <div className="crows" aria-hidden="true">
                {layout.perches.map((c, i) => {
                  const s = spans[c.span];
                  const x = s.x0 + (s.x1 - s.x0) * c.u;
                  return (
                    <span key={i} className="crow" data-crow={i} style={{ "--x": x, "--y": LINE.y0 + 4 * c.u * (1 - c.u) * s.sag } as React.CSSProperties}>
                      <Crow />
                    </span>
                  );
                })}
              </div>

              {/* Touch snap points: garment centred slightly left so the next one peeks in. */}
              <div className="snaps" aria-hidden="true">
                <span className="snap" style={{ "--x": 0 } as React.CSSProperties} data-start />
                {garments.map((g) => (
                  <span key={g.index} className="snap" style={{ "--x": g.x } as React.CSSProperties} />
                ))}
                <span className="snap" style={{ "--x": endX } as React.CSSProperties} data-end />
              </div>
            </div>
          </div>

          {/* 6. Light: night multiply layers with pools at each lamp, then glows.
              Strong one over the backdrop, a lighter one over the garments. */}
          <div className="night night-over" aria-hidden="true">
            {poles.map((p) => (
              <span key={p.index} className="pool" style={{ "--x": p.x } as React.CSSProperties} />
            ))}
          </div>
          <div className="light" aria-hidden="true">
            {poles.map((p) => (
              <span key={p.index} className="lamp" style={{ "--x": p.x } as React.CSSProperties} data-lamp={p.index}>
                <span className="lamp-cone" />
                <span className="lamp-glow" />
                <span className="lamp-core" />
                <span className="lamp-dust">
                  {Array.from({ length: 7 }, (_, i) => (
                    <i key={i} style={{ "--i": i } as React.CSSProperties} />
                  ))}
                </span>
                <span className="lamp-reflect" />
              </span>
            ))}
          </div>

          {/* 7. Foreground (1.6), out of focus. */}
          <div className="lyr lyr-fg" data-depth="1.6" aria-hidden="true">
            <Image className="fg-cables fg-a" src="/scene/fg-cables.svg" alt="" width={2400} height={520} />
            <Image className="fg-neem" src="/scene/fg-neem.svg" alt="" width={800} height={520} />
            <Image className="fg-cables fg-b" src="/scene/fg-cables.svg" alt="" width={2400} height={520} />
            <span className="fg-crow">
              <Crow />
            </span>
          </div>

          <div className="vignette" aria-hidden="true" />
          <div className="torch" aria-hidden="true" />
          <div className="sparks" aria-hidden="true" />

          {/* HUD */}
          <div className="hud">
            <div className="hud-left t-meta" aria-hidden="true">
              <span className="hud-cat">
                <span className="hud-cat-in" data-hud-cat>
                  {fill(copy.hero.hudStart, { drop: drop.number })}
                </span>
              </span>
              <span className="hud-count tabular" data-hud-count>
                00 / {String(garments.length).padStart(2, "0")}
              </span>
            </div>
            <div className="hud-progress" aria-hidden="true">
              <svg viewBox="0 0 400 20" preserveAspectRatio="none">
                <path className="hud-track" d="M0 4 Q200 18 400 4" />
                <path className="hud-fill" d="M0 4 Q200 18 400 4" pathLength={1} data-hud-fill />
              </svg>
              <span className="hud-spark" data-hud-spark />
            </div>
            <a href="#after-line" className="hud-skip t-meta" data-action="skip">
              {copy.hero.skip} <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="line-hint t-meta" data-line-hint aria-hidden="true">
            <span className="hint-desk">{copy.hero.hintDesktop}</span>
            <span className="hint-touch">{copy.hero.hintTouch}</span>
          </p>
          <div className="line-nav">
            <button type="button" className="line-nav-btn" data-action="prev" aria-label="Previous piece">
              ←
            </button>
            <button type="button" className="line-nav-btn" data-action="next" aria-label="Next piece">
              →
            </button>
          </div>
          <p className="sr-only">{hindi.wrongSide}</p>
        </div>
      </div>
      <LineController data={data} />
    </section>
  );
}
