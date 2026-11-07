// Shared helpers for the placeholder-art generator.
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const opentype = require("opentype.js");

const here = path.dirname(fileURLToPath(import.meta.url));
const fontDir = path.join(here, "..", "fonts");

export const fonts = {
  display: opentype.loadSync(path.join(fontDir, "archivo-125-900.ttf")),
  displayBold: opentype.loadSync(path.join(fontDir, "archivo-125-800.ttf")),
  mono: opentype.loadSync(path.join(fontDir, "geistmono-500.ttf")),
  sans: opentype.loadSync(path.join(fontDir, "geist-500.ttf")),
};

/* ───────────── numbers & colour ───────────── */

export const r = (n, d = 1) => Number(n.toFixed(d));

export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([R, G, B]) {
  return "#" + [R, G, B].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}

export function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
}

/** t > 0 lightens toward white, t < 0 darkens toward black. */
export function tone(hex, t) {
  return t >= 0 ? mix(hex, "#ffffff", t) : mix(hex, "#000000", -t);
}

export function luminance(hex) {
  const [R, G, B] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export const isDark = (hex) => luminance(hex) < 0.12;

/** Deterministic RNG so regenerated art is stable. */
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* ───────────── text → path ───────────── */

/**
 * Lay out text as a single SVG path. `mirrorN` flips every N horizontally
 * (the WRNGSIDE brand device). Returns { d, width, height }.
 */
export function textPath(text, { font = "display", size = 40, x = 0, y = 0, anchor = "start", tracking = 0, mirrorN = false } = {}) {
  const f = fonts[font];
  const scale = size / f.unitsPerEm;
  const glyphs = f.stringToGlyphs(text);
  const adv = [];
  let width = 0;
  glyphs.forEach((g, i) => {
    let a = (g.advanceWidth || 0) * scale;
    if (i < glyphs.length - 1) a += f.getKerningValue(g, glyphs[i + 1]) * scale;
    adv.push(a);
    width += a + (i < glyphs.length - 1 ? tracking * size : 0);
  });
  let cx = anchor === "middle" ? x - width / 2 : anchor === "end" ? x - width : x;
  const parts = [];
  glyphs.forEach((g, i) => {
    const ch = text[i];
    const p = g.getPath(cx, y, size);
    if (mirrorN && (ch === "N" || ch === "И")) {
      // Flip horizontally about the glyph's advance centre.
      const mid = cx + ((g.advanceWidth || 0) * scale) / 2;
      p.commands.forEach((c) => {
        ["x", "x1", "x2"].forEach((k) => {
          if (c[k] !== undefined) c[k] = 2 * mid - c[k];
        });
      });
    }
    parts.push(p.toPathData(2));
    cx += adv[i] + tracking * size;
  });
  const capHeight = ((f.tables.os2 && f.tables.os2.sCapHeight) || f.ascender * 0.7) * scale;
  return { d: parts.join(" "), width, height: capHeight };
}

/** Text placed along a circular arc (centre cx, cy, radius R), centred at angle -90°. */
export function arcTextPath(text, { font = "display", size = 30, cx = 0, cy = 0, radius = 200, tracking = 0.04, mirrorN = false } = {}) {
  const f = fonts[font];
  const scale = size / f.unitsPerEm;
  const glyphs = f.stringToGlyphs(text);
  const widths = glyphs.map((g) => (g.advanceWidth || 0) * scale + tracking * size);
  const total = widths.reduce((a, b) => a + b, 0);
  let angle = -Math.PI / 2 - total / radius / 2;
  const parts = [];
  glyphs.forEach((g, i) => {
    const w = widths[i];
    const mid = angle + w / 2 / radius;
    const px = cx + radius * Math.cos(mid);
    const py = cy + radius * Math.sin(mid);
    const p = g.getPath(-((g.advanceWidth || 0) * scale) / 2, 0, size);
    const rot = mid + Math.PI / 2;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const ch = text[i];
    p.commands.forEach((c) => {
      ["", "1", "2"].forEach((suf) => {
        const kx = "x" + suf;
        const ky = "y" + suf;
        if (c[kx] === undefined) return;
        let X = c[kx];
        const Y = c[ky];
        if (mirrorN && ch === "N") X = -X;
        c[kx] = px + X * cos - Y * sin;
        c[ky] = py + X * sin + Y * cos;
      });
    });
    parts.push(p.toPathData(2));
    angle += w / radius;
  });
  return parts.join(" ");
}

/* ───────────── svg building ───────────── */

export const svgDoc = (w, h, body, { bg } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(w)} ${r(h)}" width="${r(w)}" height="${r(h)}" preserveAspectRatio="xMidYMid meet">${
    bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : ""
  }${body}</svg>`;

/** Fabric grain + blur filters used by every garment. */
export function fabricDefs(prefix, seed = 3) {
  return `
<filter id="${prefix}grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="${seed}" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.2 0 0 0 -1.12"/>
</filter>
<filter id="${prefix}grainL" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="${seed + 7}" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.5 0 0 0 -0.82"/>
</filter>
<filter id="${prefix}b4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="${prefix}b10" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="${prefix}b22" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="22"/></filter>`;
}

