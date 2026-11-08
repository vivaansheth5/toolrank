// Street-scene kit for the lookbook: American blocks at night. Everything is
// plain SVG (paths, gradients, a few blurs) so sharp/librsvg renders it.
import { rng, r } from "./lib.mjs";
import { wordPath } from "./graffiti.mjs";

/** Vertical sky gradient (stops: [offset, colour]). */
export function sky(id, W, H, stops) {
  return {
    defs: `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`,
    body: `<rect width="${W}" height="${H}" fill="url(#${id})"/>`,
  };
}

/** Scattered stars in the top part of the frame. */
export function stars(W, h, n, seed) {
  const R = rng(seed);
  let s = "";
  for (let i = 0; i < n; i++) s += `<circle cx="${r(R() * W)}" cy="${r(R() * h)}" r="${r(0.6 + R() * 1.6)}" fill="#fff" opacity="${r(0.25 + R() * 0.6, 2)}"/>`;
  return s;
}

/** Soft light: a blurred disc (needs filter id `blur`). */
export const glow = (x, y, rad, colour, op = 0.5, blurId = "b60") => `<circle cx="${r(x)}" cy="${r(y)}" r="${r(rad)}" fill="${colour}" opacity="${op}" filter="url(#${blurId})"/>`;

/** Green US street-name sign on its own post; text centred. */
export function streetSign(x, y, text, { size = 30, post = 260, rot = 0 } = {}) {
  const w = wordPath(text, { font: "block", size, tracking: 0.04, seed: 2 });
  const bw = w.width + size * 1.2;
  const bh = size * 1.55;
  return `<g transform="translate(${r(x)} ${r(y)}) rotate(${rot})">
<rect x="-5" y="0" width="10" height="${post}" fill="#3a3f45"/><rect x="-5" y="0" width="3" height="${post}" fill="#6b727a"/>
<rect x="${r(-bw / 2)}" y="${r(-bh)}" width="${r(bw)}" height="${r(bh)}" rx="6" fill="#0d6b3f"/>
<rect x="${r(-bw / 2 + 4)}" y="${r(-bh + 4)}" width="${r(bw - 8)}" height="${r(bh - 8)}" rx="4" fill="none" stroke="#f4f4ee" stroke-width="2.5"/>
<g transform="translate(0 ${r(-bh / 2 + size * 0.36)})"><path d="${w.d}" fill="#f4f4ee"/></g></g>`;
}

/** NYC-style street lamp: a tall curved pole, cobra head, light below. */
export function nycLamp(x, groundY, h, { left = false } = {}) {
  const dir = left ? -1 : 1;
  const top = groundY - h;
  const hx = x + dir * 90;
  return `<path d="M${x} ${groundY}V${top + 40}Q${x} ${top} ${x + dir * 50} ${top}H${hx}" stroke="#1d1f24" stroke-width="12" fill="none"/>
<path d="M${hx - 34} ${top - 8}h68l-10 18h-48z" fill="#25272d"/>
<ellipse cx="${hx}" cy="${top + 11}" rx="26" ry="6" fill="#fff4d8"/>
${glow(hx, top + 30, 150, "#ffcf8a", 0.45, "b60")}${glow(hx, top + 14, 44, "#fff1cf", 0.9, "b20")}
<path d="M${hx - 22} ${top + 14}L${hx - 210} ${groundY}H${hx + 210}L${hx + 22} ${top + 14}Z" fill="url(#beam)"/>`;
}

/** Brick facade with windows (some lit), cornice and an optional fire escape. */
export function brickBlock(x, y, w, h, { seed = 1, brick = "#6e2f22", lit = 0.3, cols = 4, floors = 6, fire = true } = {}) {
  const R = rng(seed);
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${brick}"/>`;
  // Brick courses.
  for (let yy = y + 6; yy < y + h; yy += 12) s += `<rect x="${x}" y="${yy}" width="${w}" height="1.6" fill="#000" opacity="0.22"/>`;
  s += `<rect x="${x - 10}" y="${y - 18}" width="${w + 20}" height="22" fill="#3b1a14"/><rect x="${x - 10}" y="${y - 18}" width="${w + 20}" height="4" fill="#8a4a3a"/>`;
  const fh = h / floors;
  const cw = w / cols;
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const wx = x + c * cw + cw * 0.22;
      const wy = y + f * fh + fh * 0.2;
      const ww = cw * 0.56;
      const wh = fh * 0.58;
      const on = R() < lit;
      s += `<rect x="${r(wx - 4)}" y="${r(wy - 6)}" width="${r(ww + 8)}" height="6" fill="#d8cfc0" opacity="0.6"/>`;
      s += `<rect x="${r(wx)}" y="${r(wy)}" width="${r(ww)}" height="${r(wh)}" fill="${on ? (R() > 0.5 ? "#ffc879" : "#ffe1a6") : "#14161d"}"/>`;
      if (on) s += glow(wx + ww / 2, wy + wh / 2, ww * 0.9, "#ffb860", 0.25, "b20");
      s += `<path d="M${r(wx + ww / 2)} ${r(wy)}V${r(wy + wh)}M${r(wx)} ${r(wy + wh / 2)}H${r(wx + ww)}" stroke="#2a1d16" stroke-width="3"/>`;
    }
  }
  if (fire) s += fireEscape(x + w * 0.18, y + fh * 0.75, w * 0.64, floors - 1, fh);
  return s;
}

