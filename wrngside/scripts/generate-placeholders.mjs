#!/usr/bin/env node
// Generates placeholder product art into public/products/{handle}/{colour}/.
// Same slots real photography will use: cutout, front, back, inside-out, model-1.
//   node scripts/generate-placeholders.mjs            → all products
//   node scripts/generate-placeholders.mjs --sheet    → also writes a contact sheet
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { catalog } from "../src/lib/commerce/mock/catalog.ts";
import { fabricDefs, svgDoc, productFrame, r, tone } from "./art/lib.mjs";
import { drawGarment, seedFor } from "./art/garments.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "products");
const wantSheet = process.argv.includes("--sheet");

const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.replace(/\n\s*/g, "\n").trim() + "\n");
};

const sizes = [];
const sheet = [];

for (const p of catalog) {
  for (const col of p.colours) {
    const dir = path.join(out, p.handle, col.slug);
    const seed = seedFor(p, col);

    // Cutout (hanging pose, transparent, true scale in mm).
    const hang = drawGarment(p, col, "front", "hang");
    const [x0, y0, x1, y1] = hang.bbox;
    const w = x1 - x0;
    const h = y1 - y0;
    const cut = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(x0)} ${r(y0)} ${r(w)} ${r(h)}" width="${r(w)}" height="${r(h)}"><defs>${fabricDefs("g", seed)}</defs>${hang.svg}</svg>`;
    write(path.join(dir, "cutout.svg"), cut);
    sizes.push({ handle: p.handle, colour: col.slug, wCm: r(w / 10), hCm: r(h / 10), catalog: p.dims });

    // Product shots (flat pose) in a 4:5 frame on dust.
    for (const view of ["front", "back", "inside"]) {
      const g = drawGarment(p, col, view, "flat");
      const [bx0, by0, bx1, by1] = g.bbox;
      const bw = bx1 - bx0;
      const bh = by1 - by0;
      const maxW = 600;
      const maxH = 700;
      const k = Math.min(maxW / bw, maxH / bh);
      const cx = 400;
      const cy = 500;
      const tx = cx - (bx0 + bw / 2) * k;
      const ty = cy - (by0 + bh / 2) * k;
      const inner = `${fabricDefs("g", seed)}<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(k, 4)})">${g.svg}</g>`;
      const file = view === "inside" ? "inside-out.svg" : `${view}.svg`;
      write(path.join(dir, file), productFrame(inner, { id: "pf" }));
    }

    // Night shot (model-1 slot): the piece on a wire under a sodium lamp.
    {
      const k = Math.min(520 / w, 600 / h);
      const cx = 400;
      const top = 250;
      const tx = cx - (x0 + w / 2) * k;
      const ty = top - y0 * k;
      const garment = `<g transform="translate(${r(tx)} ${r(ty)}) scale(${r(k, 4)})">${hang.svg}</g>`;
      const shadow = `<g transform="translate(${r(tx + 46)} ${r(ty + 30)}) scale(${r(k, 4)})" filter="url(#ns)" opacity="0.55">${hang.svg.replace(/fill="#[0-9a-fA-F]{3,6}"/g, 'fill="#000"').replace(/stroke="#[0-9a-fA-F]{3,6}"/g, 'stroke="#000"')}</g>`;
      const night = svgDoc(
        800,
        1000,
        `<defs>${fabricDefs("g", seed)}
<linearGradient id="nbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e0f16"/><stop offset="0.55" stop-color="#1b1714"/><stop offset="1" stop-color="#0b0b0b"/></linearGradient>
<radialGradient id="nl" cx="0.72" cy="0.06" r="0.75"><stop offset="0" stop-color="#FF9A3C" stop-opacity="0.55"/><stop offset="0.35" stop-color="#FF9A3C" stop-opacity="0.16"/><stop offset="1" stop-color="#FF9A3C" stop-opacity="0"/></radialGradient>
<filter id="ns" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="nn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -0.85"/></filter>
<filter id="nb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter></defs>
<rect width="800" height="1000" fill="url(#nbg)"/>
<rect x="0" y="380" width="800" height="560" fill="#24201c"/>
<rect x="0" y="380" width="800" height="6" fill="#000" opacity="0.5"/>
<rect x="0" y="930" width="800" height="70" fill="#0d0d0d"/>
<rect width="800" height="1000" fill="url(#nl)"/>
<circle cx="610" cy="40" r="60" fill="#FFB36A" opacity="0.5" filter="url(#nb)"/>
<path d="M-20 238 Q400 262 820 236" stroke="#060606" stroke-width="5" fill="none"/>
<path d="M-20 180 Q400 214 820 176" stroke="#060606" stroke-width="3" fill="none" opacity="0.8"/>
${shadow}${garment}
<rect width="800" height="1000" filter="url(#nn)" opacity="0.10"/>
<rect width="800" height="1000" fill="#000" opacity="0.08"/>`,
      );
      write(path.join(dir, "model-1.svg"), night);
    }

    sheet.push({ handle: p.handle, colour: col.slug, files: ["cutout", "front", "back", "inside-out", "model-1"] });
  }
}

console.table(sizes.map((s) => ({ ...s, catalog: `${s.catalog.w}×${s.catalog.h}` })));

if (wantSheet) {
  const html = `<!doctype html><meta charset="utf-8"><style>body{background:#777;font:12px monospace;margin:0;padding:12px}
.row{display:flex;gap:8px;align-items:flex-start;margin-bottom:12px}.row img{height:240px;background:repeating-conic-gradient(#666 0 25%,#6d6d6d 0 50%) 0/20px 20px}
.row img.f{background:none}.lab{width:150px;color:#fff}</style>${sheet
    .map(
      (s) =>
        `<div class="row"><div class="lab">${s.handle}<br>${s.colour}</div>${s.files
          .map((f) => `<img class="${f === "cutout" ? "" : "f"}" src="/products/${s.handle}/${s.colour}/${f}.svg">`)
          .join("")}</div>`,
    )
    .join("")}`;
  fs.writeFileSync(path.join(root, "public", "__sheet.html"), html);
  console.log("contact sheet → public/__sheet.html");
}
void tone;
