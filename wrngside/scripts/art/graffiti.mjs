// Graffiti for the scene plates: pieces, throw-ups, tags, stickers, drips.
// Lettering is converted to vector paths at build time (fonts in
// scripts/fonts, all SIL OFL), so the browser never loads these fonts and the
// art stays sharp at any resolution.
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rng, r } from "./lib.mjs";

const require = createRequire(import.meta.url);
const opentype = require("opentype.js");
const fontDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "fonts");
const load = (f) => opentype.loadSync(path.join(fontDir, f));

export const gfonts = {
  piece: load("sedgwick-ave-display.woff"),
  tag: load("sedgwick-ave.woff"),
  marker: load("permanent-marker.woff"),
  block: load("bungee.woff"),
  wet: load("rubik-wet-paint.woff"),
};

/**
 * Lay a word out as one path, centred on x = 0 with the baseline at y = 0.
 * `bounce` nudges letters up and down (fraction of size); `lean` rotates each
 * letter a little. Returns the path, per-letter boxes and the overall box.
 */
export function wordPath(text, { font = "piece", size = 100, tracking = 0, bounce = 0, lean = 0, seed = 1 } = {}) {
  const f = gfonts[font];
  const R = rng(seed);
  const scale = size / f.unitsPerEm;
  const glyphs = f.stringToGlyphs(text);
  const adv = glyphs.map((g, i) => (g.advanceWidth || 0) * scale + (i < glyphs.length - 1 ? f.getKerningValue(g, glyphs[i + 1]) * scale + tracking * size : 0));
  const width = adv.reduce((a, b) => a + b, 0);
  let cx = -width / 2;
  const parts = [];
  const boxes = [];
  glyphs.forEach((g, i) => {
    const dy = bounce ? (R() - 0.5) * 2 * bounce * size : 0;
    const p = g.getPath(cx, dy, size);
    const bb = p.getBoundingBox();
    if (lean && bb.x2 > bb.x1) {
      const a = (R() - 0.5) * 2 * lean;
      const ox = (bb.x1 + bb.x2) / 2;
      const oy = (bb.y1 + bb.y2) / 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      p.commands.forEach((cmd) => {
        for (const [kx, ky] of [["x", "y"], ["x1", "y1"], ["x2", "y2"]]) {
          if (cmd[kx] === undefined) continue;
          const x = cmd[kx] - ox;
          const y = cmd[ky] - oy;
          cmd[kx] = ox + x * c - y * s;
          cmd[ky] = oy + x * s + y * c;
        }
      });
    }
    const b2 = p.getBoundingBox();
    if (b2.x2 > b2.x1) boxes.push({ x1: b2.x1, y1: b2.y1, x2: b2.x2, y2: b2.y2 });
    parts.push(p.toPathData(1));
    cx += adv[i];
  });
  const bbox = boxes.reduce((a, b) => ({ x1: Math.min(a.x1, b.x1), y1: Math.min(a.y1, b.y1), x2: Math.max(a.x2, b.x2), y2: Math.max(a.y2, b.y2) }), { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity });
  return { d: parts.join(""), boxes, bbox, width };
}

/** Paint runs: a rounded bar with a bead at the end. */
export function dripsPath(boxes, size, n, seed, { minLen = 0.18, maxLen = 0.8, start = 0.14 } = {}) {
  const R = rng(seed);
  const tall = boxes.filter((b) => b.y2 - b.y1 > size * 0.35);
  let d = "";
  for (let k = 0; k < n && tall.length; k++) {
    const b = tall[Math.floor(R() * tall.length)];
    const x = b.x1 + (0.25 + R() * 0.5) * (b.x2 - b.x1);
    const y0 = b.y2 - size * start;
    const w = size * (0.035 + R() * 0.035);
    const len = size * (minLen + R() * (maxLen - minLen));
    const y1 = y0 + len;
    const h = w / 2;
    d += `M${r(x - h)} ${r(y0)}H${r(x + h)}V${r(y1)}A${r(h)} ${r(h)} 0 0 1 ${r(x - h)} ${r(y1)}Z`;
    const br = w * 0.72;
    d += `M${r(x - br)} ${r(y1)}a${r(br)} ${r(br)} 0 1 0 ${r(br * 2)} 0a${r(br)} ${r(br)} 0 1 0 ${r(-br * 2)} 0Z`;
  }
  return d;
}

/** A four-point sparkle. */
export function sparkle(x, y, s, fill = "#fff") {
  const k = s * 0.16;
  return `<path d="M${r(x)} ${r(y - s)}L${r(x + k)} ${r(y - k)}L${r(x + s)} ${r(y)}L${r(x + k)} ${r(y + k)}L${r(x)} ${r(y + s)}L${r(x - k)} ${r(y + k)}L${r(x - s)} ${r(y)}L${r(x - k)} ${r(y - k)}Z" fill="${fill}"/>`;
}

