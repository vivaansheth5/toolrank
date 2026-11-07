#!/usr/bin/env node
// Scene plates for THE LINE → public/scene/*.svg, textures → public/textures/*.png,
// and overlay anchors → src/components/line/scene-anchors.ts.
// Plates tile horizontally (background-repeat: repeat-x) so ultrawide screens
// extend the street instead of stretching it.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { rng, r, tone, mix } from "./art/lib.mjs";
import { piece, throwUp, tag, stencil, stickerBomb, sparkle, dripsPath } from "./art/graffiti.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sceneDir = path.join(root, "public", "scene");
const texDir = path.join(root, "public", "textures");
fs.mkdirSync(sceneDir, { recursive: true });
fs.mkdirSync(texDir, { recursive: true });

const write = (name, svg) => fs.writeFileSync(path.join(sceneDir, name), svg.replace(/\n\s*/g, "\n").trim() + "\n");
const doc = (w, h, body, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax slice"${extra}>${body}</svg>`;

/* ───────────────────────── SKY ───────────────────────── */
{
  const W = 2000;
  const H = 1000;
  const body = `<defs>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#04050d"/>
  <stop offset="0.2" stop-color="#090b1d"/>
  <stop offset="0.33" stop-color="#15132d"/>
  <stop offset="0.42" stop-color="#2a1c33"/>
  <stop offset="0.5" stop-color="#4b2732"/>
  <stop offset="0.58" stop-color="#6e3c2f"/>
  <stop offset="0.66" stop-color="#7f4630"/>
  <stop offset="1" stop-color="#2e1c16"/>
</linearGradient>
<filter id="h" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="28"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#s)"/>
<g filter="url(#h)" opacity="0.5">
  <ellipse cx="300" cy="560" rx="700" ry="40" fill="#6b3f3a"/>
  <ellipse cx="1500" cy="600" rx="800" ry="50" fill="#7a4536"/>
  <ellipse cx="1000" cy="460" rx="900" ry="26" fill="#2c2340"/>
  <ellipse cx="-100" cy="470" rx="400" ry="22" fill="#2c2340"/>
  <ellipse cx="2100" cy="470" rx="400" ry="22" fill="#2c2340"/>
  <ellipse cx="1000" cy="600" rx="1200" ry="80" fill="#9c5536"/>
</g>`;
  write("sky.svg", doc(W, H, body, ' data-layer="sky"'));
}

/* ───────────────────────── MOON ───────────────────────── */
{
  const body = `<defs>
<radialGradient id="m" cx="0.42" cy="0.4" r="0.6"><stop offset="0" stop-color="#f6ecd8"/><stop offset="1" stop-color="#d2c09e"/></radialGradient>
<radialGradient id="halo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#f3d7ae" stop-opacity="0.35"/><stop offset="0.4" stop-color="#f3d7ae" stop-opacity="0.08"/><stop offset="1" stop-color="#f3d7ae" stop-opacity="0"/></radialGradient>
<filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>
<filter id="hz" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="9"/></filter>
</defs>
<circle cx="200" cy="200" r="200" fill="url(#halo)"/>
<g filter="url(#b)">
<circle cx="200" cy="200" r="46" fill="url(#m)"/>
<circle cx="186" cy="188" r="11" fill="#b9a786" opacity="0.35"/>
<circle cx="214" cy="214" r="7" fill="#b9a786" opacity="0.3"/>
<circle cx="205" cy="178" r="5" fill="#b9a786" opacity="0.28"/>
<ellipse cx="190" cy="222" rx="13" ry="7" fill="#b9a786" opacity="0.22"/>
</g>
<rect x="60" y="208" width="290" height="16" fill="#3b2a38" opacity="0.55" filter="url(#hz)"/>
<rect x="40" y="176" width="320" height="10" fill="#2a2238" opacity="0.4" filter="url(#hz)"/>`;
  fs.writeFileSync(path.join(sceneDir, "moon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">${body}</svg>\n`);
}

/* ───────────────────────── SKYLINE ───────────────────────── */
const anchors = { skyline: { w: 2400, h: 700, towerLights: [] }, buildings: { w: 3000, h: 900, flicker: [], tv: [], signs: [] } };
{
  const W = 2400;
  const H = 700;
  const R = rng(42);
  const col = "#232540";
  let s = "";
  let x = -20;
  while (x < W + 20) {
    const w = 90 + R() * 210;
    const h = 120 + R() * 250;
    const y = H - h;
    s += `<rect x="${r(x)}" y="${r(y)}" width="${r(w + 2)}" height="${r(h)}"/>`;
    // Parapet & stair room.
    if (R() > 0.5) s += `<rect x="${r(x + w * 0.15)}" y="${r(y - 34)}" width="${r(w * 0.3)}" height="34"/>`;
    // Water tanks (the black cylinders on every Indian roof).
    const tanks = R() > 0.35 ? 1 + Math.floor(R() * 3) : 0;
    for (let i = 0; i < tanks; i++) {
      const tx = x + 10 + R() * (w - 50);
      const tw = 26 + R() * 14;
      const th = 30 + R() * 18;
      s += `<rect x="${r(tx)}" y="${r(y - th)}" width="${r(tw)}" height="${r(th)}" rx="5"/><ellipse cx="${r(tx + tw / 2)}" cy="${r(y - th)}" rx="${r(tw / 2)}" ry="5"/>`;
      s += `<path d="M${r(tx + 2)} ${r(y - th * 0.66)}H${r(tx + tw - 2)}M${r(tx + 2)} ${r(y - th * 0.33)}H${r(tx + tw - 2)}" stroke="#1d1f37" stroke-width="2"/>`;
    }
    // Dish antennas.
    if (R() > 0.55) {
      const dx = x + R() * w;
      s += `<path d="M${r(dx)} ${r(y)}V${r(y - 26)}" stroke="${col}" stroke-width="3"/><ellipse cx="${r(dx + 6)}" cy="${r(y - 34)}" rx="14" ry="9" transform="rotate(-30 ${r(dx + 6)} ${r(y - 34)})"/>`;
    }
    // Railing.
    if (R() > 0.6) s += `<path d="M${r(x)} ${r(y - 14)}H${r(x + w)}" stroke="${col}" stroke-width="3"/>${Array.from({ length: Math.floor(w / 18) }, (_, i) => `<path d="M${r(x + i * 18)} ${r(y - 14)}V${r(y)}" stroke="${col}" stroke-width="2"/>`).join("")}`;
    x += w - 2;
  }
  // Mosque dome + minarets far away (Old Delhi skyline).
  s += `<g transform="translate(560 0)"><ellipse cx="0" cy="${H - 330}" rx="74" ry="66"/><rect x="-80" y="${H - 330}" width="160" height="330"/><path d="M0 ${H - 410}V${H - 396}" stroke="${col}" stroke-width="4"/>
<rect x="-150" y="${H - 470}" width="18" height="470"/><ellipse cx="-141" cy="${H - 472}" rx="14" ry="12"/><rect x="132" y="${H - 470}" width="18" height="470"/><ellipse cx="141" cy="${H - 472}" rx="14" ry="12"/></g>`;
  // Billboard on scaffolding.
  s += `<g transform="translate(1180 ${H - 430})"><rect x="0" y="0" width="230" height="96"/><path d="M30 96V220M200 96V220M30 160H200M30 96L200 220M200 96L30 220" stroke="${col}" stroke-width="5"/></g>`;
  // Mobile tower.
  const tx = 1840;
  const base = H - 230;
  const top = 150;
  let lat = `M${tx - 46} ${base}L${tx - 9} ${top}M${tx + 46} ${base}L${tx + 9} ${top}`;
  for (let i = 0; i < 9; i++) {
    const y1 = base - (i * (base - top)) / 9;
    const y2 = base - ((i + 1) * (base - top)) / 9;
    const w1 = 46 - (i * 37) / 9;
    const w2 = 46 - ((i + 1) * 37) / 9;
    lat += `M${r(tx - w1)} ${r(y1)}L${r(tx + w2)} ${r(y2)}M${r(tx + w1)} ${r(y1)}L${r(tx - w2)} ${r(y2)}M${r(tx - w1)} ${r(y1)}H${r(tx + w1)}`;
  }
  s += `<path d="${lat}" stroke="${col}" stroke-width="4" fill="none"/>`;
  s += `<rect x="${tx - 26}" y="${top + 30}" width="12" height="44"/><rect x="${tx + 14}" y="${top + 30}" width="12" height="44"/><rect x="${tx - 6}" y="${top + 20}" width="12" height="40"/><path d="M${tx} ${top}V${top - 34}" stroke="${col}" stroke-width="3"/>`;
  anchors.skyline.towerLights.push({ x: tx, y: top - 36 });
  // A few very dim windows in the distance.
  const R2 = rng(7);
  let wins = "";
  for (let i = 0; i < 40; i++) {
    const wx = R2() * W;
    const wy = H - 40 - R2() * 220;
    wins += `<rect x="${r(wx)}" y="${r(wy)}" width="7" height="9" fill="#d98d4a" opacity="${r(0.25 + R2() * 0.35, 2)}"/>`;
  }
  const body = `<defs><linearGradient id="hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b3f5e" stop-opacity="0"/><stop offset="0.6" stop-color="#5a4357" stop-opacity="0.35"/><stop offset="1" stop-color="#7b4c48" stop-opacity="0.65"/></linearGradient></defs>
<g fill="${col}">${s}</g>${wins}<rect width="${W}" height="${H}" fill="url(#hz)"/>`;
  write("skyline.svg", doc(W, H, body, ' data-layer="skyline"'));
}

/* ───────────────────────── BUILDINGS ───────────────────────── */
{
  const W = 3000;
  const H = 900;
  const R = rng(1234);
  let s = "";
  let glows = "";
  let x = -10;
  const facades = ["#191a24", "#1d1c25", "#16171e", "#201e25", "#1a1921", "#1f1b1d"];
  const signColours = ["#a8322a", "#c99a2e", "#2c6248", "#2f4a8a", "#7b2c5a"];
  let signCount = 0;
  while (x < W + 10) {
    const w = 200 + R() * 260;
    const floors = 4 + Math.floor(R() * 4);
    const fh = 120;
    const h = floors * fh + 60;
    const y = H - h;
    const f = facades[Math.floor(R() * facades.length)];
    s += `<rect x="${r(x)}" y="${r(y)}" width="${r(w + 1)}" height="${r(h)}" fill="${f}"/>`;
    s += `<rect x="${r(x - 4)}" y="${r(y - 10)}" width="${r(w + 9)}" height="14" fill="${tone(f, 0.08)}"/>`;
    // Edge shading.
    s += `<rect x="${r(x + w - 10)}" y="${r(y)}" width="10" height="${r(h)}" fill="#000" opacity="0.35"/>`;
    // Windows per floor.
    const cols = Math.max(2, Math.floor((w - 40) / 78));
    const pad = (w - cols * 78) / 2 + 14;
    for (let fl = 0; fl < floors; fl++) {
      const wy = y + 40 + fl * fh;
      for (let c = 0; c < cols; c++) {
        const wx = x + pad + c * 78;
        const roll = R();
        if (roll < 0.14) {
          const warm = R() > 0.35;
          const fill = warm ? (R() > 0.5 ? "#f2a258" : "#f7c47c") : "#bcd4f2";
          glows += `<rect x="${r(wx - 14)}" y="${r(wy - 14)}" width="78" height="86" fill="${fill}" opacity="0.18" filter="url(#g)"/>`;
          s += `<rect x="${r(wx)}" y="${r(wy)}" width="50" height="58" fill="${fill}"/>`;
          s += `<rect x="${r(wx)}" y="${r(wy)}" width="50" height="58" fill="#000" opacity="${r(0.1 + R() * 0.3, 2)}"/>`;
          // Curtain / grille.
          if (R() > 0.5) s += `<path d="M${r(wx + 25)} ${r(wy)}V${r(wy + 58)}M${r(wx)} ${r(wy + 29)}H${r(wx + 50)}" stroke="#2a2018" stroke-width="3"/>`;
          if (anchors.buildings.flicker.length < 8 && R() > 0.55) anchors.buildings.flicker.push({ x: r(wx), y: r(wy), w: 50, h: 58, warm });
        } else {
          s += `<rect x="${r(wx)}" y="${r(wy)}" width="50" height="58" fill="#0d0e15"/><rect x="${r(wx)}" y="${r(wy)}" width="50" height="58" fill="none" stroke="#2a2a35" stroke-width="2"/>`;
          if (roll > 0.985 && anchors.buildings.tv.length < 3) anchors.buildings.tv.push({ x: r(wx), y: r(wy), w: 50, h: 58 });
        }
        // Grilles & chajja (sunshade) above windows.
        s += `<rect x="${r(wx - 6)}" y="${r(wy - 10)}" width="62" height="7" fill="${tone(f, 0.1)}"/>`;
      }
      // Balcony railings on some floors.
      if (R() > 0.6 && fl < floors - 1) {
        const by = wy + 72;
        s += `<rect x="${r(x + 10)}" y="${r(by)}" width="${r(w - 20)}" height="6" fill="${tone(f, 0.12)}"/>`;
        let rails = "";
        for (let k = x + 14; k < x + w - 14; k += 12) rails += `M${r(k)} ${r(by - 30)}V${r(by)}`;
        s += `<path d="${rails}M${r(x + 10)} ${r(by - 30)}H${r(x + w - 10)}" stroke="${tone(f, 0.1)}" stroke-width="2.5"/>`;
        // Washing on the balcony, of course.
        if (R() > 0.4) {
          const cx = x + 30 + R() * (w - 100);
          s += `<path d="M${r(cx)} ${r(by - 30)}h22v26h-22z" fill="${["#6a2f2a", "#2f4363", "#565032"][Math.floor(R() * 3)]}" opacity="0.8"/>`;
        }
      }
    }
    // AC units.
    const acs = Math.floor(R() * 3);
    for (let i = 0; i < acs; i++) {
      const ax = x + 20 + R() * (w - 90);
      const ay = y + 100 + R() * (h - 200);
      s += `<rect x="${r(ax)}" y="${r(ay)}" width="56" height="40" fill="#2b2c35"/><circle cx="${r(ax + 36)}" cy="${r(ay + 20)}" r="13" fill="#1b1c22"/><path d="M${r(ax + 4)} ${r(ay + 10)}h16M${r(ax + 4)} ${r(ay + 18)}h16M${r(ax + 4)} ${r(ay + 26)}h16" stroke="#3a3b45" stroke-width="2"/>`;
      s += `<path d="M${r(ax + 10)} ${r(ay + 40)}q4 30 -6 60" stroke="#111" stroke-width="2" fill="none"/>`;
    }
    // Pipes.
    if (R() > 0.4) s += `<path d="M${r(x + 8 + R() * 30)} ${r(y)}V${H}" stroke="#121218" stroke-width="5"/>`;
    // Hand-painted sign boards (text is a DOM overlay).
    if (R() > 0.45 && w > 240) {
      const sw = Math.min(w - 40, 170 + R() * 120);
      const sx = x + (w - sw) / 2;
      const sy = y + 40 + fh * Math.min(floors - 2, 1 + Math.floor(R() * 2)) - 22;
      const c = signColours[signCount % signColours.length];
      s += `<rect x="${r(sx)}" y="${r(sy)}" width="${r(sw)}" height="54" fill="${c}"/><rect x="${r(sx)}" y="${r(sy)}" width="${r(sw)}" height="54" fill="#000" opacity="0.35"/><rect x="${r(sx + 4)}" y="${r(sy + 4)}" width="${r(sw - 8)}" height="46" fill="none" stroke="#e8dcc0" stroke-opacity="0.3" stroke-width="2"/>`;
      anchors.buildings.signs.push({ x: r(sx), y: r(sy), w: r(sw), h: 54, colour: c });
      signCount++;
    }
    x += w + (R() > 0.7 ? 18 : 0);
  }
  // Cable bundles strung between buildings.
  let cables = "";
  for (let i = 0; i < 7; i++) {
    const y0 = 380 + R() * 260;
    const x0 = R() * W;
    const len = 300 + R() * 600;
    cables += `<path d="M${r(x0)} ${r(y0)} Q${r(x0 + len / 2)} ${r(y0 + 40 + R() * 50)} ${r(x0 + len)} ${r(y0 + (R() - 0.5) * 40)}" stroke="#0b0b10" stroke-width="${r(1.5 + R() * 2)}" fill="none"/>`;
  }
  // Rooftop billboard on scaffolding: the drop, lit by two gooseneck lamps.
  let extraDefs = "";
  let bill = "";
  {
    const bx = 1180;
    const by = 104;
    const bw = 470;
    const bh = 196;
    let legs = "";
    [bx + 60, bx + bw - 60].forEach((lx) => (legs += `M${lx} ${by + bh}V560M${lx - 26} ${by + bh}V560`));
    legs += `M${bx + 34} ${by + bh + 40}L${bx + bw / 2} 560M${bx + bw - 34} ${by + bh + 40}L${bx + bw / 2} 560M${bx + 34} ${by + bh + 40}H${bx + bw - 34}M${bx + 34} ${by + bh + 150}H${bx + bw - 34}`;
    bill += `<path d="${legs}" stroke="#101116" stroke-width="7" fill="none"/>`;
    bill += `<rect x="${bx - 8}" y="${by - 8}" width="${bw + 16}" height="${bh + 16}" fill="#0e0f13"/>`;
    bill += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#billbg)"/>`;
    // Catwalk with railing.
    bill += `<rect x="${bx - 16}" y="${by + bh + 8}" width="${bw + 32}" height="8" fill="#16171c"/><path d="M${bx - 16} ${by + bh - 18}H${bx + bw + 16}${Array.from({ length: 13 }, (_, i) => `M${r(bx - 16 + i * ((bw + 32) / 12))} ${by + bh - 18}V${by + bh + 8}`).join("")}" stroke="#16171c" stroke-width="3"/>`;
    const pc = piece("bb", "WRNGSIDE", { size: 74, x: bx + bw / 2, y: by + 98, rot: -2, fill: ["#ff2e88", "#ff6a2e", "#ffd23a"], depth: "#170a29", seed: 15, drips: 4, sparkles: 2 });
    extraDefs += pc.defs;
    bill += pc.body;
    bill += stencil("AFTER HOURS  ·  DROP 04", { x: bx + bw / 2, y: by + 160, size: 20, color: "#f4f1ea", opacity: 0.95 });
    // Shop signs, lit windows and TVs are DOM overlays: none may sit on the billboard.
    const hit = (a) => a.x < bx + bw + 24 && a.x + a.w > bx - 24 && a.y < by + bh + 36 && a.y + a.h > by - 76;
    anchors.buildings.signs = anchors.buildings.signs.filter((a) => !hit(a));
    anchors.buildings.flicker = anchors.buildings.flicker.filter((a) => !hit(a));
    anchors.buildings.tv = anchors.buildings.tv.filter((a) => !hit(a));
    // Gooseneck lamps and their light.
    [bx + 120, bx + bw - 120].forEach((lx) => {
      bill += `<path d="M${lx} ${by - 8}V${by - 40}Q${lx} ${by - 58} ${lx + 26} ${by - 58}" stroke="#16171c" stroke-width="5" fill="none"/><path d="M${lx + 16} ${by - 64}h28l-6 12h-16z" fill="#1f2026"/>`;
      bill += `<path d="M${lx + 22} ${by - 52}L${lx - 70} ${by + bh}H${lx + 130}L${lx + 38} ${by - 52}Z" fill="url(#billbeam)"/>`;
      bill += `<ellipse cx="${lx + 30}" cy="${by - 52}" rx="12" ry="4" fill="#fff4dc"/>`;
    });
  }
  // Sneakers thrown over a wire between two buildings (laces knotted together).
  const sneaker = (upper, accent, sole) =>
    `<path d="M2 26L2 13Q3 6 11 6L17 7Q24 4 28 8L37 14Q46 16 47 22L47 26Z" fill="${upper}"/><path d="M0 26H48Q49 30 45 31H3Q0 31 0 27Z" fill="${sole}"/><path d="M14 20L22 12L26 16L33 11" fill="none" stroke="${accent}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 9L27 13M21 7.5L29 11.5" stroke="#f4f1ea" stroke-width="1.2"/><path d="M2 13Q8 10 11 6" fill="none" stroke="#000" stroke-opacity="0.3" stroke-width="1.5"/>`;
  let shoes = "";
  {
    const x0 = 2040;
    const y0 = 318;
    const x1 = 2620;
    const y1 = 342;
    const sag = 64;
    const at = (u) => [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + 4 * u * (1 - u) * sag];
    shoes += `<path d="M${x0} ${y0}Q${(x0 + x1) / 2} ${(y0 + y1) / 2 + sag * 2} ${x1} ${y1}" stroke="#0b0b10" stroke-width="4" fill="none"/>`;
    [
      [0.34, "#f4f1ea", "#d8231a", "#c9a46a"],
      [0.71, "#141418", "#c6ff2e", "#c6ff2e"],
    ].forEach(([u, upper, accent, sole]) => {
      const [cx, cy] = at(u);
      const ends = [
        [cx - 16, cy + 58, 98],
        [cx + 18, cy + 72, 72],
      ];
      ends.forEach(([ex, ey, rot]) => {
        shoes += `<path d="M${r(cx)} ${r(cy)}L${r(ex)} ${r(ey)}" stroke="#f4f1ea" stroke-width="2.4" opacity="0.85"/>`;
        shoes += `<g transform="translate(${r(ex)} ${r(ey)}) rotate(${rot}) scale(2.1) translate(-16 -7)">${sneaker(upper, accent, sole)}</g>`;
      });
    });
  }
  const body = `<defs><filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
<filter id="overspray" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>
<linearGradient id="billbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1030"/><stop offset="1" stop-color="#0c0a14"/></linearGradient>
<linearGradient id="billbeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1c8" stop-opacity="0.45"/><stop offset="1" stop-color="#fff1c8" stop-opacity="0"/></linearGradient>${extraDefs}
<linearGradient id="hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2238" stop-opacity="0.45"/><stop offset="0.5" stop-color="#3a2a2c" stop-opacity="0.12"/><stop offset="1" stop-color="#3a2a2c" stop-opacity="0"/></linearGradient></defs>
${glows}${s}${cables}${bill}${shoes}<rect width="${W}" height="${H}" fill="url(#hz)"/>`;
  write("buildings.svg", doc(W, H, body, ' data-layer="buildings"'));
}