/** Black iron fire escape: platforms with railings and zig-zag stairs. */
export function fireEscape(x, y, w, n, step) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const py = y + i * step;
    s += `<rect x="${r(x)}" y="${r(py)}" width="${r(w)}" height="6" fill="#0c0d10"/>`;
    s += `<path d="M${r(x)} ${r(py - 34)}H${r(x + w)}" stroke="#0c0d10" stroke-width="3"/>`;
    for (let k = 0; k <= 12; k++) s += `<path d="M${r(x + (k * w) / 12)} ${r(py - 34)}V${r(py)}" stroke="#0c0d10" stroke-width="1.6"/>`;
    // Stairs to the next platform, alternating direction.
    if (i < n - 1) {
      const a = i % 2 ? x + w * 0.15 : x + w * 0.85;
      const b = i % 2 ? x + w * 0.62 : x + w * 0.38;
      s += `<path d="M${r(a)} ${r(py)}L${r(b)} ${r(py + step)}" stroke="#0c0d10" stroke-width="5"/>`;
      for (let k = 1; k < 8; k++) {
        const t = k / 8;
        const sx = a + (b - a) * t;
        const sy = py + step * t;
        s += `<path d="M${r(sx - 10)} ${r(sy)}h20" stroke="#0c0d10" stroke-width="2"/>`;
      }
    }
  }
  return s;
}

/** Elevated subway structure across the frame: deck, lattice and columns. */
export function elevatedTrack(W, y, { seed = 1, train = true } = {}) {
  let s = `<rect x="-20" y="${y}" width="${W + 40}" height="34" fill="#15171c"/><rect x="-20" y="${y + 34}" width="${W + 40}" height="10" fill="#0b0c0f"/>`;
  let lat = "";
  for (let x = -20; x < W + 20; x += 44) lat += `M${x} ${y + 34}L${x + 22} ${y + 74}L${x + 44} ${y + 34}`;
  s += `<path d="${lat}" stroke="#15171c" stroke-width="4" fill="none"/><rect x="-20" y="${y + 72}" width="${W + 40}" height="6" fill="#15171c"/>`;
  for (let x = 60; x < W; x += 260) s += `<rect x="${x}" y="${y + 78}" width="16" height="2000" fill="#111317"/>`;
  if (train) {
    const R = rng(seed);
    s += `<rect x="-20" y="${y - 70}" width="${W + 40}" height="66" rx="8" fill="#2c3038"/>`;
    for (let x = 10; x < W; x += 66) s += `<rect x="${x}" y="${y - 58}" width="40" height="26" rx="3" fill="${R() > 0.25 ? "#ffe9b8" : "#3a3f48"}" opacity="0.92"/>`;
    s += glow(W / 2, y - 40, W * 0.45, "#ffd08a", 0.12, "b60");
  }
  return s;
}

/** Brownstone with stoop, cornice and windows. */
export function brownstone(x, y, w, h, { seed = 1, lit = 0.35 } = {}) {
  const R = rng(seed);
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#4a2e22"/>`;
  s += `<rect x="${x - 8}" y="${y - 22}" width="${w + 16}" height="26" fill="#2c1a13"/><rect x="${x - 8}" y="${y - 6}" width="${w + 16}" height="5" fill="#6b4535"/>`;
  const floors = 4;
  const fh = (h * 0.78) / floors;
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < 3; c++) {
      const wx = x + w * (0.1 + c * 0.3);
      const wy = y + 20 + f * fh;
      const ww = w * 0.2;
      const wh = fh * 0.62;
      const on = R() < lit;
      s += `<rect x="${r(wx - 6)}" y="${r(wy - 8)}" width="${r(ww + 12)}" height="8" fill="#7a5442"/>`;
      s += `<rect x="${r(wx)}" y="${r(wy)}" width="${r(ww)}" height="${r(wh)}" fill="${on ? "#ffd38c" : "#16141a"}"/>`;
      if (on) s += glow(wx + ww / 2, wy + wh / 2, ww, "#ffb860", 0.22, "b20");
    }
  }
  // Stoop.
  const sx = x + w * 0.62;
  for (let k = 0; k < 7; k++) s += `<rect x="${r(sx - k * 6)}" y="${r(y + h - 14 - k * 14)}" width="${r(w * 0.3 + k * 12)}" height="14" fill="${k % 2 ? "#5a3a2c" : "#4f3226"}"/>`;
  return s;
}