/** A cloud of overlapping circles around a box: the "fill-in" behind a piece. */
function cloudPath(bb, size, seed, { padX = 0.12, padY = 0.32, puff = 0.28 } = {}) {
  const R = rng(seed);
  const cx = (bb.x1 + bb.x2) / 2;
  const cy = (bb.y1 + bb.y2) / 2;
  const rx = (bb.x2 - bb.x1) / 2 + size * padX;
  const ry = (bb.y2 - bb.y1) / 2 + size * padY;
  let d = `M${r(cx - rx)} ${r(cy)}a${r(rx)} ${r(ry)} 0 1 0 ${r(rx * 2)} 0a${r(rx)} ${r(ry)} 0 1 0 ${r(-rx * 2)} 0Z`;
  const n = Math.max(10, Math.round((rx + ry) / (size * 0.18)));
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + R() * 0.2;
    const pr = size * puff * (0.7 + R() * 0.6);
    const px = cx + Math.cos(a) * (rx - pr * 0.35);
    const py = cy + Math.sin(a) * (ry - pr * 0.35);
    d += `M${r(px - pr)} ${r(py)}a${r(pr)} ${r(pr)} 0 1 0 ${r(pr * 2)} 0a${r(pr)} ${r(pr)} 0 1 0 ${r(-pr * 2)} 0Z`;
  }
  return d;
}

/**
 * A full-colour piece: overspray glow, a cloud fill-in, 3-D block, double
 * outline, fade fill, shines, drips and sparkles. Returns { defs, body }.
 * Letter path is defined once and reused with <use> for every layer.
 */
export function piece(id, text, o) {
  const {
    font = "piece",
    size = 160,
    x = 0,
    y = 0,
    rot = 0,
    fill = ["#ff2e88", "#ffd23a"],
    outline = "#0b0b10",
    outline2 = "#f4f1ea",
    depth = "#1c0f2e",
    glow = null,
    cloud = null,
    drips = 6,
    sparkles = 3,
    seed = 1,
    bounce = 0.05,
    lean = 0.06,
    tracking = -0.02,
  } = o;
  const w = wordPath(text, { font, size, bounce, lean, seed, tracking });
  const bb = w.bbox;
  const dd = dripsPath(w.boxes, size, drips, seed + 7);
  let defs = `<path id="${id}L" d="${w.d}"/><path id="${id}D" d="${dd}"/><g id="${id}S"><use href="#${id}L"/><use href="#${id}D"/></g>`;
  defs += `<clipPath id="${id}C"><use href="#${id}L"/></clipPath>`;
  defs += `<linearGradient id="${id}G" gradientUnits="userSpaceOnUse" x1="0" y1="${r(bb.y1)}" x2="0" y2="${r(bb.y2 + size * 0.4)}">${fill.map((c, i) => `<stop offset="${r(i / Math.max(1, fill.length - 1), 2)}" stop-color="${c}"/>`).join("")}</linearGradient>`;
  let b = `<g transform="translate(${r(x)} ${r(y)}) rotate(${rot})">`;
  if (glow) b += `<ellipse cx="${r((bb.x1 + bb.x2) / 2)}" cy="${r((bb.y1 + bb.y2) / 2)}" rx="${r((bb.x2 - bb.x1) / 2 + size * 0.5)}" ry="${r((bb.y2 - bb.y1) / 2 + size * 0.5)}" fill="${glow}" opacity="0.32" filter="url(#overspray)"/>`;
  if (cloud) {
    const cp = cloudPath(bb, size, seed + 3);
    const cd = dripsPath([{ x1: bb.x1, y1: bb.y1, x2: bb.x2, y2: bb.y2 + size * 0.22 }], size, 7, seed + 11, { minLen: 0.15, maxLen: 0.55, start: 0.05 });
    b += `<path d="${cp}${cd}" fill="${cloud}"/>`;
  }
  const dx = size * 0.055;
  const dy = size * 0.07;
  b += `<use href="#${id}S" transform="translate(${r(dx)} ${r(dy)})" fill="${depth}" stroke="${depth}" stroke-width="${r(size * 0.13)}" stroke-linejoin="round"/>`;
  b += `<use href="#${id}S" fill="none" stroke="${outline2}" stroke-width="${r(size * 0.17)}" stroke-linejoin="round"/>`;
  b += `<use href="#${id}S" fill="none" stroke="${outline}" stroke-width="${r(size * 0.09)}" stroke-linejoin="round"/>`;
  b += `<use href="#${id}S" fill="url(#${id}G)"/>`;
  // Shines and bubbles, clipped to the letters.
  const R = rng(seed + 5);
  let shine = "";
  w.boxes.forEach((bx) => {
    const bw = bx.x2 - bx.x1;
    const bh = bx.y2 - bx.y1;
    if (bh < size * 0.3) return;
    shine += `<path d="M${r(bx.x1 + bw * 0.22)} ${r(bx.y1 + bh * 0.3)}l${r(bw * 0.16)} ${r(-bh * 0.1)}" stroke="#fff" stroke-width="${r(size * 0.03)}" stroke-linecap="round" opacity="0.85"/>`;
    if (R() > 0.5) shine += `<circle cx="${r(bx.x1 + bw * (0.3 + R() * 0.4))}" cy="${r(bx.y1 + bh * (0.55 + R() * 0.25))}" r="${r(size * 0.022)}" fill="#fff" opacity="0.7"/>`;
  });
  // A light band across the middle of the fill (the "fade line").
  shine += `<rect x="${r(bb.x1)}" y="${r(bb.y1 + (bb.y2 - bb.y1) * 0.52)}" width="${r(bb.x2 - bb.x1)}" height="${r(size * 0.035)}" fill="#fff" opacity="0.28"/>`;
  b += `<g clip-path="url(#${id}C)">${shine}</g>`;
  for (let k = 0; k < sparkles; k++) {
    const sx = k % 2 ? bb.x2 + size * 0.1 : bb.x1 - size * 0.05;
    const sy = bb.y1 + (k * 0.37 + 0.1) * (bb.y2 - bb.y1);
    b += sparkle(sx + (R() - 0.5) * size * 0.3, sy, size * (0.1 + R() * 0.08));
  }
  b += `</g>`;
  return { defs, body: b, bbox: { x1: x + bb.x1, y1: y + bb.y1, x2: x + bb.x2, y2: y + bb.y2 } };
}