/* ───────────────────────── WALL ───────────────────────── */
// A street wall that's been painted over for years: pieces, throw-ups and
// tags on concrete, brick and two pulled-down shop shutters. Wide (4800) so
// the repeat along THE LINE isn't obvious; nothing crosses the tile edges.
{
  const W = 4800;
  const H = 700;
  const R = rng(99);
  let defs = `<filter id="overspray" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="28"/></filter>
<filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.4 0 0 0 -0.66"/></filter>
<linearGradient id="grime" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f0d0c" stop-opacity="0"/><stop offset="1" stop-color="#0f0d0c" stop-opacity="0.75"/></linearGradient>
<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.25"/><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></linearGradient>
<pattern id="brick" width="96" height="44" patternUnits="userSpaceOnUse"><rect width="96" height="44" fill="#2a1a15"/><rect x="2" y="2" width="44" height="18" fill="#7a3b2a"/><rect x="50" y="2" width="44" height="18" fill="#6b3324"/><rect x="-22" y="24" width="44" height="18" fill="#73372a"/><rect x="26" y="24" width="44" height="18" fill="#80422f"/><rect x="74" y="24" width="44" height="18" fill="#6a3226"/></pattern>
<pattern id="shutter" width="24" height="16" patternUnits="userSpaceOnUse"><rect width="24" height="16" fill="#6a7078"/><rect width="24" height="3" fill="#8e959e"/><rect y="12" width="24" height="4" fill="#3a3f45"/></pattern>`;
  let s = "";
  // Concrete base with old patches and rain streaks.
  s += `<rect width="${W}" height="${H}" fill="#56504b"/>`;
  for (let i = 0; i < 46; i++) {
    const x = 40 + R() * (W - 80);
    const y = 40 + R() * (H - 120);
    s += `<rect x="${r(x)}" y="${r(y)}" width="${r(60 + R() * 220)}" height="${r(30 + R() * 120)}" fill="${R() > 0.5 ? "#625b55" : "#4a4440"}" opacity="${r(0.35 + R() * 0.4, 2)}"/>`;
  }
  for (let i = 0; i < 40; i++) {
    const x = 20 + R() * (W - 40);
    s += `<rect x="${r(x)}" y="28" width="${r(3 + R() * 10)}" height="${r(70 + R() * 260)}" fill="#2a2522" opacity="${r(0.18 + R() * 0.2, 2)}"/>`;
  }
  // Brick stretch (plaster knocked off), framed by columns.
  s += `<rect x="1790" y="30" width="880" height="${H - 30}" fill="url(#brick)"/><rect x="1790" y="30" width="880" height="${H - 30}" fill="url(#shade)"/>`;
  // Roller-buffed patch over old tags (the city paints, writers return).
  let old = "";
  ["SHNK", "PALE", "R1SE", "KHAOS"].forEach((t, i) => (old += tag(t, { x: 2050 + i * 150, y: 520 + (i % 2) * 40, size: 46, color: "#e8e2d6", seed: 300 + i, opacity: 0.35 })));
  s += old + `<rect x="1980" y="455" width="520" height="150" fill="#6d6762" opacity="0.92"/>`;
  // Shutters: corrugated, a little bowed, with a handle bar and padlock.
  const shutter = (x0, x1) => {
    const w = x1 - x0;
    let g = `<rect x="${x0 - 14}" y="40" width="${w + 28}" height="${H - 40}" fill="#2a2c30"/>`;
    g += `<rect x="${x0}" y="58" width="${w}" height="${H - 92}" fill="url(#shutter)"/>`;
    g += `<rect x="${x0}" y="58" width="${w}" height="${H - 92}" fill="url(#shade)"/>`;
    g += `<rect x="${x0 - 14}" y="40" width="${w + 28}" height="22" fill="#3b3f45"/><rect x="${x0 - 14}" y="40" width="${w + 28}" height="4" fill="#5d636b"/>`;
    g += `<rect x="${x0}" y="${H - 52}" width="${w}" height="18" fill="#30343a"/><rect x="${x0 + w / 2 - 70}" y="${H - 48}" width="40" height="8" rx="3" fill="#878d95"/><rect x="${x0 + w / 2 + 30}" y="${H - 48}" width="40" height="8" rx="3" fill="#878d95"/>`;
    g += `<g transform="translate(${x0 + w / 2} ${H - 38})"><path d="M-9 0v-10a9 9 0 0 1 18 0v10" fill="none" stroke="#b9bec4" stroke-width="4"/><rect x="-13" y="-2" width="26" height="24" rx="3" fill="#c9a24a"/><circle cy="9" r="3" fill="#3a2a10"/></g>`;
    return g;
  };
  s += shutter(1240, 1730) + shutter(2740, 3210);
  // Concrete columns between stretches.
  [1200, 1760, 2690, 3240].forEach((cx) => {
    s += `<rect x="${cx - 18}" y="0" width="44" height="${H}" fill="#615a54"/><rect x="${cx - 18}" y="0" width="5" height="${H}" fill="#746c65"/><rect x="${cx + 21}" y="0" width="5" height="${H}" fill="#2b2724"/>`;
  });
  // Coping and grime.
  s += `<rect x="0" y="0" width="${W}" height="26" fill="#6a635d"/><rect x="0" y="0" width="${W}" height="4" fill="#7d756e"/><rect x="0" y="26" width="${W}" height="7" fill="#1a1715" opacity="0.85"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#n)" opacity="0.35"/>`;

  // ── The paint ──
  let paint = "";
  const add = (pc) => {
    defs += pc.defs;
    paint += pc.body;
  };
  // 1. WRNGSIDE, the big one: hot pink → orange → yellow on a violet cloud.
  add(piece("pa", "WRNGSIDE", { size: 172, x: 600, y: 410, rot: -3, fill: ["#ff2e88", "#ff6a2e", "#ffd23a"], cloud: "#3d1f78", glow: "#ff2e88", depth: "#170a29", seed: 11 }));
  // 2. Chrome throw-up on the first shutter.
  add(throwUp("pb", "DRIP", { x: 1485, y: 420, size: 168, rot: 4, edge: "#2ad4ff", seed: 21 }));
  // 3. AFTER / HOURS on the brick: ice blue → violet, magenta cloud.
  add(piece("pc", "AFTER", { size: 138, x: 2215, y: 250, rot: -2, fill: ["#c8f4ff", "#2ad4ff", "#6b3cff"], cloud: "#5c1650", glow: "#2ad4ff", depth: "#0d0a26", seed: 31, sparkles: 2 }));
  add(piece("pd", "HOURS", { size: 138, x: 2265, y: 420, rot: -1, fill: ["#c8f4ff", "#2ad4ff", "#6b3cff"], depth: "#0d0a26", seed: 37, sparkles: 2, drips: 8 }));
  // 4. WRONG SIDE in dripping letters: acid green → yellow over a black cloud.
  add(piece("pe", "WRONG SIDE", { font: "wet", size: 118, x: 3790, y: 380, rot: -2, fill: ["#d7ff3c", "#7dff3a", "#ffe53c"], cloud: "#141217", glow: "#9aff3c", depth: "#0b1406", outline2: "#141217", seed: 41, drips: 4, bounce: 0.03, lean: 0.03 }));
  // 5. 440V throw-up, orange edge.
  add(throwUp("pf", "440V", { x: 4330, y: 600, size: 104, rot: -5, edge: "#ff7a1a", seed: 51 }));

  // A character on the second shutter: grinning, X eyes, dripping.
  {
    const cx = 2975;
    const cy = 330;
    const rr = 128;
    paint += `<g>`;
    paint += `<ellipse cx="${cx + 10}" cy="${cy + 14}" rx="${rr + 6}" ry="${rr}" fill="#0b0b10"/>`;
    paint += `<ellipse cx="${cx}" cy="${cy}" rx="${rr + 6}" ry="${rr}" fill="#ffd400" stroke="#0b0b10" stroke-width="12"/>`;
    paint += `<path d="${dripsPath([{ x1: cx - rr * 0.8, y1: cy, x2: cx + rr * 0.8, y2: cy + rr }], 160, 5, 61, { minLen: 0.3, maxLen: 0.9, start: 0.1 })}" fill="#ffd400"/>`;
    [-48, 48].forEach((ex) => (paint += `<path d="M${cx + ex - 20} ${cy - 46}l40 40m0 -40l-40 40" stroke="#0b0b10" stroke-width="14" stroke-linecap="round"/>`));
    paint += `<path d="M${cx - 78} ${cy + 30}Q${cx} ${cy + 110} ${cx + 78} ${cy + 30}Z" fill="#0b0b10"/>`;
    paint += `<path d="M${cx - 54} ${cy + 44}h108v16h-108z" fill="#fff"/>`;
    paint += `<path d="M${cx - 18} ${cy + 44}v16M${cx + 18} ${cy + 44}v16" stroke="#0b0b10" stroke-width="5"/>`;
    paint += sparkle(cx + 150, cy - 110, 26) + sparkle(cx - 160, cy - 60, 18);
    paint += `</g>`;
  }

  // Tags everywhere a writer could reach (and some where they shouldn't).
  const tags = [
    ["VOLT", 90, 610, "#f4f1ea", "tag", -6, true],
    ["N8TE", 300, 640, "#ffd400", "marker", 3, false],
    ["ZRO", 1040, 140, "#f4f1ea", "tag", -8, false],
    ["SPRK", 1110, 640, "#ff3b6b", "tag", 4, true],
    ["LATE", 1330, 130, "#ffd400", "marker", -4, false],
    ["SHUT", 1600, 610, "#0b0b10", "tag", 6, false],
    ["NOX", 1880, 140, "#f4f1ea", "tag", -5, true],
    ["DLH6", 2580, 130, "#2ad4ff", "marker", 5, false],
    ["DELHI", 2985, 590, "#ff3b1f", "marker", -6, false],
    ["MAAN", 3330, 130, "#f4f1ea", "tag", -3, true],
    ["CHAI", 3380, 640, "#ffd400", "tag", 5, false],
    ["ROOF", 4460, 150, "#f4f1ea", "marker", -7, false],
    ["B4D", 4640, 410, "#ff2e88", "tag", 8, true],
    ["WRNG", 4580, 640, "#f4f1ea", "tag", -4, false],
    ["SPRK", 680, 140, "#2ad4ff", "tag", 6, false],
    ["N!", 1690, 250, "#f4f1ea", "tag", -10, false],
  ];
  tags.forEach(([t, x, y, c, f, rot, sw], i) => (paint += tag(t, { x, y, size: f === "marker" ? 50 : 56, color: c, font: f, rot, seed: 100 + i, swoosh: sw, crown: i % 5 === 0, drips: i % 3 === 0 ? 3 : 0 })));
  // Stencils and arrows.
  paint += stencil("NO ENTRY", { x: 4560, y: 290, size: 40, color: "#f4f1ea", rot: -2 });
  paint += `<path d="M4470 330h170l-26 -20m26 20l-26 20" fill="none" stroke="#f4f1ea" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`;
  paint += stencil("WRONG SIDE ONLY", { x: 2235, y: 600, size: 26, color: "#0b0b10", rot: 0, opacity: 0.85 });
  // Sticker bombs by the shutters and the column.
  paint += stickerBomb({ x: 960, y: 470, w: 200, h: 150, n: 22, seed: 7 });
  paint += stickerBomb({ x: 3260, y: 220, w: 180, h: 160, n: 18, seed: 8 });
  // Overspray speckle round the pieces.
  const R2 = rng(77);
  [[600, 410, "#ff2e88"], [2230, 330, "#2ad4ff"], [3790, 380, "#9aff3c"]].forEach(([cx, cy, c]) => {
    for (let i = 0; i < 70; i++) {
      const a = R2() * Math.PI * 2;
      const d = 260 + R2() * 260;
      paint += `<circle cx="${r(cx + Math.cos(a) * d)}" cy="${r(cy + Math.sin(a) * d * 0.45)}" r="${r(1 + R2() * 3.2)}" fill="${c}" opacity="${r(0.25 + R2() * 0.5, 2)}"/>`;
    }
  });

  s += paint;
  s += `<rect x="0" y="${H * 0.66}" width="${W}" height="${H * 0.34}" fill="url(#grime)"/>`;
  const body = `<defs>${defs}</defs>${s}`;
  write("wall.svg", doc(W, H, body, ' data-layer="wall"'));
}

