#!/usr/bin/env node
// Campaign placeholder "photographs" → public/campaign/*.svg
// Night shots (sodium against ink) and daylight shots (hard sun on plaster),
// built from the same garment drawings so products stay consistent.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalog } from "../src/lib/commerce/mock/catalog.ts";
import { fabricDefs, rng, r } from "./art/lib.mjs";
import { drawGarment } from "./art/garments.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "campaign");
fs.mkdirSync(out, { recursive: true });
const P = (h) => catalog.find((p) => p.handle === h);

const write = (name, w, h, body) =>
  fs.writeFileSync(
    path.join(out, name),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">${body}</svg>\n`.replace(/\n\s*/g, "\n"),
  );

/** Place a garment so its top-centre sits at (x, y) with height `hh`. */
function garment(handle, colourIdx, x, y, hh, { pose = "hang", view = "front", rot = 0, id = "g" } = {}) {
  const p = P(handle);
  const col = p.colours[colourIdx] ?? p.colours[0];
  const g = drawGarment(p, col, view, pose);
  const [x0, y0, x1, y1] = g.bbox;
  const k = hh / (y1 - y0);
  return `<g transform="translate(${r(x)} ${r(y)}) rotate(${rot}) scale(${r(k, 4)}) translate(${r(-(x0 + x1) / 2)} ${r(-y0)})">${g.svg}</g>`;
}