/** Chrome (silver) throw-up with a thin coloured outer line. */
export function throwUp(id, text, { x, y, size = 120, rot = 0, edge = "#2ad4ff", seed = 1, font = "piece" }) {
  return piece(id, text, {
    font,
    size,
    x,
    y,
    rot,
    seed,
    fill: ["#ffffff", "#c9ced6", "#8d96a2", "#e9edf2"],
    outline: "#08080b",
    outline2: edge,
    depth: "#0b0b10",
    drips: 3,
    sparkles: 2,
    bounce: 0.08,
    lean: 0.1,
  });
}

/** A marker or spray tag: one colour, optional underline swoosh and crown. */
export function tag(text, { x, y, size = 44, rot = 0, color = "#f4f1ea", font = "tag", seed = 1, swoosh = false, crown = false, drips = 0, opacity = 1 }) {
  const w = wordPath(text, { font, size, bounce: 0.06, lean: 0.08, seed, tracking: -0.03 });
  const bb = w.bbox;
  let s = `<g transform="translate(${r(x)} ${r(y)}) rotate(${rot})" fill="${color}" opacity="${opacity}"><path d="${w.d}"/>`;
  if (drips) s += `<path d="${dripsPath(w.boxes, size, drips, seed + 2, { minLen: 0.3, maxLen: 1.2, start: 0.1 })}"/>`;
  if (swoosh) s += `<path d="M${r(bb.x1)} ${r(bb.y2 + size * 0.18)}Q${r((bb.x1 + bb.x2) / 2)} ${r(bb.y2 + size * 0.42)} ${r(bb.x2 + size * 0.2)} ${r(bb.y2 + size * 0.05)}" fill="none" stroke="${color}" stroke-width="${r(size * 0.07)}" stroke-linecap="round"/><path d="M${r(bb.x2 + size * 0.2)} ${r(bb.y2 + size * 0.05)}l${r(-size * 0.2)} ${r(-size * 0.02)}m${r(size * 0.2)} ${r(size * 0.02)}l${r(-size * 0.1)} ${r(size * 0.16)}" fill="none" stroke="${color}" stroke-width="${r(size * 0.07)}" stroke-linecap="round"/>`;
  if (crown) {
    const cx = bb.x1 + (bb.x2 - bb.x1) * 0.2;
    const cy = bb.y1 - size * 0.18;
    const c = size * 0.32;
    s += `<path d="M${r(cx - c)} ${r(cy)}L${r(cx - c * 0.7)} ${r(cy - c * 0.8)}L${r(cx - c * 0.3)} ${r(cy - c * 0.2)}L${r(cx)} ${r(cy - c)}L${r(cx + c * 0.3)} ${r(cy - c * 0.2)}L${r(cx + c * 0.7)} ${r(cy - c * 0.8)}L${r(cx + c)} ${r(cy)}Z" fill="none" stroke="${color}" stroke-width="${r(size * 0.06)}" stroke-linejoin="round"/>`;
  }
  return s + `</g>`;
}