/* ───────────────────────── CONCRETE (tall wall) ───────────────────────── */
// Bare concrete for the side wall behind the opening poster. Tiles both ways,
// so no coping band (the wall draws its own).
{
  const W = 1600;
  const H = 700;
  const R = rng(321);
  let s = `<rect width="${W}" height="${H}" fill="#4f4a45"/>`;
  for (let i = 0; i < 30; i++) {
    const x = 30 + R() * (W - 260);
    const y = 30 + R() * (H - 160);
    s += `<rect x="${r(x)}" y="${r(y)}" width="${r(60 + R() * 200)}" height="${r(30 + R() * 110)}" fill="${R() > 0.5 ? "#5b554f" : "#45403c"}" opacity="${r(0.35 + R() * 0.4, 2)}"/>`;
  }
  for (let i = 0; i < 26; i++) {
    const x = 10 + R() * (W - 20);
    s += `<rect x="${r(x)}" y="${r(R() * 200)}" width="${r(3 + R() * 9)}" height="${r(80 + R() * 300)}" fill="#25211e" opacity="${r(0.16 + R() * 0.18, 2)}"/>`;
  }
  // Formwork seams.
  for (let y = 140; y < H; y += 175) s += `<rect x="0" y="${y}" width="${W}" height="3" fill="#2f2b28" opacity="0.5"/>`;
  for (let x = 0; x < W; x += 400) s += `<circle cx="${x + 60}" cy="70" r="4" fill="#2f2b28" opacity="0.6"/><circle cx="${x + 260}" cy="245" r="4" fill="#2f2b28" opacity="0.6"/>`;
  const body = `<defs><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="6" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.4 0 0 0 -0.66"/></filter></defs>${s}<rect width="${W}" height="${H}" filter="url(#n)" opacity="0.35"/>`;
  write("concrete.svg", doc(W, H, body, ' data-layer="concrete"'));
}

