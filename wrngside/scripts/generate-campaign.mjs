#!/usr/bin/env node
// Campaign "photographs" → public/campaign/*.webp
// Night shots (sodium against ink) and daylight shots (hard sun on plaster),
// staged in SVG around the real product cutouts, then rasterised with sharp
// so phones get small, pre-rendered images instead of live SVG filters.
//   node scripts/generate-campaign.mjs   (after the product images exist)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { catalog } from "../src/lib/commerce/mock/catalog.ts";
import { rng, r } from "./art/lib.mjs";
import { sky, stars, glow, streetSign, nycLamp, brickBlock, elevatedTrack, brownstone, castIron, palm, queue, emptyPool, surfboard, peg, hook } from "./art/streets.mjs";
import { tag, wordPath } from "./art/graffiti.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "campaign");
fs.mkdirSync(out, { recursive: true });
const P = (h) => {
  const p = catalog.find((x) => x.handle === h);
  if (!p) throw new Error(`no product ${h}`);
  return p;
};

const jobs = [];
const write = (name, w, h, body, scale = 1) =>
  jobs.push({
    name: name.replace(/\.svg$/, ".webp"),
    scale,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">${body}</svg>`,
  });

// Every cutout a scene uses, loaded up front (scenes are built synchronously).
const cutouts = new Map();
async function loadCutout(handle, colourIdx, view) {
  const p = P(handle);
  const col = p.colours[colourIdx] ?? p.colours[0];
  const file = path.join(root, "public", "products", handle, col.slug, view === "back" ? "cutout-back.webp" : "cutout.webp");
  const png = await sharp(file).resize({ height: 900, withoutEnlargement: true }).png().toBuffer();
  const { width, height } = await sharp(png).metadata();
  cutouts.set(`${handle}|${colourIdx}|${view}`, { href: `data:image/png;base64,${png.toString("base64")}`, w: width, h: height });
}

/** Place a garment so its top-centre sits at (x, y) with height `hh`. */
function garment(handle, colourIdx, x, y, hh, { view = "front", rot = 0 } = {}) {
  const c = cutouts.get(`${handle}|${colourIdx}|${view}`);
  if (!c) throw new Error(`cutout not loaded: ${handle} ${colourIdx} ${view}`);
  const ww = (hh * c.w) / c.h;
  return `<g transform="translate(${r(x)} ${r(y)}) rotate(${rot})"><image href="${c.href}" x="${r(-ww / 2)}" y="0" width="${r(ww)}" height="${r(hh)}" preserveAspectRatio="none"/></g>`;
}

/* Scenes and the pieces in them. */
const SCENES = {
  // The About page's city section: an Old Delhi street (kept from the first lookbook).
  aboutCity: ["starlit-nights-jacket", 0, "front"],
  // Lookbook: where streetwear started, in order. Two pieces from the live drop each.
  lookbook: [
    [["starlit-nights-jacket", 0, "back"], ["crazy-days-sweatpants", 0, "front"]],
    [["flash-studded-tank", 0, "front"], ["eight-ball-tank", 0, "back"]],
    [["portugal-07-jersey", 0, "back"], ["amour-amor-hoodie", 0, "back"]],
    [["baroque-denim-jacket", 0, "back"], ["baroque-sweatpants", 0, "front"]],
    [["batfang-hoodie", 0, "back"], ["obscura-layered-tee", 0, "back"]],
    [["away-days-23-jersey", 0, "back"], ["argentina-10-long-sleeve-jersey", 0, "back"]],
  ],
  tiles: [
    ["tees", "obscura-layered-tee", 0, "back", 600, "#e6dfd1"],
    ["jerseys", "portugal-07-jersey", 0, "back", 600, "#e3dccd"],
    ["outerwear", "angel-wings-denim-jacket", 0, "back", 560, "#ded8cc"],
    ["bottoms", "blessed-sweatpants", 0, "front", 780, "#e8e1d4"],
  ],
  community: [
    ["starlit-nights-jacket", 0, "back", "#1b1a24", "#ff9a3c"],
    ["amour-amor-hoodie", 0, "back", "#2b2420", "#ffb36a"],
    ["portugal-07-jersey", 0, "front", "#cfc4b0", "#fff4dc"],
    ["flash-studded-tank", 0, "front", "#16171f", "#ff6a4a"],
    ["blessed-sweatpants", 0, "front", "#e2d8c6", "#ffffff"],
    ["batfang-hoodie", 0, "front", "#1a1418", "#ff4d6d"],
  ],
  reviews: [
    ["starlit-nights-jacket", 0, "front", "#c9bfae"],
    ["portugal-07-jersey", 0, "front", "#2a2725"],
    ["obscura-layered-tee", 0, "front", "#d8cfbf"],
  ],
};
{
  const need = [SCENES.aboutCity, ...SCENES.lookbook.flat()];
  SCENES.tiles.forEach(([, h, ci, v]) => need.push([h, ci, v]));
  SCENES.community.forEach(([h, ci, v]) => need.push([h, ci, v]));
  SCENES.reviews.forEach(([h, ci, v]) => need.push([h, ci, v]));
  await Promise.all(need.map(([h, ci, v]) => loadCutout(h, ci, v)));
}

