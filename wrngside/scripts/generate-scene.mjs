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
  const body = `<defs><filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
<linearGradient id="hz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2238" stop-opacity="0.45"/><stop offset="0.5" stop-color="#3a2a2c" stop-opacity="0.12"/><stop offset="1" stop-color="#3a2a2c" stop-opacity="0"/></linearGradient></defs>
${glows}${s}${cables}<rect width="${W}" height="${H}" fill="url(#hz)"/>`;
  write("buildings.svg", doc(W, H, body, ' data-layer="buildings"'));
}

/* ───────────────────────── WALL ───────────────────────── */
{
  const W = 1600;
  const H = 700;
  const R = rng(99);
  const base = "#2c2826";
  let s = `<rect width="${W}" height="${H}" fill="${base}"/>`;
  // Plaster patches.
  for (let i = 0; i < 26; i++) {
    const cx = R() * W;
    const cy = 60 + R() * (H - 120);
    const rx = 40 + R() * 160;
    const ry = 20 + R() * 90;
    const pts = Array.from({ length: 9 }, (_, k) => {
      const a = (k / 9) * Math.PI * 2;
      const rr = 0.7 + R() * 0.5;
      return `${r(cx + Math.cos(a) * rx * rr)} ${r(cy + Math.sin(a) * ry * rr)}`;
    });
    s += `<path d="M${pts.join("L")}Z" fill="${R() > 0.5 ? "#3d3833" : "#1f1c1a"}" opacity="${r(0.3 + R() * 0.4, 2)}" filter="url(#soft)"/>`;
  }
  // Exposed brick where the plaster fell away.
  const bx = 980;
  const by = 330;
  let bricks = "";
  for (let row = 0; row < 7; row++) {
    for (let c = 0; c < 6; c++) {
      const xx = bx + c * 46 + (row % 2) * 23;
      bricks += `<rect x="${xx}" y="${by + row * 22}" width="42" height="18" fill="${["#40261e", "#4a2b21", "#38211a"][(row + c) % 3]}"/>`;
    }
  }
  s += `<defs><clipPath id="brk"><path d="M${bx + 10} ${by + 6} L${bx + 120} ${by - 4} L${bx + 250} ${by + 20} L${bx + 290} ${by + 90} L${bx + 230} ${by + 150} L${bx + 120} ${by + 158} L${bx + 20} ${by + 120} Z"/></clipPath></defs>`;
  s += `<rect x="${bx}" y="${by - 10}" width="300" height="180" fill="#2a1d18" clip-path="url(#brk)"/><g clip-path="url(#brk)">${bricks}</g>`;
  s += `<path d="M${bx + 10} ${by + 6} L${bx + 120} ${by - 4} L${bx + 250} ${by + 20} L${bx + 290} ${by + 90} L${bx + 230} ${by + 150} L${bx + 120} ${by + 158} L${bx + 20} ${by + 120} Z" fill="none" stroke="#1d1a17" stroke-width="5" opacity="0.7"/>`;
  // Rain stains from the coping.
  for (let i = 0; i < 18; i++) {
    const sx = R() * W;
    const len = 80 + R() * 260;
    s += `<rect x="${r(sx)}" y="30" width="${r(4 + R() * 14)}" height="${r(len)}" fill="#141210" opacity="${r(0.12 + R() * 0.18, 2)}" filter="url(#streak)"/>`;
  }
  // Cracks.
  for (let i = 0; i < 6; i++) {
    let cx = R() * W;
    let cy = 40 + R() * 300;
    let d = `M${r(cx)} ${r(cy)}`;
    for (let k = 0; k < 7; k++) {
      cx += (R() - 0.5) * 50;
      cy += 15 + R() * 30;
      d += `L${r(cx)} ${r(cy)}`;
    }
    s += `<path d="${d}" stroke="#151312" stroke-width="2" fill="none" opacity="0.75"/>`;
  }
  // Pillars.
  [0, 800].forEach((px) => {
    s += `<rect x="${px}" y="0" width="70" height="${H}" fill="#332e2b"/><rect x="${px}" y="0" width="5" height="${H}" fill="#423c37"/><rect x="${px + 65}" y="0" width="5" height="${H}" fill="#141210"/>`;
  });
  // Coping + bottom grime.
  s += `<rect x="0" y="0" width="${W}" height="26" fill="#3a3531"/><rect x="0" y="0" width="${W}" height="4" fill="#4a443e"/><rect x="0" y="26" width="${W}" height="7" fill="#100e0d" opacity="0.85"/>`;
  s += `<rect x="0" y="${H * 0.62}" width="${W}" height="${H * 0.38}" fill="url(#grime)"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#n)" opacity="0.5"/>`;
  const body = `<defs>
<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="streak" x="-200%" y="-10%" width="500%" height="120%"><feGaussianBlur stdDeviation="5 20"/></filter>
<linearGradient id="grime" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f0d0c" stop-opacity="0"/><stop offset="1" stop-color="#0f0d0c" stop-opacity="0.7"/></linearGradient>
<filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="4" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.5 0 0 0 -0.72"/></filter>
</defs>${s}`;
  write("wall.svg", doc(W, H, body, ' data-layer="wall"'));
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