function common(id, seed) {
  return `<defs>${fabricDefs("g", seed)}
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

/* ───────────── DROP 05 teaser (wide) ───────────── */
{
  const W = 1600;
  const H = 900;
  const g = garment("wrong-way-varsity-jacket", 0, 980, 300, 440, { id: "d5" });
  write(
    "drop-05.svg",
    W,
    H,
    `${common("c", 5)}
<rect width="${W}" height="${H}" fill="#07080d"/>
<rect y="${H * 0.62}" width="${W}" height="${H * 0.38}" fill="#0b0b0e"/>
<rect x="200" y="0" width="120" height="${H}" fill="#101116"/><rect x="1300" y="0" width="140" height="${H}" fill="#0e0f13"/>
<rect x="0" y="500" width="${W}" height="36" fill="#14151b"/><rect x="0" y="536" width="${W}" height="10" fill="#050505"/>
${Array.from({ length: 30 }, (_, i) => `<rect x="${i * 56}" y="460" width="6" height="40" fill="#14151b"/>`).join("")}
<rect x="0" y="456" width="${W}" height="6" fill="#1b1c23"/>
${lampGlow(1060, 120, 420, 0.75)}
<path d="M1060 0 V120" stroke="#111" stroke-width="5"/>
<path d="M1060 130 L760 ${H} L1360 ${H} Z" fill="#FF9A3C" opacity="0.07" filter="url(#cb20)"/>
<path d="M980 290 L980 300" stroke="#9a9ea2" stroke-width="3"/><path d="M980 296 C980 280 1000 276 1000 262 C1000 248 984 244 976 252" stroke="#9a9ea2" stroke-width="3" fill="none"/>
${shadowOf(g, 60, 70, 0.6)}${g}
<rect width="${W}" height="${H}" fill="#FF9A3C" opacity="0.04"/>
${grain("c", W, H, 0.14)}`,
  );
}

/* ───────────── Lookbook chapters (portrait 4:5) ───────────── */
function lookbook(n, build) {
  const W = 1200;
  const H = 1500;
  write(`lookbook-0${n}.svg`, W, H, `${common("c", 10 + n)}${build(W, H)}${grain("c", W, H, 0.13)}`);
}
lookbook(1, (W, H) => {
  const g = garment("live-wire-tee", 0, 600, 520, 560);
  return `<rect width="${W}" height="${H}" fill="#0a0a10"/>
${shutter(80, 700, 460, 700, "#24262c")}${shutter(660, 700, 460, 700, "#1f2127")}
<rect x="80" y="640" width="1040" height="60" fill="#a8322a"/><rect x="80" y="640" width="1040" height="60" fill="#000" opacity="0.45"/>
${lampGlow(980, 330, 380, 0.7)}${wires(W, 3, 260, 14)}
<path d="M-20 530 Q600 600 1220 520" stroke="#050505" stroke-width="5" fill="none"/>
${shadowOf(g, 50, 90, 0.55)}${g}
<rect x="0" y="${H - 100}" width="${W}" height="100" fill="#09090b"/>`;
});
lookbook(2, (W, H) => {
  return `<rect width="${W}" height="${H}" fill="#08080c"/>
<path d="M0 0 L420 300 L420 1180 L0 ${H}Z" fill="#141519"/><path d="M${W} 0 L780 300 L780 1180 L${W} ${H}Z" fill="#111216"/>
<rect x="420" y="300" width="360" height="880" fill="#1d1a19"/>
${lampGlow(600, 340, 300, 0.85)}
<path d="M420 1180 L780 1180 L${W} ${H} L0 ${H}Z" fill="#0d0d0f"/>
<path d="M600 1180 L560 ${H} L700 ${H}Z" fill="#FF9A3C" opacity="0.08" filter="url(#cb20)"/>
${wires(W, 9, 160, 10)}
${silhouette(600, 1230, 2.1)}
<path d="M560 1235 L380 ${H} L760 ${H} L640 1235Z" fill="#000" opacity="0.55" filter="url(#cb20)"/>`;
});
lookbook(3, (W, H) => {
  const g = garment("u-turn-reversible-hoodie", 0, 600, 360, 760);
  return `<rect width="${W}" height="${H}" fill="#0b0a0d"/>
${shutter(120, 120, 960, 1200, "#22242a")}
<circle cx="1140" cy="520" r="420" fill="#ff3b5c" opacity="0.18" filter="url(#cb60)"/>
<circle cx="80" cy="900" r="360" fill="#FF9A3C" opacity="0.14" filter="url(#cb60)"/>
<path d="M600 300 C600 280 625 276 625 258 C625 240 604 236 596 246" stroke="#9a9ea2" stroke-width="5" fill="none"/>
<rect x="590" y="296" width="20" height="10" fill="#555"/>
${shadowOf(g, 40, 50, 0.6)}${g}`;
});
lookbook(4, (W, H) => {
  const g = garment("lineman-work-jacket", 0, 470, 640, 560, { rot: 4 });
  return `<rect width="${W}" height="${H}" fill="#08090e"/>
<rect x="760" y="0" width="70" height="${H}" fill="#56524c"/><rect x="760" y="0" width="12" height="${H}" fill="#7a746b"/>
<rect x="640" y="230" width="310" height="16" fill="#2a2928"/>
<rect x="840" y="120" width="140" height="170" fill="#4f554f"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${848 + i * 16}" y="138" width="6" height="140" fill="#3a3f3a"/>`).join("")}
${lampGlow(930, 90, 330, 0.75)}${wires(W, 4, 160, 12)}
<path d="M280 ${H} L640 360 M380 ${H} L720 360" stroke="#7d6a4c" stroke-width="18"/>${Array.from({ length: 11 }, (_, i) => {
    const t = i / 11;
    return `<path d="M${r(280 + 360 * t)} ${r(H - (H - 360) * t)} L${r(380 + 340 * t)} ${r(H - (H - 360) * t)}" stroke="#7d6a4c" stroke-width="12"/>`;
  }).join("")}
${shadowOf(g, 70, 60, 0.55)}${g}
${Array.from({ length: 9 }, (_, i) => `<path d="M910 300 l${r(Math.cos(i) * 60)} ${r(Math.sin(i) * 40 + 30)}" stroke="#ffe7a6" stroke-width="3" opacity="0.8"/>`).join("")}`;
});
lookbook(5, (W, H) => {
  const g = garment("fuse-tote", 0, 520, 600, 460, { rot: -3 });
  return `<rect width="${W}" height="${H}" fill="#0a0a0f"/>
<rect x="490" y="0" width="34" height="${H}" fill="#3d3a37"/>
<circle cx="507" cy="380" r="170" fill="#c8261b"/><rect x="390" y="350" width="234" height="60" fill="#ece6da"/>
<circle cx="507" cy="380" r="170" fill="none" stroke="#e8e2d6" stroke-width="10"/>
${lampGlow(900, 200, 380, 0.7)}${wires(W, 12, 90, 9)}
<path d="M507 560 L507 600" stroke="#888" stroke-width="4"/>
${shadowOf(g, 50, 60, 0.6)}${g}
<g transform="translate(760 1180)"><ellipse cx="0" cy="40" rx="260" ry="26" fill="#000" opacity="0.6" filter="url(#cb6)"/><path d="M-220 0 Q-200 -120 -60 -130 L120 -130 Q220 -110 230 0 Z" fill="#101116"/><circle cx="-160" cy="10" r="56" fill="#060606"/><circle cx="170" cy="10" r="56" fill="#060606"/><path d="M60 -130 L110 -260 L180 -270" stroke="#101116" stroke-width="16" fill="none"/></g>
<rect x="0" y="${H - 120}" width="${W}" height="120" fill="#0b0b0d"/>`;
});

/* ───────────── Category tiles (daylight, 3:4) ───────────── */
function tile(name, handle, colourIdx, hh, { tint = "#e9e3d6", rot = 0 } = {}) {
  const W = 900;
  const H = 1200;
  const g = garment(handle, colourIdx, 450, 260, hh, { rot });
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
tile("tees", "neutral-tee", 2, 640, { tint: "#e6dfd1" });
tile("outerwear", "440v-hoodie", 1, 720, { tint: "#ded8cc" });
tile("bottoms", "short-circuit-cargos", 1, 600, { tint: "#e3dccd" });
tile("extras", "overhead-cap", 1, 360, { tint: "#e8e1d4", rot: 0 });

/* ───────────── Community polaroids (square) ───────────── */
const comm = [
  ["live-wire-tee", 1, "#1b1a24", "#ff9a3c"],
  ["440v-hoodie", 0, "#2b2420", "#ffb36a"],
  ["overhead-cap", 0, "#cfc4b0", "#fff4dc"],
  ["no-entry-boxy-tee", 0, "#16171f", "#ff6a4a"],
  ["grounded-sweatpants", 0, "#e2d8c6", "#ffffff"],
  ["u-turn-reversible-hoodie", 0, "#1a1418", "#ff4d6d"],
];
comm.forEach(([h, ci, bg, light], i) => {
  const W = 900;
  const H = 900;
  const day = ["#cfc4b0", "#e2d8c6"].includes(bg);
  const g = garment(h, ci, 450 + (i % 2 ? 40 : -30), 170, h.includes("cap") ? 340 : 560, { rot: (i % 3) - 1 });
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
[
  ["live-wire-tee", 0, "#c9bfae"],
  ["440v-hoodie", 0, "#2a2725"],
  ["short-circuit-cargos", 0, "#d8cfbf"],
].forEach(([h, ci, bg], i) => {
  const W = 600;
  const H = 750;
  const g = garment(h, ci, 300, 110, 520, { pose: "flat" });
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
console.log("campaign written:", fs.readdirSync(out).length, "files");