/**
 * Paint a fabric panel: base colour, top-light gradient, side falloff,
 * folds (dark) and drapes (light), grain. `folds` are paths in the same space.
 */
export function panel(id, d, base, { folds = [], lights = [], prefix = "", light = 0.1, dark = 0.28, bbox, grain = true, stroke = true } = {}) {
  const dk = isDark(base);
  const hi = dk ? 0.14 : 0.18;
  const lo = dk ? 0.55 : 0.22;
  const [x0, y0, x1, y1] = bbox || [0, 0, 1000, 1000];
  return `
<defs>
  <clipPath id="${id}c"><path d="${d}"/></clipPath>
  <linearGradient id="${id}v" x1="0" y1="${y0}" x2="0" y2="${y1}" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#fff" stop-opacity="${r(hi + light, 2)}"/>
    <stop offset="0.35" stop-color="#fff" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity="${r(lo * 0.55 + dark * 0.4, 2)}"/>
  </linearGradient>
  <linearGradient id="${id}h" x1="${x0}" y1="0" x2="${x1}" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#000" stop-opacity="${r(lo * 0.5, 2)}"/>
    <stop offset="0.18" stop-color="#000" stop-opacity="0"/>
    <stop offset="0.82" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity="${r(lo * 0.6, 2)}"/>
  </linearGradient>
</defs>
<path d="${d}" fill="${base}"/>
<g clip-path="url(#${id}c)">
  <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#${id}v)"/>
  <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#${id}h)"/>
  ${folds.map((f) => `<path d="${f}" fill="#000" opacity="${dk ? 0.5 : 0.2}" filter="url(#${prefix}b10)"/>`).join("")}
  ${lights.map((f) => `<path d="${f}" fill="#fff" opacity="${dk ? 0.1 : 0.22}" filter="url(#${prefix}b10)"/>`).join("")}
  ${grain ? `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" filter="url(#${prefix}grain)" opacity="${dk ? 0.28 : 0.1}"/>
  <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" filter="url(#${prefix}grainL)" opacity="${dk ? 0.1 : 0.07}"/>` : ""}
</g>
${stroke ? `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${dk ? 0.6 : 0.18}" stroke-width="1.4"/>` : ""}`;
}

/** Dashed stitch line. */
export const stitch = (d, colour = "#000", opacity = 0.3, w = 1.3, dash = "5 3.5") =>
  `<path d="${d}" fill="none" stroke="${colour}" stroke-opacity="${opacity}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linecap="round"/>`;

/** Rib knit band: base fill plus fine vertical lines, clipped. */
export function rib(id, d, base, { bbox, step = 5, vertical = true, opacity } = {}) {
  const [x0, y0, x1, y1] = bbox;
  const dk = isDark(base);
  const op = opacity ?? (dk ? 0.35 : 0.14);
  const lines = [];
  if (vertical) for (let x = x0; x <= x1; x += step) lines.push(`M${r(x)} ${r(y0)}V${r(y1)}`);
  else for (let y = y0; y <= y1; y += step) lines.push(`M${r(x0)} ${r(y)}H${r(x1)}`);
  return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>
<path d="${d}" fill="${tone(base, dk ? 0.04 : -0.05)}"/>
<g clip-path="url(#${id})"><path d="${lines.join("")}" stroke="${dk ? "#fff" : "#000"}" stroke-opacity="${op * (dk ? 0.35 : 1)}" stroke-width="1.1" fill="none"/>
<path d="${lines.join("")}" transform="translate(${step / 2} 0)" stroke="#000" stroke-opacity="${op}" stroke-width="1.6" fill="none"/></g>
<path d="${d}" fill="none" stroke="#000" stroke-opacity="${dk ? 0.6 : 0.2}" stroke-width="1.2"/>`;
}

/** A 4:5 product-shot frame on dust. The garment casts a soft silhouette shadow. */
export function productFrame(inner, { w = 800, h = 1000, bg = "#DCD7CE", id = "pf" } = {}) {
  return svgDoc(
    w,
    h,
    `<defs>
  <radialGradient id="${id}vig" cx="50%" cy="45%" r="75%">
    <stop offset="0.6" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.09"/>
  </radialGradient>
  <linearGradient id="${id}flr" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity="0.16"/>
    <stop offset="1" stop-color="#000" stop-opacity="0.04"/>
  </linearGradient>
  <filter id="${id}sil1" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="${id}sil2" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/><feGaussianBlur stdDeviation="26"/></filter>
  <filter id="${id}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.4 0 0 0 -0.8"/></filter>
  <g id="${id}g">${inner}</g>
</defs>
<rect width="${w}" height="${h}" fill="${bg}"/>
<rect width="${w}" height="${h}" fill="url(#${id}flr)"/>
<use href="#${id}g" filter="url(#${id}sil2)" opacity="0.16" transform="translate(10 26)"/>
<use href="#${id}g" filter="url(#${id}sil1)" opacity="0.18" transform="translate(4 9)"/>
<use href="#${id}g"/>
<rect width="${w}" height="${h}" fill="url(#${id}vig)"/>
<rect width="${w}" height="${h}" filter="url(#${id}n)" opacity="0.10"/>`,
  );
}