/** Cast-iron facade (SoHo): columns, tall windows, cornice. */
export function castIron(x, y, w, h, { seed = 1, lit = 0.45, colour = "#bdb3a2", cols = 4 } = {}) {
  const R = rng(seed);
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${colour}"/>`;
  s += `<rect x="${x - 12}" y="${y - 30}" width="${w + 24}" height="34" fill="#8e8574"/>`;
  for (let k = 0; k < 14; k++) s += `<rect x="${r(x - 12 + k * ((w + 24) / 14))}" y="${y - 30}" width="10" height="16" fill="#6f675a"/>`;
  const floors = 5;
  const fh = h / floors;
  const cw = w / cols;
  for (let f = 0; f < floors; f++) {
    s += `<rect x="${x}" y="${r(y + f * fh)}" width="${w}" height="8" fill="#968c7a"/>`;
    for (let c = 0; c < cols; c++) {
      const cx = x + c * cw;
      s += `<rect x="${r(cx)}" y="${r(y + f * fh)}" width="14" height="${r(fh)}" fill="#a39885"/>`;
      const wx = cx + 24;
      const wy = y + f * fh + 18;
      const ww = cw - 38;
      const wh = fh - 30;
      const on = R() < lit;
      s += `<path d="M${r(wx)} ${r(wy + wh)}V${r(wy + ww / 2)}A${r(ww / 2)} ${r(ww / 2)} 0 0 1 ${r(wx + ww)} ${r(wy + ww / 2)}V${r(wy + wh)}Z" fill="${on ? "#ffdca0" : "#1a1c22"}"/>`;
      if (on) s += glow(wx + ww / 2, wy + wh / 2, ww, "#ffc070", 0.2, "b20");
    }
  }
  return s;
}

/** Palm tree silhouette: a leaning trunk and a crown of fronds. */
export function palm(x, groundY, h, { lean = 0.08, seed = 1, colour = "#07080c" } = {}) {
  const R = rng(seed);
  const tx = x + h * lean;
  const ty = groundY - h;
  let s = `<path d="M${x - 9} ${groundY}Q${r(x + h * lean * 0.3)} ${r(groundY - h * 0.5)} ${r(tx - 3)} ${r(ty)}L${r(tx + 3)} ${r(ty)}Q${r(x + h * lean * 0.3 + 10)} ${r(groundY - h * 0.5)} ${x + 9} ${groundY}Z" fill="${colour}"/>`;
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + R() * 0.3;
    const L = h * (0.2 + R() * 0.08);
    const ex = tx + Math.cos(a) * L;
    const ey = ty + Math.sin(a) * L * 0.55 + L * 0.25;
    const cx = tx + Math.cos(a) * L * 0.5;
    const cy = ty + Math.sin(a) * L * 0.2 - L * 0.12;
    s += `<path d="M${r(tx)} ${r(ty)}Q${r(cx)} ${r(cy)} ${r(ex)} ${r(ey)}" stroke="${colour}" stroke-width="${r(h * 0.022)}" fill="none" stroke-linecap="round"/>`;
    for (let k = 1; k < 7; k++) {
      const t = k / 7;
      const px = (1 - t) * (1 - t) * tx + 2 * (1 - t) * t * cx + t * t * ex;
      const py = (1 - t) * (1 - t) * ty + 2 * (1 - t) * t * cy + t * t * ey;
      s += `<path d="M${r(px)} ${r(py)}l${r(-6 + R() * 4)} ${r(10 + R() * 8)}M${r(px)} ${r(py)}l${r(4 + R() * 4)} ${r(9 + R() * 8)}" stroke="${colour}" stroke-width="3" stroke-linecap="round"/>`;
    }
  }
  return s;
}