/* ───────────────────────── ASPHALT ───────────────────────── */
{
  const W = 1600;
  const H = 260;
  const R = rng(5);
  let curb = "";
  for (let x = 0; x < W; x += 80) curb += `<rect x="${x}" y="0" width="40" height="30" fill="${(x / 80) % 2 ? "#151515" : "#8f7a2a"}"/>`;
  let puddles = "";
  for (let i = 0; i < 7; i++) {
    const cx = R() * W;
    const cy = 90 + R() * 140;
    puddles += `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(80 + R() * 160)}" ry="${r(6 + R() * 14)}" fill="#2c2f3a" opacity="0.6" filter="url(#pb)"/>`;
  }
  const body = `<defs>
<linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17171a"/><stop offset="1" stop-color="#0a0a0b"/></linearGradient>
<filter id="pb" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="8" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -0.95"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#ag)"/>
<rect x="0" y="0" width="${W}" height="30" fill="#3a3632"/>${curb}
<rect x="0" y="0" width="${W}" height="30" fill="#000" opacity="0.35"/>
<rect x="0" y="30" width="${W}" height="10" fill="#050505"/>
${puddles}
<rect y="40" width="${W}" height="${H - 40}" filter="url(#n)" opacity="0.25"/>`;
  write("asphalt.svg", doc(W, H, body, ' data-layer="asphalt"'));
}