function common(id, seed) {
  return `<defs>
<filter id="${id}b6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="${id}b20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>
<filter id="${id}b60" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>
<filter id="${id}sil" x="-20%" y="-20%" width="140%" height="140%"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/><feGaussianBlur stdDeviation="14"/></filter>
<filter id="${id}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -0.88"/></filter>
<radialGradient id="${id}vig" cx="50%" cy="50%" r="72%"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.65"/></radialGradient>
</defs>`;
}
const grain = (id, w, h, op = 0.12) => `<rect width="${w}" height="${h}" filter="url(#${id}n)" opacity="${op}"/><rect width="${w}" height="${h}" fill="url(#${id}vig)"/>`;
const lampGlow = (x, y, rad, op = 0.6, c = "#FF9A3C") =>
  `<circle cx="${x}" cy="${y}" r="${rad}" fill="${c}" opacity="${op * 0.35}" filter="url(#cb60)"/><circle cx="${x}" cy="${y}" r="${rad * 0.25}" fill="#ffd6a0" opacity="${op}" filter="url(#cb20)"/><ellipse cx="${x}" cy="${y}" rx="${rad * 0.09}" ry="${rad * 0.03}" fill="#fff4e0"/>`;
const shadowOf = (svg, dx, dy, op = 0.5) => `<g transform="translate(${dx} ${dy})" filter="url(#csil)" opacity="${op}">${svg}</g>`;
const wires = (w, seed, y0 = 80, n = 9) => {
  const R = rng(seed);
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = y0 + R() * 120;
    const b = y0 + R() * 120;
    const sag = 40 + R() * 120;
    s += `<path d="M-20 ${r(a)} Q${r(w / 2 + (R() - 0.5) * 300)} ${r((a + b) / 2 + sag)} ${w + 20} ${r(b)}" stroke="#050505" stroke-width="${r(1.5 + R() * 3.5)}" fill="none"/>`;
  }
  return s;
};
const silhouette = (x, y, s, { hood = true, rim = "#FF9A3C" } = {}) => {
  // A figure from behind, hands in pockets. y = feet.
  const body = `M${-34} ${-170} Q-40 -205 0 -210 Q40 -205 34 -170 L46 -150 Q60 -60 50 -95 L44 -10 L22 -8 L14 -80 L-14 -80 L-22 -8 L-44 -10 L-50 -95 Q-60 -60 -46 -150 Z`;
  const head = hood ? `M-26 -205 Q-30 -250 0 -254 Q30 -250 26 -205 Q0 -195 -26 -205Z` : `<circle cx="0" cy="-226" r="20"/>`;
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="${body}" fill="#060606"/>${hood ? `<path d="${head}" fill="#060606"/>` : head}
<path d="M34 -168 Q46 -140 52 -96" stroke="${rim}" stroke-width="2.4" fill="none" opacity="0.8"/><path d="M26 -206 Q30 -240 6 -252" stroke="${rim}" stroke-width="2" fill="none" opacity="0.7"/>
<ellipse cx="-30" cy="0" rx="90" ry="10" fill="#000" opacity="0.5" filter="url(#cb6)"/></g>`;
};
const shutter = (x, y, w, h, c = "#2a2c33") => {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  for (let k = y; k < y + h; k += 9) s += `<rect x="${x}" y="${k}" width="${w}" height="3" fill="#000" opacity="0.35"/>`;
  return s + `<rect x="${x}" y="${y + h - 14}" width="${w}" height="14" fill="#15161a"/>`;
};

/* ───────────── About: Old Delhi street (portrait 4:5) ───────────── */
{
  const W = 1200;
  const H = 1500;
  const [h, ci, view] = SCENES.aboutCity;
  const g = garment(h, ci, 600, 500, 660, { view });
  write(
    "about-city.svg",
    W,
    H,
    `${common("c", 11)}<rect width="${W}" height="${H}" fill="#0a0a10"/>
${shutter(80, 700, 460, 700, "#24262c")}${shutter(660, 700, 460, 700, "#1f2127")}
<rect x="80" y="640" width="1040" height="60" fill="#a8322a"/><rect x="80" y="640" width="1040" height="60" fill="#000" opacity="0.45"/>
${lampGlow(980, 330, 380, 0.7)}${wires(W, 3, 260, 14)}
<path d="M-20 530 Q600 600 1220 520" stroke="#050505" stroke-width="5" fill="none"/>
${shadowOf(g, 50, 90, 0.55)}${g}
<rect x="0" y="${H - 100}" width="${W}" height="100" fill="#09090b"/>${grain("c", W, H, 0.13)}`,
    1.5,
  );
}

/* ───────────── Lookbook: where streetwear started (portrait 4:5) ─────────────
   Six blocks in New York and Los Angeles, after dark, with two pieces from the
   live drop in each. Street signs carry the real street names. */
const LB = { W: 1200, H: 1500 };
const lbDefs = (id) => `${common("c", 20 + id)}<defs>
<filter id="b20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>
<filter id="b60" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>
<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2a8" stop-opacity="0.32"/><stop offset="1" stop-color="#ffe2a8" stop-opacity="0"/></linearGradient>
<linearGradient id="poolShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b2433" stop-opacity="0.65"/><stop offset="0.6" stop-color="#0b2433" stop-opacity="0.1"/><stop offset="1" stop-color="#0b2433" stop-opacity="0.35"/></linearGradient>
</defs>`;
/** A pegged piece: cut-out top-centre at (x, y), height hh, two pegs on the line. */
function pegged(spec, x, y, hh, rot = 0) {
  const [handle, ci, view] = spec;
  const c = cutouts.get(`${handle}|${ci}|${view}`);
  const ww = (hh * c.w) / c.h;
  return `${shadowOf(garment(handle, ci, x + 26, y + 30, hh, { view, rot }), 0, 0, 0.45)}${garment(handle, ci, x, y, hh, { view, rot })}${peg(x - ww * 0.3, y + 4)}${peg(x + ww * 0.3, y + 4)}`;
}
/** A piece on a hanger: hook over the rail/line at (x, y). */
function hung(spec, x, y, hh, rot = 0) {
  const [handle, ci, view] = spec;
  return `${shadowOf(garment(handle, ci, x + 26, y + 30, hh, { view, rot }), 0, 0, 0.45)}${hook(x, y + 8, 1.6)}${garment(handle, ci, x, y + 8, hh, { view, rot })}`;
}
// Named by place (not number) so a redrawn scene never hides behind a cached old file.
const LB_SLUGS = ["bronx", "dogtown", "laguna", "harlem", "soho", "fairfax"];
function lookbookScene(n, build) {
  write(`lookbook-${LB_SLUGS[n - 1]}.svg`, LB.W, LB.H, `${lbDefs(n)}${build(LB.W, LB.H)}${grain("c", LB.W, LB.H, 0.1)}`, 1.5);
}

// 01 — THE BRONX, 1973: brick and fire escapes, the el train behind, a lamp on Sedgwick Av.
lookbookScene(1, (W, H) => {
  const [jacket, pants] = SCENES.lookbook[0];
  const sk = sky("sk1", W, H, [[0, "#070a1c"], [0.45, "#1d1638"], [0.75, "#3d1f3a"], [1, "#120c14"]]);
  return `<defs>${sk.defs}</defs>${sk.body}${stars(W, 300, 60, 11)}
${elevatedTrack(W, 250, { seed: 4 })}
${brickBlock(-20, 380, 760, 1000, { seed: 7, brick: "#6a2a1e", lit: 0.35, cols: 4, floors: 6 })}
${brickBlock(760, 470, 480, 920, { seed: 9, brick: "#4e2219", lit: 0.25, cols: 3, floors: 6, fire: false })}
${tag("BX", { x: 1000, y: 1280, size: 90, color: "#f4f1ea", seed: 5, swoosh: true })}
<rect x="0" y="1380" width="${W}" height="120" fill="#0d0d10"/><rect x="0" y="1380" width="${W}" height="8" fill="#2a2a30"/>
<path d="M140 560 Q480 640 960 590" stroke="#08080a" stroke-width="4" fill="none"/>
${hung(jacket, 300, 556, 430, -2)}${pegged(pants, 700, 600, 560, 1)}
${nycLamp(1000, 1380, 820, { left: true })}
${streetSign(1000, 700, "SEDGWICK AV", { size: 34, post: 0 })}`;
});

// 02 — DOGTOWN, mid-'70s: palms, the Pacific, an empty pool skaters rode in the drought.
lookbookScene(2, (W, H) => {
  const [tankA, tankB] = SCENES.lookbook[1];
  const sk = sky("sk2", W, H, [[0, "#06101f"], [0.4, "#14284a"], [0.62, "#3b3a5e"], [0.7, "#1c2a44"], [1, "#0a0f17"]]);
  return `<defs>${sk.defs}</defs>${sk.body}${stars(W, 380, 70, 22)}
<circle cx="880" cy="260" r="58" fill="#f6eedc"/>${glow(880, 260, 170, "#f6eedc", 0.25, "b60")}
<rect x="0" y="760" width="${W}" height="220" fill="#0d2236"/>
<path d="M840 770 L800 980 H960 Z" fill="#f6eedc" opacity="0.12"/>
${Array.from({ length: 9 }, (_, i) => `<path d="M${-20 + i * 30} ${800 + i * 20}h${1240 - i * 60}" stroke="#2c4f6e" stroke-width="2" opacity="0.6"/>`).join("")}
<rect x="0" y="960" width="${W}" height="540" fill="#1b1a22"/>
${palm(150, 980, 760, { lean: 0.1, seed: 3 })}${palm(1060, 980, 860, { lean: -0.07, seed: 8 })}${palm(1150, 990, 600, { lean: 0.05, seed: 12 })}
<path d="M150 ${980 - 600} Q600 ${980 - 520} 1060 ${980 - 700}" stroke="#09090c" stroke-width="4" fill="none"/>
${pegged(tankA, 420, 412, 420, -2)}${pegged(tankB, 760, 400, 420, 2)}
${emptyPool(160, 1080, 880, 330)}
<g transform="translate(470 1290) rotate(-12)"><rect x="-70" y="-10" width="140" height="20" rx="10" fill="#e8d6a0"/><circle cx="-46" cy="16" r="9" fill="#151515"/><circle cx="46" cy="16" r="9" fill="#151515"/></g>
<g transform="translate(1000 960)"><path d="M-60 0 L-40 -150 H40 L60 0" stroke="#d9cfbe" stroke-width="8" fill="none"/><rect x="-70" y="-230" width="140" height="80" fill="#cfc3ae"/><path d="M-80 -230 L0 -280 L80 -230 Z" fill="#b84a3a"/></g>
${streetSign(250, 1020, "OCEAN FRONT WALK", { size: 26, post: 360 })}`;
});

// 03 — LAGUNA BEACH, 1980: surf shack, boards against the wall, a coast road.
lookbookScene(3, (W, H) => {
  const [jersey, hoodie] = SCENES.lookbook[2];
  const sk = sky("sk3", W, H, [[0, "#081022"], [0.35, "#22274e"], [0.6, "#5a3a52"], [0.72, "#2b2a44"], [1, "#0b0c12"]]);
  return `<defs>${sk.defs}</defs>${sk.body}${stars(W, 360, 50, 33)}
<path d="M-20 700 Q160 560 360 640 T720 610 L720 820 H-20 Z" fill="#141522"/>
<rect x="0" y="760" width="${W}" height="260" fill="#10233a"/>
${Array.from({ length: 6 }, (_, i) => `<path d="M${-40 + i * 10} ${880 + i * 26} Q600 ${860 + i * 26} ${1240} ${884 + i * 26}" stroke="#e9f2f6" stroke-width="${3 - i * 0.3}" opacity="${0.5 - i * 0.06}" fill="none"/>`).join("")}
<rect x="0" y="1000" width="${W}" height="500" fill="#3a3027"/>
<g><rect x="640" y="640" width="510" height="420" fill="#5a3f2c"/>${Array.from({ length: 12 }, (_, k) => `<rect x="${640 + k * 44}" y="640" width="3" height="420" fill="#3c2a1d"/>`).join("")}
<path d="M612 650 L895 545 L1178 650 Z" fill="#2e2119"/>
<rect x="740" y="760" width="160" height="130" fill="#ffd38a"/>${glow(820, 825, 200, "#ffb860", 0.35, "b60")}<path d="M820 760V890M740 825H900" stroke="#3c2a1d" stroke-width="6"/></g>
${surfboard(965, 860, 420, 8, "#f2e2b6", "#d4532e")}${surfboard(1045, 870, 400, 4, "#9fd3d6", "#f4f1ea")}${surfboard(1118, 880, 380, -3, "#e86f5a", "#f2e2b6")}
<path d="M21 556 Q330 622 650 604" stroke="#09090c" stroke-width="4" fill="none"/><rect x="14" y="540" width="14" height="520" fill="#2a2420"/>
${pegged(jersey, 192, 582, 330, -1.5)}${pegged(hoodie, 560, 603, 340, 1.5)}
${streetSign(170, 1150, "S COAST HWY", { size: 28, post: 300 })}`;
});

// 04 — HARLEM, 1982: brownstones on 125th Street, a tailor's window lit late.
lookbookScene(4, (W, H) => {
  const [jacket, pants] = SCENES.lookbook[3];
  const sk = sky("sk4", W, H, [[0, "#090a18"], [0.5, "#241a33"], [1, "#100b12"]]);
  return `<defs>${sk.defs}</defs>${sk.body}
${brownstone(-30, 260, 420, 1000, { seed: 2 })}${brownstone(390, 230, 420, 1030, { seed: 5 })}${brownstone(810, 270, 420, 990, { seed: 8 })}
<rect x="300" y="860" width="600" height="420" fill="#120d0c"/>
<rect x="330" y="900" width="540" height="360" fill="#ffe1a8"/>${glow(600, 1080, 360, "#ffc070", 0.4, "b60")}
<path d="M290 860 H910 L880 800 H320 Z" fill="#9b1e23"/>${Array.from({ length: 8 }, (_, k) => `<path d="M${320 + k * 80} 860 l20 -60" stroke="#c43b3f" stroke-width="10" opacity="0.6"/>`).join("")}
<g transform="translate(600 846)"><path d="${wordPath("CUSTOM TAILORING", { font: "block", size: 30, tracking: 0.05, seed: 4 }).d}" fill="#f4f1ea"/></g>
<rect x="340" y="904" width="520" height="8" fill="#2a2018"/>
${hung(jacket, 480, 900, 300, 0)}${pegged(pants, 720, 912, 330, 0)}
<rect x="0" y="1280" width="${W}" height="220" fill="#0c0c0f"/><rect x="0" y="1280" width="${W}" height="8" fill="#2b2a2e"/>
<g transform="translate(1040 1270)"><rect x="-22" y="-70" width="44" height="70" rx="8" fill="#b51f1f"/><rect x="-30" y="-44" width="60" height="12" rx="5" fill="#b51f1f"/><circle cx="0" cy="-74" r="16" fill="#b51f1f"/></g>
${nycLamp(170, 1280, 860)}
${streetSign(170, 560, "E 125 ST", { size: 36, post: 0 })}`;
});

// 05 — SOHO, 1994: cast iron on Lafayette Street, a skate shop and the line outside it.
lookbookScene(5, (W, H) => {
  const [hoodie, tee] = SCENES.lookbook[4];
  const sk = sky("sk5", W, H, [[0, "#0a0c16"], [0.6, "#1d1b2a"], [1, "#0e0d12"]]);
  return `<defs>${sk.defs}</defs>${sk.body}
${castIron(-20, 120, 1240, 860, { seed: 4, lit: 0.3, colour: "#978c78", cols: 7 })}
<rect x="0" y="980" width="${W}" height="300" fill="#16161b"/>
<rect x="240" y="990" width="720" height="280" fill="#ffe7b4"/>${glow(600, 1130, 380, "#ffc878", 0.38, "b60")}
${[0, 1, 2].map((k) => `<rect x="${256 + k * 34}" y="1040" width="28" height="170" rx="13" fill="${["#d4532e", "#2f6f8f", "#f2e2b6"][k]}"/>`).join("")}
${[0, 1, 2].map((k) => `<rect x="${860 + k * 34}" y="1040" width="28" height="170" rx="13" fill="${["#c43b3f", "#9fd3d6", "#efd27a"][k]}"/>`).join("")}
<rect x="372" y="1000" width="476" height="8" fill="#2a2018"/>
${hung(hoodie, 490, 994, 236, 0)}${hung(tee, 728, 994, 226, 0)}
<rect x="0" y="1280" width="${W}" height="220" fill="#0b0b0e"/><rect x="0" y="1280" width="${W}" height="8" fill="#2a2a30"/>
${queue(40, 1290, 5, { seed: 6, gap: 48, rim: "#ffc070" })}${queue(950, 1290, 5, { seed: 7, gap: 48, rim: "#ffc070" })}
${streetSign(1040, 980, "LAFAYETTE ST", { size: 26, post: 300 })}`;
});

// 06 — FAIRFAX, 2000s: palms, shop fronts, sneakers on the wire, a drop-day line.
lookbookScene(6, (W, H) => {
  const [jersey, ls] = SCENES.lookbook[5];
  const sk = sky("sk6", W, H, [[0, "#0b0a1d"], [0.45, "#2c1f4a"], [0.7, "#7a3a4c"], [1, "#1a1016"]]);
  // A pair of sneakers thrown over the wire, hanging toe-down by their laces.
  const shoe = (x, y, rot, sx) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sx} 1.5) translate(-12 -8)">
<path d="M3 31C1 22 3 12 8 8Q15 11 23 11L33 3Q37 0 42 3L71 15Q90 17 97 24Q101 27 100 31Z" fill="#efebe2"/>
<path d="M36 6l5 3M44 9l5 3M52 12l5 3M60 15l5 3" stroke="#a9a193" stroke-width="2.2" stroke-linecap="round"/>
<path d="M27 25Q50 15 80 22" stroke="#c8423a" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M4 12Q2 20 4 30" stroke="#c9c1b2" stroke-width="3" fill="none"/>
<path d="M0 31H101Q103 32 102 35H1Q-1 34 0 31Z" fill="#fbf8f1"/>
<path d="M1 35H102Q102 39 98 39H4Q0 39 1 35Z" fill="#b98c55"/></g>`;
  const shoes = `<path d="M965 480L948 548M965 480L985 562" stroke="#f4f1ea" stroke-width="2.4" stroke-linecap="round"/><circle cx="965" cy="481" r="4" fill="#f4f1ea"/>${shoe(948, 548, 95, 1.5)}${shoe(985, 562, -88, -1.5)}`;
  // Shop windows: a rail of tees and hoodies inside each, a frame and a centre mullion.
  const shopfront = (x, light, tint, seed) => {
    const R = rng(seed);
    const y = 900;
    const w = 340;
    const h = 260;
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${light}"/><rect x="${x}" y="${y + 196}" width="${w}" height="64" fill="${tint}" opacity="0.28"/>`;
    s += `<path d="M${x + 16} ${y + 44}H${x + w - 16}" stroke="${tint}" stroke-width="4" opacity="0.75"/>`;
    for (let i = 0; i < 6; i++) {
      const gx = x + 40 + i * ((w - 80) / 5) + (R() - 0.5) * 6;
      const hoodie = R() < 0.45;
      const body = hoodie ? "M-6 0Q0 -8 6 0L22 8L30 52L20 54L18 30V94H-18V30L-20 54L-30 52L-22 8Z" : "M-6 0Q0 -8 6 0L22 7L32 24L20 30V88H-20V30L-32 24L-22 7Z";
      s += `<path transform="translate(${r(gx)} ${y + 44})" d="${body}" fill="${tint}" opacity="0.5"/>`;
    }
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#0e0c12" stroke-width="12"/><path d="M${x + w / 2} ${y}V${y + h}" stroke="#0e0c12" stroke-width="8"/>`;
    return s;
  };
  return `<defs>${sk.defs}</defs>${sk.body}${stars(W, 260, 30, 44)}
${palm(120, 900, 820, { lean: 0.05, seed: 13 })}${palm(1080, 900, 900, { lean: -0.04, seed: 17 })}${palm(820, 900, 640, { lean: 0.06, seed: 19 })}
<rect x="0" y="860" width="${W}" height="420" fill="#1b1720"/>
${shopfront(40, "#ffe0a8", "#7a4c22", 61)}${shopfront(430, "#ffd2e6", "#7c2f55", 62)}${shopfront(820, "#c8f1ff", "#245268", 63)}
${glow(210, 1030, 260, "#ffc070", 0.3, "b60")}${glow(600, 1030, 260, "#ff7ab8", 0.3, "b60")}${glow(990, 1030, 260, "#7fdcff", 0.3, "b60")}
<path d="M80 870h260" stroke="#ff3d8b" stroke-width="10" stroke-linecap="round"/><path d="M80 870h260" stroke="#fff" stroke-width="3" opacity="0.8" stroke-linecap="round"/>
<path d="M860 870h260" stroke="#33e5ff" stroke-width="10" stroke-linecap="round"/><path d="M860 870h260" stroke="#fff" stroke-width="3" opacity="0.8" stroke-linecap="round"/>
<path d="M-20 460 Q600 540 1220 450" stroke="#09090c" stroke-width="4" fill="none"/>
${pegged(jersey, 230, 481, 340, -1.5)}${pegged(ls, 640, 493, 380, 1.5)}${shoes}
<rect x="0" y="1280" width="${W}" height="220" fill="#0c0b0f"/><rect x="0" y="1280" width="${W}" height="8" fill="#2c2a30"/>
${queue(60, 1290, 9, { seed: 9, gap: 52, rim: "#ff7ab8" })}
${streetSign(1050, 1000, "FAIRFAX AV", { size: 30, post: 290 })}`;
});