/** People queueing on a sidewalk, seen from the side (silhouettes). */
export function queue(x, groundY, n, { seed = 1, gap = 46, colour = "#06070a", rim = "#ff9a3c" } = {}) {
  const R = rng(seed);
  let s = "";
  for (let i = 0; i < n; i++) {
    const px = x + i * gap + R() * 10;
    const hgt = 150 + R() * 30;
    const hood = R() > 0.4;
    s += `<g transform="translate(${r(px)} ${groundY})"><path d="M-14 0L-10 ${r(-hgt * 0.45)}Q-20 ${r(-hgt * 0.6)} -16 ${r(-hgt * 0.78)}Q0 ${r(-hgt * 0.86)} 16 ${r(-hgt * 0.78)}Q20 ${r(-hgt * 0.6)} 10 ${r(-hgt * 0.45)}L14 0Z" fill="${colour}"/>`;
    s += hood ? `<path d="M-12 ${r(-hgt * 0.84)}Q-14 ${r(-hgt)} 0 ${r(-hgt * 1.02)}Q14 ${r(-hgt)} 12 ${r(-hgt * 0.84)}Z" fill="${colour}"/>` : `<circle cx="0" cy="${r(-hgt * 0.92)}" r="11" fill="${colour}"/>`;
    s += `<path d="M14 ${r(-hgt * 0.7)}L12 ${r(-hgt * 0.4)}" stroke="${rim}" stroke-width="1.6" opacity="0.6"/></g>`;
  }
  return s;
}

/** Empty kidney-shaped swimming pool in perspective, white coping, blue tiles. */
export function emptyPool(x, y, w, h) {
  const d = `M${x} ${y + h * 0.45}C${x} ${y - h * 0.05} ${x + w * 0.45} ${y - h * 0.1} ${x + w * 0.55} ${y + h * 0.18}C${x + w * 0.65} ${y + h * 0.38} ${x + w} ${y + h * 0.05} ${x + w} ${y + h * 0.5}C${x + w} ${y + h * 1.0} ${x + w * 0.2} ${y + h * 1.05} ${x} ${y + h * 0.45}Z`;
  let s = `<path d="${d}" fill="#7fa9bd"/>`;
  s += `<path d="${d}" fill="url(#poolShade)"/>`;
  // Tile band under the coping.
  s += `<path d="${d}" fill="none" stroke="#2f6f8f" stroke-width="22" opacity="0.6"/>`;
  s += `<path d="${d}" fill="none" stroke="#e9e6dd" stroke-width="10"/>`;
  // Drain.
  s += `<ellipse cx="${r(x + w * 0.52)}" cy="${r(y + h * 0.68)}" rx="16" ry="6" fill="#203540"/>`;
  return s;
}

/** A surfboard (plain colours, a stripe, a fin). */
export function surfboard(x, y, len, rot, body, stripe) {
  const w = len * 0.22;
  return `<g transform="translate(${r(x)} ${r(y)}) rotate(${rot})"><path d="M0 ${r(-len / 2)}C${r(w * 0.7)} ${r(-len * 0.3)} ${r(w / 2)} ${r(len * 0.35)} 0 ${r(len / 2)}C${r(-w / 2)} ${r(len * 0.35)} ${r(-w * 0.7)} ${r(-len * 0.3)} 0 ${r(-len / 2)}Z" fill="${body}"/><path d="M0 ${r(-len * 0.48)}V${r(len * 0.48)}" stroke="${stripe}" stroke-width="${r(w * 0.12)}"/><path d="M0 ${r(len * 0.36)}l${r(-w * 0.15)} ${r(len * 0.1)}h${r(w * 0.3)}z" fill="#1a1a1a"/></g>`;
}

/** A wooden clothes peg at (x, y), for garments pegged to a line. */
export const peg = (x, y, s = 1) =>
  `<g transform="translate(${r(x)} ${r(y)}) scale(${s})"><path d="M-5 -14h4l1 30h-4z" fill="#c79a62"/><path d="M1 -14h4l-1 30h-4z" fill="#b8884f"/><circle cx="0" cy="-2" r="3" fill="none" stroke="#9ea3a6" stroke-width="1.6"/></g>`;

/** A wire hanger hook above (x, y). */
export const hook = (x, y, s = 1) =>
  `<g transform="translate(${r(x)} ${r(y)}) scale(${s})"><path d="M0 0V-12C0 -16 8 -18 8 -26C8 -33 0 -36 -6 -30" fill="none" stroke="#9aa0a4" stroke-width="2.6" stroke-linecap="round"/></g>`;