/** Stencil lettering (blocky, with bridges) for street furniture and signs. */
export function stencil(text, { x, y, size = 40, rot = 0, color = "#f4f1ea", opacity = 0.9 }) {
  const w = wordPath(text, { font: "block", size, tracking: 0.04, seed: 1 });
  return `<g transform="translate(${r(x)} ${r(y)}) rotate(${rot})" fill="${color}" opacity="${opacity}"><path d="${w.d}"/></g>`;
}

/** A cluster of stickers (sticker bomb). */
export function stickerBomb({ x, y, w, h, n = 22, seed = 1 }) {
  const R = rng(seed);
  const colours = ["#f4f1ea", "#ffd400", "#ff3b1f", "#111114", "#2ad4ff", "#ff2e88", "#9aff3c"];
  let s = "";
  for (let i = 0; i < n; i++) {
    const sx = x + R() * w;
    const sy = y + R() * h;
    const rot = r((R() - 0.5) * 40);
    const kind = R();
    const c = colours[Math.floor(R() * colours.length)];
    const ink = c === "#111114" || c === "#ff3b1f" ? "#f4f1ea" : "#111114";
    if (kind < 0.3) {
      // "Hello my name is" label with a tag inside.
      const lw = 70 + R() * 20;
      s += `<g transform="translate(${r(sx)} ${r(sy)}) rotate(${rot})"><rect x="0" y="0" width="${r(lw)}" height="48" rx="5" fill="#f4f1ea"/><rect x="0" y="0" width="${r(lw)}" height="16" rx="5" fill="#d8231a"/><rect x="0" y="9" width="${r(lw)}" height="7" fill="#d8231a"/>${tag(["WRNG", "N!", "DLH", "VOLT", "ZRO"][i % 5], { x: lw / 2, y: 42, size: 24, color: "#111114", seed: seed + i })}</g>`;
    } else if (kind < 0.55) {
      // Round sticker with a mirrored N or a smiley.
      const cr = 14 + R() * 12;
      const face = R() > 0.5;
      s += `<g transform="translate(${r(sx)} ${r(sy)}) rotate(${rot})"><circle r="${r(cr)}" fill="${c}"/>`;
      if (face) s += `<circle cx="${r(-cr * 0.35)}" cy="${r(-cr * 0.2)}" r="${r(cr * 0.11)}" fill="${ink}"/><path d="M${r(cr * 0.2)} ${r(-cr * 0.32)}l${r(cr * 0.28)} ${r(cr * 0.24)}m0 ${r(-cr * 0.24)}l${r(-cr * 0.28)} ${r(cr * 0.24)}" stroke="${ink}" stroke-width="${r(cr * 0.1)}"/><path d="M${r(-cr * 0.5)} ${r(cr * 0.2)}q${r(cr * 0.5)} ${r(cr * 0.5)} ${r(cr)} 0" fill="none" stroke="${ink}" stroke-width="${r(cr * 0.1)}" stroke-linecap="round"/>`;
      else s += `<g transform="scale(-1 1)">${stencil("N", { x: 0, y: cr * 0.42, size: cr * 1.2, color: ink, opacity: 1 })}</g>`;
      s += `</g>`;
    } else if (kind < 0.8) {
      // Rectangular slap with a word.
      const words = ["WRNGSIDE", "440V", "AFTER HRS", "NO SLEEP", "DELHI", "DROP 04"];
      const word = words[Math.floor(R() * words.length)];
      const fs = 13;
      const ww = word.length * fs * 0.78 + 14;
      s += `<g transform="translate(${r(sx)} ${r(sy)}) rotate(${rot})"><rect x="0" y="0" width="${r(ww)}" height="26" fill="${c}"/>${stencil(word, { x: ww / 2, y: 19, size: fs, color: ink, opacity: 1 })}</g>`;
    } else {
      // Barcode / hazard slap.
      const bw = 46 + R() * 20;
      let bars = "";
      for (let k = 0; k < 14; k++) bars += `<rect x="${r(6 + k * ((bw - 12) / 14))}" y="6" width="${r(1 + R() * 2)}" height="18" fill="#111114"/>`;
      s += `<g transform="translate(${r(sx)} ${r(sy)}) rotate(${rot})"><rect width="${r(bw)}" height="30" fill="#f4f1ea"/>${bars}</g>`;
    }
  }
  return s;
}