/* ───────────── Category tiles (daylight, 3:4) ───────────── */
function tile(name, handle, colourIdx, view, hh, tint = "#e9e3d6") {
  const W = 900;
  const H = 1200;
  const g = garment(handle, colourIdx, 450, 260, hh, { view });
  let grille = "";
  for (let i = 0; i < 9; i++) grille += `<path d="M${-200 + i * 130} 0 L${200 + i * 130} ${H}" stroke="#000" stroke-width="34" opacity="0.07"/>`;
  write(
    `cat-${name}.svg`,
    W,
    H,
    `${common("c", name.length * 7)}
<rect width="${W}" height="${H}" fill="${tint}"/>
<rect width="${W}" height="${H}" fill="url(#sun)"/>
<defs><linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6e2" stop-opacity="0.6"/><stop offset="1" stop-color="#b9ab92" stop-opacity="0.35"/></linearGradient></defs>
${grille}
<rect x="0" y="${H - 160}" width="${W}" height="160" fill="#cfc6b5"/><rect x="0" y="${H - 166}" width="${W}" height="6" fill="#a99f8c"/>
<path d="M-20 250 Q450 290 920 240" stroke="#2a2724" stroke-width="4" fill="none"/>
<g transform="translate(80 120)" opacity="0.9">${shadowOf(g, 0, 0, 0.32)}</g>
${g}
<rect width="${W}" height="${H}" filter="url(#cn)" opacity="0.08"/>`,
  );
}
SCENES.tiles.forEach(([name, handle, ci, view, hh, tint]) => tile(name, handle, ci, view, hh, tint));