/* ───────────────────────── FOREGROUND ───────────────────────── */
{
  // Out-of-focus cable bundle sweeping across the top of frame.
  const W = 2400;
  const H = 520;
  let c = "";
  [
    [0, 30, 1200, 260, 2400, 20, 22],
    [0, 70, 1200, 300, 2400, 60, 16],
    [0, 10, 1100, 220, 2400, 0, 12],
    [0, 110, 1300, 330, 2400, 90, 9],
  ].forEach(([x0, y0, cx, cy, x1, y1, w]) => {
    c += `<path d="M${x0 - 40} ${y0} Q${cx} ${cy} ${x1 + 40} ${y1}" stroke="#050506" stroke-width="${w}" fill="none"/>`;
  });
  const cables = `<defs><filter id="b" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="7"/></filter></defs><g filter="url(#b)">${c}</g>`;
  fs.writeFileSync(path.join(sceneDir, "fg-cables.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${cables}</svg>\n`);

  // Neem branch with pinnate leaves, rim-lit by sodium light.
  const R = rng(17);
  let leaves = "";
  const stems = [
    [60, 0, 300, 220, 520, 380],
    [300, 220, 420, 330, 640, 420],
    [180, 120, 120, 300, 200, 470],
    [420, 300, 560, 260, 760, 300],
  ];
  let branch = "";
  stems.forEach(([x0, y0, cx, cy, x1, y1], si) => {
    branch += `<path d="M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}" stroke="#0d0b08" stroke-width="${si === 0 ? 16 : 7}" fill="none" stroke-linecap="round"/>`;
    for (let t = 0.12; t < 1; t += 0.07) {
      const px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
      const py = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
      [-1, 1].forEach((side) => {
        const a = Math.atan2(y1 - y0, x1 - x0) + side * (0.9 + R() * 0.4);
        const L = 38 + R() * 26;
        const lx = px + Math.cos(a) * L * 0.5;
        const ly = py + Math.sin(a) * L * 0.5;
        const deg = (a * 180) / Math.PI;
        leaves += `<ellipse cx="${r(lx)}" cy="${r(ly)}" rx="${r(L * 0.55)}" ry="${r(7 + R() * 3)}" transform="rotate(${r(deg)} ${r(lx)} ${r(ly)})" fill="${R() > 0.5 ? "#0e130c" : "#121a10"}"/>`;
      });
    }
  });
  const neem = `<defs><filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
<linearGradient id="rim" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a3c" stop-opacity="0.22"/><stop offset="0.5" stop-color="#ff9a3c" stop-opacity="0"/></linearGradient></defs>
<g filter="url(#b)">${branch}${leaves}<rect width="800" height="520" fill="url(#rim)" style="mix-blend-mode:screen"/></g>`;
  fs.writeFileSync(path.join(sceneDir, "fg-neem.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">${neem}</svg>\n`);
}

/* ───────────────────────── TEXTURES (PNG) ───────────────────────── */
function png(width, height, rgba) {
  const crcTable = new Uint32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}
{
  // Film grain tile: black and white specks with alpha. Composited normally.
  const N = 256;
  const R = rng(2024);
  const buf = Buffer.alloc(N * N * 4);
  for (let i = 0; i < N * N; i++) {
    const v = (R() + R() + R()) / 3; // roughly gaussian
    const d = v - 0.5;
    const light = d > 0;
    const a = Math.min(255, Math.abs(d) * 2 * 255 * 1.6);
    buf[i * 4] = buf[i * 4 + 1] = buf[i * 4 + 2] = light ? 255 : 0;
    buf[i * 4 + 3] = a;
  }
  fs.writeFileSync(path.join(texDir, "grain.png"), png(N, N, buf));
}

/* ───────────────────────── anchors for DOM overlays ───────────────────────── */
const ts = `// Generated by scripts/generate-scene.mjs — overlay positions inside the
// scene plates (in each plate's own viewBox units). Regenerate if you swap plates.
export const sceneAnchors = ${JSON.stringify(anchors, null, 2)} as const;
`;
fs.mkdirSync(path.join(root, "src", "components", "line"), { recursive: true });
fs.writeFileSync(path.join(root, "src", "components", "line", "scene-anchors.ts"), ts);
console.log("scene written:", fs.readdirSync(sceneDir).join(", "));
console.log("anchors:", JSON.stringify(anchors).slice(0, 400));
void mix;