/* ───────────── Community polaroids (square) ───────────── */
SCENES.community.forEach(([h, ci, view, bg, light], i) => {
  const W = 900;
  const H = 900;
  const day = ["#cfc4b0", "#e2d8c6"].includes(bg);
  const g = garment(h, ci, 450 + (i % 2 ? 40 : -30), 170, P(h).kind === "sweatpants" ? 680 : 560, { rot: (i % 3) - 1, view });
  write(
    `community-0${i + 1}.svg`,
    W,
    H,
    `${common("c", 30 + i)}<rect width="${W}" height="${H}" fill="${bg}"/>
<circle cx="${i % 2 ? 200 : 700}" cy="120" r="420" fill="${light}" opacity="${day ? 0.35 : 0.22}" filter="url(#cb60)"/>
${day ? "" : wires(W, 40 + i, 60, 6)}
<path d="M-20 170 Q450 200 920 160" stroke="${day ? "#3a342c" : "#050505"}" stroke-width="4" fill="none"/>
${shadowOf(g, 40, 50, day ? 0.25 : 0.5)}${g}
<rect width="${W}" height="${H}" fill="${light}" opacity="0.05"/>${grain("c", W, H, 0.12)}`,
  );
});

/* ───────────── Review photos (4:5, phone-snapshot feel) ───────────── */
SCENES.reviews.forEach(([h, ci, view, bg], i) => {
  const W = 600;
  const H = 750;
  const g = garment(h, ci, 300, 110, 520, { view });
  write(`review-0${i + 1}.svg`, W, H, `${common("c", 60 + i)}<rect width="${W}" height="${H}" fill="${bg}"/>${shadowOf(g, 14, 20, 0.3)}${g}<rect width="${W}" height="${H}" fill="#fff3d6" opacity="0.06"/>${grain("c", W, H, 0.14)}`);
});

/* ───────────── 404 (the empty pole, one sock) ───────────── */
{
  const W = 1200;
  const H = 900;
  write(
    "lost-sock.svg",
    W,
    H,
    `${common("c", 404)}<rect width="${W}" height="${H}" fill="#07070b"/>
<rect x="560" y="0" width="40" height="${H}" fill="#3f3c39"/><rect x="590" y="0" width="10" height="${H}" fill="#7a7065" opacity="0.5"/>
${lampGlow(700, 120, 330, 0.8)}
<path d="M-20 300 Q300 360 580 300 Q900 380 1220 300" stroke="#050505" stroke-width="5" fill="none"/>
<rect y="${H - 120}" width="${W}" height="120" fill="#0b0b0e"/>`,
  );
}
for (const j of jobs) {
  await sharp(Buffer.from(j.svg), { density: 72 * (j.scale || 1) }).webp({ quality: 80, effort: 6 }).toFile(path.join(out, j.name));
  fs.rmSync(path.join(out, j.name.replace(/\.webp$/, ".svg")), { force: true });
}
console.log("campaign written:", jobs.map((j) => j.name).join(", "));
