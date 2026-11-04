// Parametric garment drawings (units: mm). Each draw* returns { svg, bbox }
// where bbox = [x0, y0, x1, y1] of the drawn garment in its own space.
import { r, tone, mix, isDark, panel, stitch, rib, textPath, arcTextPath, hashString } from "./lib.mjs";

/* ───────────── geometry helpers ───────────── */

const P = (x, y) => [x, y];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const pt = (p) => `${r(p[0])} ${r(p[1])}`;
const mirror = (p) => [-p[0], p[1]];

/** Thin blurred wedge used for folds and drapes. */
function streak(a, b, w1, w2) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const p1 = [a[0] + nx * w1, a[1] + ny * w1];
  const p2 = [b[0] + nx * w2, b[1] + ny * w2];
  const p3 = [b[0] - nx * w2, b[1] - ny * w2];
  const p4 = [a[0] - nx * w1, a[1] - ny * w1];
  return `M${pt(p1)}L${pt(p2)}L${pt(p3)}L${pt(p4)}Z`;
}

/** Overlock zigzag along a polyline. */
function overlock(points, amp = 3.2, step = 3.4) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(2, Math.floor(len / step));
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const s = k % 2 ? amp : -amp;
      out.push([a[0] + (b[0] - a[0]) * t + nx * s, a[1] + (b[1] - a[1]) * t + ny * s]);
    }
  }
  return `M${out.map(pt).join("L")}`;
}

const bboxOf = (pts, pad = 0) => {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) + pad, Math.max(...ys) + pad];
};

/* ───────────── prints ───────────── */

function puff(d, ink, base) {
  // Puff print: raised ink with a light top edge and a soft drop.
  const dk = isDark(base);
  return `<path d="${d}" fill="#000" opacity="${dk ? 0.5 : 0.18}" transform="translate(1.6 2.4)"/>
<path d="${d}" fill="${ink}"/>
<path d="${d}" fill="#fff" opacity="0.18" transform="translate(-0.8 -1)" style="mix-blend-mode:screen"/>
<path d="${d}" fill="${ink}" transform="translate(0.4 0.6)" opacity="0.85"/>`;
}

const flat = (d, ink, op = 0.95) => `<path d="${d}" fill="${ink}" opacity="${op}"/>`;

function boltPath(cx, cy, s) {
  const pts = [
    [0.1, -1],
    [-0.45, 0.12],
    [-0.02, 0.12],
    [-0.22, 1],
    [0.48, -0.2],
    [0.04, -0.2],
    [0.3, -1],
  ].map(([x, y]) => [cx + x * s, cy + y * s]);
  return `M${pts.map(pt).join("L")}Z`;
}

function sparkPath(cx, cy, s) {
  let d = "";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const L = i % 2 ? s * 0.45 : s;
    d += streak([cx, cy], [cx + Math.cos(a) * L, cy + Math.sin(a) * L], s * 0.07, 0.4);
  }
  return d;
}

/** Sagging wire across width w centred at (cx, y), as a stroked path string. */
const wire = (cx, y, w, sag) => `M${r(cx - w / 2)} ${r(y)} Q${r(cx)} ${r(y + sag * 2)} ${r(cx + w / 2)} ${r(y)}`;

function print(kind, { cx, cy, w, base, accent, mirrored = false, ghost = false }) {
  const ink = accent;
  const g = (s) => (mirrored ? `<g transform="translate(${r(cx * 2)} 0) scale(-1 1)" opacity="${ghost ? 0.16 : 1}">${s}</g>` : ghost ? `<g opacity="0.16">${s}</g>` : s);
  switch (kind) {
    case "livewire-chest": {
      const t = textPath("LIVE WIRE", { size: w * 0.105, x: cx, y: cy, anchor: "middle", tracking: 0.02 });
      const wy = cy + w * 0.06;
      return g(`${puff(t.d, ink, base)}
<path d="${wire(cx - w * 0.02, wy, w * 0.62, w * 0.05)}" stroke="${ink}" stroke-width="${r(w * 0.012)}" fill="none" stroke-linecap="round"/>
<path d="${sparkPath(cx + w * 0.29, wy, w * 0.05)}" fill="#FF7A2E"/>
<circle cx="${r(cx - w * 0.33)}" cy="${r(wy)}" r="${r(w * 0.012)}" fill="${ink}"/>`);
    }
    case "livewire-back": {
      const t = textPath("LIVE WIRE", { size: w * 0.16, x: cx, y: cy - w * 0.12, anchor: "middle", tracking: 0.01 });
      const m = textPath("DROP 04 — 440V — WRNGSIDE", { font: "mono", size: w * 0.032, x: cx, y: cy + w * 0.36, anchor: "middle", tracking: 0.12, mirrorN: true });
      const y0 = cy + w * 0.02;
      const L = w * 0.82;
      let mini = "";
      [-0.26, 0, 0.26].forEach((u, i) => {
        const x = cx + u * L;
        const yy = y0 + (1 - (2 * u) ** 2) * w * 0.07 * 0.9;
        const s = w * 0.075;
        mini += `<path d="M${r(x - s)} ${r(yy)}L${r(x + s)} ${r(yy)}L${r(x + s * 0.9)} ${r(yy + s * (i === 1 ? 2.2 : 1.8))}L${r(x - s * 0.9)} ${r(yy + s * (i === 1 ? 2.2 : 1.8))}Z" fill="${ink}" opacity="${i === 1 ? 1 : 0.85}"/>`;
      });
      return g(`${puff(t.d, ink, base)}
<path d="${wire(cx, y0, L, w * 0.07)}" stroke="${ink}" stroke-width="${r(w * 0.01)}" fill="none"/>
${mini}${flat(m.d, ink)}`);
    }
    case "logo-chest": {
      const t = textPath("N", { size: w * 0.11, x: cx + w * 0.17, y: cy - w * 0.05, anchor: "middle", mirrorN: true });
      return g(flat(t.d, ink, 0.55));
    }
    case "noentry-chest": {
      const R = w * 0.2;
      const red = "#C8261B";
      const bar = `M${r(cx - R * 0.7)} ${r(cy - R * 0.2)}H${r(cx + R * 0.7)}V${r(cy + R * 0.2)}H${r(cx - R * 0.7)}Z`;
      const m = textPath("NO ENTRY", { font: "mono", size: w * 0.034, x: cx, y: cy + R + w * 0.07, anchor: "middle", tracking: 0.2 });
      return g(`<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(R)}" fill="${red}"/>
<path d="${bar}" fill="${tone(base, 0.05)}"/>
<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(R)}" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="2"/>
${flat(m.d, "#141414", 0.85)}`);
    }
    case "noentry-back": {
      const t1 = textPath("NO", { size: w * 0.2, x: cx, y: cy - w * 0.1, anchor: "middle" });
      const t2 = textPath("ENTRY", { size: w * 0.2, x: cx, y: cy + w * 0.12, anchor: "middle" });
      const m = textPath("WRONG SIDE ONLY →", { font: "mono", size: w * 0.04, x: cx, y: cy + w * 0.25, anchor: "middle", tracking: 0.14 });
      return g(`${flat(t1.d, "#C8261B")}${flat(t2.d, "#C8261B")}${flat(m.d, "#141414")}`);
    }
    case "oneway-sleeve": {
      const t = textPath("→", { font: "mono", size: w * 0.08, x: cx + w * 0.17, y: cy - w * 0.05, anchor: "middle" });
      return g(flat(t.d, ink));
    }
    case "oneway-back": {
      const t = textPath("ONE WAY", { size: w * 0.08, x: cx, y: cy - w * 0.28, anchor: "middle", tracking: 0.04 });
      const a = textPath("→", { font: "mono", size: w * 0.1, x: cx, y: cy - w * 0.15, anchor: "middle" });
      return g(`${flat(t.d, ink)}${flat(a.d, ink)}`);
    }
    case "jersey-front": {
      const t = textPath("440", { size: w * 0.24, x: cx, y: cy + w * 0.12, anchor: "middle" });
      const s = textPath("HIGH TENSION", { size: w * 0.045, x: cx, y: cy - w * 0.08, anchor: "middle", tracking: 0.06 });
      return g(`<path d="${t.d}" fill="none" stroke="#000" stroke-width="${r(w * 0.016)}" stroke-opacity="0.5"/>${flat(t.d, ink)}${flat(s.d, ink)}`);
    }
    case "jersey-back": {
      const n = textPath("WRNGSIDE", { size: w * 0.07, x: cx, y: cy - w * 0.22, anchor: "middle", tracking: 0.05, mirrorN: true });
      const t = textPath("04", { size: w * 0.32, x: cx, y: cy + w * 0.18, anchor: "middle" });
      return g(`${flat(n.d, ink)}<path d="${t.d}" fill="none" stroke="#000" stroke-width="${r(w * 0.016)}" stroke-opacity="0.5"/>${flat(t.d, ink)}`);
    }
    case "440v-front": {
      const t = textPath("440V", { size: w * 0.2, x: cx, y: cy, anchor: "middle", tracking: -0.01 });
      return g(`${puff(t.d, ink, base)}<path d="${boltPath(cx + w * 0.3, cy - w * 0.15, w * 0.05)}" fill="#FF7A2E"/>`);
    }
    case "440v-back": {
      const m = textPath("HANDLE WITH CARE", { font: "mono", size: w * 0.04, x: cx, y: cy + w * 0.3, anchor: "middle", tracking: 0.16 });
      return g(`<path d="${boltPath(cx, cy - w * 0.02, w * 0.26)}" fill="${ink}"/>${flat(m.d, ink)}`);
    }
    case "blackout-chest": {
      const t = textPath("BLACKOUT", { size: w * 0.055, x: cx - w * 0.17, y: cy - w * 0.08, anchor: "middle", tracking: 0.03 });
      return g(flat(t.d, "#2e2e2e", 1));
    }
    case "blackout-back": {
      const t = textPath("N", { size: w * 0.5, x: cx, y: cy + w * 0.16, anchor: "middle", mirrorN: true });
      return g(`<path d="${t.d}" fill="#2a2a2a"/><path d="${t.d}" fill="none" stroke="#000" stroke-opacity="0.4" stroke-width="2"/>`);
    }
    case "uturn-front": {
      const s = w * 0.12;
      const x = cx + w * 0.16;
      const y = cy - w * 0.08;
      return g(`<path d="M${r(x - s * 0.5)} ${r(y + s)}V${r(y)}A${r(s * 0.5)} ${r(s * 0.5)} 0 0 1 ${r(x + s * 0.5)} ${r(y)}V${r(y + s * 0.6)}" stroke="${ink}" stroke-width="${r(s * 0.22)}" fill="none"/>
<path d="M${r(x + s * 0.18)} ${r(y + s * 0.5)}L${r(x + s * 0.5)} ${r(y + s * 0.98)}L${r(x + s * 0.82)} ${r(y + s * 0.5)}Z" fill="${ink}"/>`);
    }
    case "uturn-back": {
      const t = textPath("U-TURN", { size: w * 0.15, x: cx, y: cy, anchor: "middle" });
      const m = textPath("WEAR IT WRONG", { font: "mono", size: w * 0.04, x: cx, y: cy + w * 0.1, anchor: "middle", tracking: 0.18 });
      return g(`${flat(t.d, ink)}${flat(m.d, ink)}`);
    }
    case "detour-chest": {
      const t = textPath("DETOUR", { font: "mono", size: w * 0.03, x: cx - w * 0.2, y: cy - w * 0.02, anchor: "middle", tracking: 0.1 });
      return g(flat(t.d, ink, 0.9));
    }
    case "detour-back": {
      const R = w * 0.22;
      const sign = `M${r(cx)} ${r(cy - R)}L${r(cx + R)} ${r(cy)}L${r(cx)} ${r(cy + R)}L${r(cx - R)} ${r(cy)}Z`;
      const t = textPath("DETOUR", { size: w * 0.06, x: cx, y: cy + w * 0.01, anchor: "middle" });
      const a = textPath("→", { font: "mono", size: w * 0.07, x: cx, y: cy + w * 0.09, anchor: "middle" });
      return g(`<path d="${sign}" fill="#E8B91D"/><path d="${sign}" fill="none" stroke="#141414" stroke-width="${r(w * 0.01)}" transform="translate(${r(cx * 0.06)} ${r(cy * 0.06)}) scale(0.94)"/>${flat(t.d, "#141414")}${flat(a.d, "#141414")}`);
    }
    case "lineman-chest": {
      const x = cx - w * 0.2;
      const y = cy - w * 0.12;
      const pw = w * 0.2;
      const ph = w * 0.075;
      const t = textPath("LINEMAN", { font: "mono", size: w * 0.028, x, y: y + ph * 0.64, anchor: "middle", tracking: 0.12 });
      return g(`<rect x="${r(x - pw / 2)}" y="${r(y)}" width="${r(pw)}" height="${r(ph)}" fill="#E9E1CF"/>
<rect x="${r(x - pw / 2 + 3)}" y="${r(y + 3)}" width="${r(pw - 6)}" height="${r(ph - 6)}" fill="none" stroke="#2A1E14" stroke-width="1.2" stroke-dasharray="3 2"/>${flat(t.d, "#2A1E14")}`);
    }
    case "lineman-back": {
      const d = arcTextPath("WRNGSIDE ELECTRICAL WORKS", { size: w * 0.052, cx, cy: cy + w * 0.32, radius: w * 0.42, tracking: 0.06, mirrorN: true });
      const t = textPath("440V", { size: w * 0.12, x: cx, y: cy + w * 0.12, anchor: "middle" });
      return g(`${flat(d, "#E9E1CF")}${flat(t.d, "#E9E1CF")}<path d="${boltPath(cx, cy + w * 0.24, w * 0.05)}" fill="#E9E1CF"/>`);
    }
    case "varsity-front": {
      const t = textPath("N", { size: w * 0.18, x: cx - w * 0.19, y: cy, anchor: "middle", mirrorN: true });
      return g(`<path d="${t.d}" fill="none" stroke="#7a2222" stroke-width="${r(w * 0.03)}" stroke-linejoin="round"/>
<path d="${t.d}" fill="none" stroke="#E6DFD0" stroke-width="${r(w * 0.016)}" stroke-linejoin="round"/>${flat(t.d, "#E6DFD0", 1)}
<path d="${t.d}" fill="#000" opacity="0.12" filter="url(#gb4)"/>`);
    }
    case "varsity-back": {
      const d = arcTextPath("WRONG WAY", { size: w * 0.11, cx, cy: cy + w * 0.5, radius: w * 0.62, tracking: 0.02 });
      const t = textPath("N", { size: w * 0.24, x: cx, y: cy + w * 0.2, anchor: "middle", mirrorN: true });
      return g(`<path d="${d}" fill="none" stroke="#7a2222" stroke-width="${r(w * 0.02)}" stroke-linejoin="round"/>${flat(d, "#E6DFD0", 1)}
<path d="${t.d}" fill="none" stroke="#7a2222" stroke-width="${r(w * 0.03)}" stroke-linejoin="round"/>${flat(t.d, "#E6DFD0", 1)}`);
    }
    default:
      return "";
  }
}

/* ───────────── TEE / LONG SLEEVE / JERSEY ───────────── */

function teeGeometry(p, pose) {
  const long = p.kind === "longsleeve";
  const jersey = p.kind === "jersey";
  const bw = jersey ? 262 : 272;
  const len = p.handle === "no-entry-boxy-tee" ? 690 : jersey ? 720 : 735;
  const hang = pose === "hang";
  const theta = ((long ? (hang ? 80 : 58) : hang ? 62 : 24) * Math.PI) / 180;
  const sl = long ? 590 : jersey ? 235 : 228;
  const so = long ? 130 : jersey ? 195 : 205;
  const armhole = 255;
  const SP = P(-bw, 14);
  const dir = P(-Math.cos(theta), Math.sin(theta));
  const nrm = P(Math.sin(theta), Math.cos(theta));
  const T = add(SP, mul(dir, sl));
  const U = add(T, mul(nrm, so));
  const A = P(-bw - 2, 14 + armhole);
  return { bw, len, SP, T, U, A, long, jersey, theta, so, dir, nrm };
}

function drawTee(p, col, view, pose) {
  const g = teeGeometry(p, pose);
  const { bw, len, SP, T, U, A, long, jersey } = g;
  const base = view === "inside" ? col.reverse || tone(col.hex, 0.1) : col.hex;
  const trim = jersey ? col.accent : tone(base, isDark(base) ? 0.04 : -0.04);
  const pre = "g";
  const neckW = jersey ? 105 : 98;
  const neckD = view === "back" ? 22 : jersey ? 160 : 88;

  const body = `M${-neckW} 0 Q0 ${view === "back" ? 26 : 22} ${neckW} 0 L${-SP[0]} ${SP[1]} L${-A[0]} ${A[1]} Q${bw + 6} 500 ${bw + 8} ${len} Q0 ${len + 12} ${-bw - 8} ${len} Q${-bw - 6} 500 ${A[0]} ${A[1]} L${SP[0]} ${SP[1]} Z`;
  const sleeve = (m) => {
    const f = m ? mirror : (x) => x;
    const sp = f(SP);
    const t = f(T);
    const u = f(U);
    const a = f(A);
    const c1 = f(lerp(SP, T, 0.5));
    const hemMid = f(add(lerp(T, U, 0.5), mul(g.dir, 6)));
    const ua = f(add(lerp(U, A, 0.5), P(m ? -8 : 8, -6)));
    return `M${pt(sp)} Q${pt(add(c1, P(0, -4)))} ${pt(t)} Q${pt(hemMid)} ${pt(u)} Q${pt(ua)} ${pt(a)} Z`;
  };
  const sL = sleeve(false);
  const sR = sleeve(true);
  const bbox = bboxOf([T, U, mirror(T), mirror(U), P(-bw - 8, len + 12), P(bw + 8, -4)], 2);

  // Folds: hanging garments drape from the pegs into a V; flat ones relax.
  const pegX = 0.3 * (bbox[2] - bbox[0]);
  const hangFolds =
    pose === "hang"
      ? [
          streak(P(-pegX, 8), P(-60, 360), 16, 5),
          streak(P(pegX, 8), P(70, 380), 16, 5),
          `M${-bw + 20} 70 Q0 190 ${bw - 20} 70 Q0 160 ${-bw + 20} 70Z`,
          streak(P(-150, 330), P(-170, len - 20), 6, 18),
          streak(P(110, 360), P(130, len - 10), 5, 16),
          streak(P(-30, 520), P(-20, len), 4, 12),
        ]
      : [streak(P(-180, 300), P(-200, len - 20), 4, 14), streak(P(150, 330), P(170, len - 30), 3, 12), `M${-bw + 10} ${A[1] - 30} Q${-bw + 70} ${A[1] + 20} ${-bw + 12} ${A[1] + 80}Z`];
  const hangLights =
    pose === "hang"
      ? [streak(P(-pegX + 30, 20), P(-20, 300), 10, 3), streak(P(pegX - 30, 20), P(25, 320), 10, 3), streak(P(-90, 360), P(-100, len - 40), 5, 10)]
      : [streak(P(-60, 120), P(-70, len - 60), 5, 14), streak(P(90, 200), P(100, len - 80), 4, 10)];

  let svg = "";
  const sleeveFolds = (m) => {
    const f = m ? mirror : (x) => x;
    return [streak(f(lerp(SP, A, 0.5)), f(lerp(T, U, 0.6)), 4, 8)];
  };
  // Body.
  svg += panel("tb", body, base, { prefix: pre, folds: hangFolds, lights: hangLights, bbox });
  // Neck opening (inside of the back neck) on front & inside views.
  if (view !== "back") {
    const neck = `M${-neckW} 0 Q${-neckW * 0.9} ${neckD * 0.9} 0 ${neckD} Q${neckW * 0.9} ${neckD * 0.9} ${neckW} 0 Q0 22 ${-neckW} 0Z`;
    const inner = view === "inside" ? col.hex : tone(base, isDark(base) ? 0.06 : -0.12);
    svg += `<path d="${neck}" fill="${inner}"/>`;
    svg += `<path d="${neck}" fill="#000" opacity="${isDark(base) ? 0.45 : 0.22}"/>`;
    // Neck label.
    svg += `<rect x="-26" y="8" width="52" height="30" fill="#0f0f0f"/><path d="${textPath("N", { size: 16, x: 0, y: 30, anchor: "middle", mirrorN: true }).d}" fill="#EEEAE3"/>`;
    // Collar rib along the front neckline.
    const collar = jersey
      ? `M${-neckW + 4} 4 L0 ${neckD - 12} L${neckW - 4} 4`
      : `M${-neckW + 6} 6 Q${-neckW * 0.86} ${neckD * 0.82} 0 ${neckD - 10} Q${neckW * 0.86} ${neckD * 0.82} ${neckW - 6} 6`;
    svg += `<path d="${collar}" fill="none" stroke="${trim}" stroke-width="22" stroke-linejoin="round"/>
<path d="${collar}" fill="none" stroke="#000" stroke-opacity="${isDark(trim) ? 0.55 : 0.2}" stroke-width="20" stroke-dasharray="1.3 3"/>
${stitch(collar.replace(/(-?\d+(\.\d+)?) (-?\d+(\.\d+)?)/g, (m0, a, _b, c) => `${a} ${Number(c) + 13}`), "#000", 0.3)}`;
  } else {
    const collar = `M${-neckW + 4} 6 Q0 32 ${neckW - 4} 6`;
    svg += `<path d="${collar}" fill="none" stroke="${trim}" stroke-width="20"/>
<path d="${collar}" fill="none" stroke="#000" stroke-opacity="${isDark(trim) ? 0.5 : 0.18}" stroke-width="18" stroke-dasharray="1.3 3"/>`;
  }
  // Prints (body).
  const printKind = view === "back" ? p.prints.back : p.prints.front;
  const chestW = bw * 2;
  if (printKind !== "none" && printKind !== "oneway-sleeve") {
    const cy = view === "back" ? 300 : printKind.includes("chest") || printKind === "logo-chest" ? 230 : 280;
    if (view === "inside") {
      svg += print(p.prints.front, { cx: 0, cy: printKind === "livewire-chest" ? 230 : 280, w: chestW, base, accent: col.accent, mirrored: true, ghost: true });
    } else {
      svg += print(printKind, { cx: 0, cy, w: chestW, base, accent: col.accent });
    }
  }
  if (view === "front" && p.prints.front === "oneway-sleeve") svg += print("oneway-sleeve", { cx: 0, cy: 230, w: chestW, base, accent: col.accent });
  // Jersey mesh dots.
  if (jersey) {
    svg += `<defs><pattern id="mesh" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="1.4" fill="#000" opacity="0.45"/></pattern><clipPath id="meshc"><path d="${body}"/></clipPath></defs><rect x="${bbox[0]}" y="${bbox[1]}" width="${bbox[2] - bbox[0]}" height="${bbox[3] - bbox[1]}" fill="url(#mesh)" clip-path="url(#meshc)" opacity="0.6"/>`;
  }
  // Hem stitching.
  svg += stitch(`M${-bw + 4} ${len - 22} Q0 ${len - 10} ${bw - 4} ${len - 22}`, isDark(base) ? "#fff" : "#000", isDark(base) ? 0.16 : 0.28);
  svg += stitch(`M${-bw + 4} ${len - 28} Q0 ${len - 16} ${bw - 4} ${len - 28}`, isDark(base) ? "#fff" : "#000", isDark(base) ? 0.12 : 0.2);
  // Inside view: overlock side seams + care label.
  if (view === "inside") {
    const thread = mix(base, "#ffffff", 0.45);
    svg += `<path d="${overlock([P(-bw + 6, A[1] + 10), P(-bw + 10, len - 30)])}" stroke="${thread}" stroke-width="1.4" fill="none" opacity="0.9"/>`;
    svg += `<path d="${overlock([P(bw - 6, A[1] + 10), P(bw - 10, len - 30)])}" stroke="${thread}" stroke-width="1.4" fill="none" opacity="0.9"/>`;
    svg += `<path d="M${-neckW} 0 L${SP[0] + 4} ${SP[1] + 2}" stroke="${thread}" stroke-width="7" opacity="0.5"/>`;
    svg += `<path d="M${neckW} 0 L${-SP[0] - 4} ${SP[1] + 2}" stroke="${thread}" stroke-width="7" opacity="0.5"/>`;
    svg += `<rect x="${-bw + 18}" y="${len - 230}" width="44" height="120" fill="#F4F1EA"/>`;
    for (let i = 0; i < 8; i++) svg += `<rect x="${-bw + 24}" y="${len - 220 + i * 13}" width="${i % 3 === 0 ? 26 : 32}" height="3" fill="#8C8984"/>`;
    svg += `<rect x="-60" y="${len - 70}" width="120" height="34" fill="#0f0f0f"/><path d="${textPath("WRNGSIDE", { size: 14, x: 0, y: len - 47, anchor: "middle", mirrorN: true, tracking: 0.05 }).d}" fill="#EEEAE3"/>`;
  }
  // Sleeves on top.
  [false, true].forEach((m) => {
    const d = m ? sR : sL;
    svg += `<path d="${d}" fill="#000" opacity="0.18" transform="translate(${m ? -4 : 4} 6)" filter="url(#gb10)"/>`;
    svg += panel(m ? "tsR" : "tsL", d, jersey ? tone(base, -0.12) : base, { prefix: pre, folds: sleeveFolds(m), bbox, light: 0.04 });
    const f = m ? mirror : (x) => x;
    const t = f(T);
    const u = f(U);
    const inset = (k) => [lerp(t, f(SP), k), lerp(u, f(A), k)];
    const [a1, b1] = inset(long ? 0.12 : 0.11);
    if (long) {
      const cuff = `M${pt(t)}L${pt(u)}L${pt(b1)}L${pt(a1)}Z`;
      svg += `<path d="${cuff}" fill="${trim}"/><path d="M${pt(lerp(t, a1, 0.5))}L${pt(lerp(u, b1, 0.5))}" stroke="#000" stroke-opacity="0.35" stroke-width="${r(Math.hypot(a1[0] - t[0], a1[1] - t[1]))}" stroke-dasharray="1.3 3"/>`;
    } else if (jersey) {
      svg += `<path d="M${pt(lerp(t, a1, 0.4))}L${pt(lerp(u, b1, 0.4))}" stroke="${col.accent}" stroke-width="14"/>`;
    } else {
      svg += stitch(`M${pt(a1)}L${pt(b1)}`, isDark(base) ? "#fff" : "#000", isDark(base) ? 0.16 : 0.28);
    }
    // Drop-shoulder seam.
    svg += stitch(`M${pt(f(SP))}L${pt(f(A))}`, "#000", isDark(base) ? 0.5 : 0.22, 1.2, "4 3");
    if (view === "front" && p.prints.front === "oneway-sleeve" && !m) {
      const mid = lerp(lerp(SP, A, 0.5), lerp(T, U, 0.5), 0.55);
      const ang = (Math.atan2(g.dir[1], g.dir[0]) * 180) / Math.PI;
      const txt = textPath("ONE WAY →", { size: 34, x: 0, y: 12, anchor: "middle", tracking: 0.04 });
      svg += `<g transform="translate(${pt(mid)}) rotate(${r(ang + 180)})"><path d="${txt.d}" fill="${col.accent}"/></g>`;
    }
  });
  return { svg, bbox, pegs: [-pegX, pegX] };
}

/* ───────────── HOODIE / ZIP ───────────── */

function drawHoodie(p, col, view, pose) {
  const zip = p.kind === "ziphoodie";
  const reversible = p.handle.startsWith("u-turn");
  const base = view === "inside" ? col.reverse || tone(col.hex, 0.1) : col.hex;
  const lining = reversible ? (view === "inside" ? col.hex : col.reverse) : tone(base, isDark(base) ? 0.05 : -0.1);
  const pre = "g";
  const bw = 285;
  const len = 690;
  const hang = pose === "hang";
  const theta = ((hang ? 84 : 66) * Math.PI) / 180;
  const sl = 600;
  const SP = P(-bw, 34);
  const dir = P(-Math.cos(theta), Math.sin(theta));
  const nrm = P(Math.sin(theta), Math.cos(theta));
  const cuffW = 112;
  const T = add(SP, mul(dir, sl));
  const U = add(T, mul(nrm, cuffW));
  const A = P(-bw - 2, 34 + 270);
  const wb = 72; // waistband height

  const body = `M-120 6 Q0 30 120 6 L${-SP[0]} ${SP[1]} L${-A[0]} ${A[1]} L${bw + 2} ${len} L${-bw - 2} ${len} L${A[0]} ${A[1]} L${SP[0]} ${SP[1]} Z`;
  const bbox = bboxOf([T, U, mirror(T), mirror(U), P(-bw, len + wb), P(0, hang ? -70 : -170)], 4);
  let svg = "";
  // Hood behind.
  if (view === "back") {
    const hood = hang
      ? `M-170 40 Q-190 -60 -60 -66 Q0 -70 60 -66 Q190 -60 170 40 Q170 330 0 360 Q-170 330 -170 40Z`
      : `M-175 60 Q-200 -150 0 -168 Q200 -150 175 60Z`;
    svg += panel("hb", hood, tone(base, -0.02), { prefix: pre, folds: [streak(P(0, -60), P(0, 300), 4, 10)], bbox });
  } else {
    const hood = hang
      ? `M-165 60 Q-185 -50 -40 -64 Q0 -68 40 -64 Q185 -50 165 60Z`
      : `M-178 70 Q-205 -150 0 -168 Q205 -150 178 70Z`;
    svg += panel("hh", hood, tone(base, -0.06), { prefix: pre, bbox });
    const innerHood = hang ? `M-120 50 Q-120 -28 0 -36 Q120 -28 120 50Z` : `M-128 70 Q-140 -110 0 -122 Q140 -110 128 70Z`;
    svg += `<path d="${innerHood}" fill="${lining}"/><path d="${innerHood}" fill="#000" opacity="0.38"/>`;
  }
  // Body.
  svg += panel("hbody", body, base, {
    prefix: pre,
    bbox,
    folds: hang
      ? [streak(P(-200, 120), P(-170, len - 10), 6, 20), streak(P(190, 140), P(160, len - 20), 6, 18), streak(P(-20, 380), P(-10, len - 10), 3, 9)]
      : [streak(P(-200, 200), P(-210, len - 20), 4, 12), streak(P(170, 260), P(180, len - 40), 4, 10)],
    lights: [streak(P(-100, 100), P(-90, len - 60), 6, 12), streak(P(80, 110), P(90, len - 80), 5, 10)],
  });
  // Waistband.
  const wbPath = `M${-bw - 2} ${len} L${bw + 2} ${len} L${bw - 6} ${len + wb} Q0 ${len + wb + 6} ${-bw + 6} ${len + wb} Z`;
  svg += rib("hwb", wbPath, base, { bbox: [-bw - 4, len, bw + 4, len + wb + 8], step: 6 });
  if (view !== "back") {
    // Kangaroo pocket (split if zip).
    if (zip) {
      [-1, 1].forEach((s) => {
        const pk = `M${s * 14} ${len - 250} L${s * 170} ${len - 250} L${s * 205} ${len - 70} L${s * 14} ${len - 70}Z`;
        svg += `<path d="${pk}" fill="${base}"/><path d="${pk}" fill="#000" opacity="0.08"/>`;
        svg += stitch(`M${s * 20} ${len - 244} L${s * 168} ${len - 244} L${s * 199} ${len - 76}`, "#000", 0.35);
        svg += `<path d="M${s * 170} ${len - 250} L${s * 205} ${len - 70}" stroke="#000" stroke-opacity="0.5" stroke-width="3"/>`;
      });
    } else {
      const pk = `M-200 ${len - 70} L-160 ${len - 250} L160 ${len - 250} L200 ${len - 70} Z`;
      svg += `<path d="${pk}" fill="#000" opacity="0.14" transform="translate(0 6)" filter="url(#gb4)"/><path d="${pk}" fill="${base}"/>`;
      svg += `<path d="${pk}" fill="url(#hbodyv)" opacity="0.9"/>`;
      svg += `<path d="M-160 ${len - 250} L-200 ${len - 70}M160 ${len - 250} L200 ${len - 70}" stroke="#000" stroke-opacity="${isDark(base) ? 0.7 : 0.3}" stroke-width="3"/>`;
      svg += stitch(`M-154 ${len - 244} L154 ${len - 244}`, isDark(base) ? "#fff" : "#000", isDark(base) ? 0.14 : 0.3);
    }
    // Neckline: crossover hood edges.
    const neck = `M-120 6 Q-60 120 0 150 Q60 120 120 6`;
    svg += `<path d="${neck}" fill="none" stroke="${tone(base, isDark(base) ? 0.07 : -0.08)}" stroke-width="30" stroke-linecap="round"/>`;
    svg += `<path d="${neck}" fill="none" stroke="#000" stroke-opacity="0.25" stroke-width="2" transform="translate(0 15)"/>`;
    if (zip) {
      svg += `<path d="M0 150 L0 ${len + wb - 4}" stroke="#2a2a2a" stroke-width="12"/><path d="M0 150 L0 ${len + wb - 4}" stroke="#777" stroke-width="10" stroke-dasharray="2 2.4"/>`;
      svg += `<rect x="-7" y="200" width="14" height="40" rx="3" fill="#9a9a9a"/><rect x="-4" y="236" width="8" height="34" rx="3" fill="#6a6a6a"/>`;
    } else {
      // Drawcords with metal aglets.
      [-1, 1].forEach((s) => {
        const x0 = s * 46;
        const x1 = s * (hang ? 52 : 70);
        svg += `<circle cx="${x0}" cy="108" r="7" fill="#0e0e0e" stroke="#888" stroke-width="2.5"/>`;
        svg += `<path d="M${x0} 108 Q${x0 + s * 6} 220 ${x1} 330" stroke="${isDark(base) ? "#d9d4c9" : "#1a1a1a"}" stroke-width="9" fill="none" stroke-linecap="round"/>`;
        svg += `<rect x="${x1 - 5}" y="326" width="10" height="26" rx="2" fill="#a8a8a8"/>`;
      });
    }
    if (view === "front") svg += print(p.prints.front, { cx: 0, cy: 270, w: bw * 2, base, accent: col.accent });
    if (view === "inside") {
      svg += print(p.prints.front, { cx: 0, cy: 270, w: bw * 2, base, accent: col.accent, mirrored: true, ghost: true });
      const thread = mix(base, "#ffffff", 0.4);
      svg += `<path d="${overlock([P(-bw + 6, A[1] + 10), P(-bw + 6, len - 8)])}" stroke="${thread}" stroke-width="1.5" fill="none"/>`;
      svg += `<path d="${overlock([P(bw - 6, A[1] + 10), P(bw - 6, len - 8)])}" stroke="${thread}" stroke-width="1.5" fill="none"/>`;
      svg += `<rect x="${-bw + 20}" y="${len - 240}" width="46" height="124" fill="#F4F1EA"/>`;
      for (let i = 0; i < 8; i++) svg += `<rect x="${-bw + 26}" y="${len - 230 + i * 13}" width="${i % 3 === 0 ? 26 : 34}" height="3" fill="#8C8984"/>`;
    }
  } else {
    svg += print(p.prints.back, { cx: 0, cy: 300, w: bw * 2, base, accent: col.accent });
  }
  // Sleeves.
  [false, true].forEach((m) => {
    const f = m ? mirror : (x) => x;
    const sp = f(SP);
    const t = f(T);
    const u = f(U);
    const a = f(A);
    const d = `M${pt(sp)} Q${pt(f(add(lerp(SP, T, 0.5), P(-10, 0))))} ${pt(t)} L${pt(u)} Q${pt(f(add(lerp(U, A, 0.5), P(18, 0))))} ${pt(a)} Z`;
    svg += `<path d="${d}" fill="#000" opacity="0.2" transform="translate(${m ? -5 : 5} 6)" filter="url(#gb10)"/>`;
    svg += panel(m ? "hsR" : "hsL", d, base, { prefix: pre, bbox, folds: [streak(f(lerp(SP, A, 0.6)), f(lerp(T, U, 0.5)), 5, 9), streak(f(add(lerp(SP, T, 0.6), P(30, 0))), f(add(lerp(T, U, 0.2), P(0, -90))), 3, 6)] });
    const cuffTop = [lerp(t, sp, 0.14), lerp(u, a, 0.14)];
    const cuff = `M${pt(t)} L${pt(u)} L${pt(cuffTop[1])} L${pt(cuffTop[0])} Z`;
    svg += rib(`hc${m ? "R" : "L"}`, cuff, base, { bbox: bboxOf([t, u, ...cuffTop]), step: 6 });
    svg += stitch(`M${pt(sp)}L${pt(a)}`, "#000", isDark(base) ? 0.5 : 0.24);
  });
  return { svg, bbox };
}

/* ───────────── JACKET / VARSITY / OVERSHIRT ───────────── */

function drawJacket(p, col, view, pose) {
  const kind = p.kind;
  const varsity = kind === "varsity";
  const shirt = kind === "overshirt";
  const base = view === "inside" ? col.reverse || tone(col.hex, 0.1) : col.hex;
  const sleeveCol = varsity && view !== "inside" ? col.accent : base;
  const pre = "g";
  const bw = shirt ? 270 : 290;
  const len = shirt ? 780 : varsity ? 660 : 720;
  const hang = pose === "hang";
  const theta = ((hang ? 84 : 64) * Math.PI) / 180;
  const sl = shirt ? 620 : 610;
  const SP = P(-bw, 30);
  const dir = P(-Math.cos(theta), Math.sin(theta));
  const nrm = P(Math.sin(theta), Math.cos(theta));
  const cuffW = varsity ? 110 : 125;
  const T = add(SP, mul(dir, sl));
  const U = add(T, mul(nrm, cuffW));
  const A = P(-bw - 2, 30 + 280);
  const hemExtra = varsity ? 60 : 0;
  const shirtTail = shirt ? 30 : 0;
  const body = shirt
    ? `M-95 0 Q0 18 95 0 L${-SP[0]} ${SP[1]} L${-A[0]} ${A[1]} L${bw + 4} ${len - 40} Q${bw} ${len} ${bw - 40} ${len} Q0 ${len + shirtTail} ${-bw + 40} ${len} Q${-bw} ${len} ${-bw - 4} ${len - 40} L${A[0]} ${A[1]} L${SP[0]} ${SP[1]} Z`
    : `M-100 0 Q0 18 100 0 L${-SP[0]} ${SP[1]} L${-A[0]} ${A[1]} L${bw + 4} ${len} L${-bw - 4} ${len} L${A[0]} ${A[1]} L${SP[0]} ${SP[1]} Z`;
  const bbox = bboxOf([T, U, mirror(T), mirror(U), P(-bw - 6, len + hemExtra + shirtTail), P(0, -10)], 4);
  let svg = "";
  // Canvas / twill texture lines.
  const twill = (clipId, d) => {
    let lines = "";
    for (let x = bbox[0] - 800; x < bbox[2]; x += 7) lines += `M${x} ${bbox[1]}l${bbox[3] - bbox[1]} ${bbox[3] - bbox[1]}`;
    return `<defs><clipPath id="${clipId}"><path d="${d}"/></clipPath></defs><path d="${lines}" clip-path="url(#${clipId})" stroke="${isDark(base) ? "#fff" : "#000"}" stroke-opacity="${isDark(base) ? 0.04 : 0.06}" stroke-width="1.2"/>`;
  };
  svg += panel("jb", body, base, {
    prefix: pre,
    bbox,
    folds: hang ? [streak(P(-190, 120), P(-170, len - 10), 6, 18), streak(P(200, 140), P(170, len - 20), 6, 16)] : [streak(P(-200, 220), P(-210, len - 20), 4, 12)],
    lights: [streak(P(-110, 80), P(-100, len - 60), 6, 14)],
  });
  if (!varsity) svg += twill("jtw", body);
  if (view === "back") {
    svg += stitch(`M${-bw + 10} 160 Q0 175 ${bw - 10} 160`, "#000", 0.3);
    svg += print(p.prints.back, { cx: 0, cy: 300, w: bw * 2, base, accent: col.accent });
    if (varsity) {
      const hem = `M${-bw - 4} ${len} L${bw + 4} ${len} L${bw - 2} ${len + hemExtra} L${-bw + 2} ${len + hemExtra} Z`;
      svg += rib("vhem", hem, base, { bbox: [-bw - 6, len, bw + 6, len + hemExtra], step: 6 });
      svg += `<path d="M${-bw} ${len + 20}H${bw}M${-bw} ${len + 36}H${bw}" stroke="${col.accent}" stroke-width="7"/>`;
    }
    // Collar from behind.
    svg += `<path d="M-110 0 Q0 30 110 0 L110 -6 Q0 22 -110 -6Z" fill="${varsity ? tone(base, -0.1) : shirt ? base : "#3A2A1C"}"/>`;
  } else {
    // Front placket.
    if (!varsity) {
      svg += `<path d="M-20 70 L-20 ${len + shirtTail - 4} L20 ${len + shirtTail - 4} L20 70Z" fill="#000" opacity="0.08"/>`;
      svg += stitch(`M-16 70 L-16 ${len + shirtTail - 8}`, "#000", 0.35);
      svg += `<path d="M0 60 L0 ${len + shirtTail - 2}" stroke="#000" stroke-opacity="0.45" stroke-width="2"/>`;
      const n = shirt ? 7 : 5;
      for (let i = 0; i < n; i++) {
        const y = 110 + i * ((len - 160) / (n - 1));
        svg += `<circle cx="0" cy="${r(y)}" r="${shirt ? 9 : 12}" fill="${shirt ? "#2c2116" : "#6b5a44"}"/><circle cx="0" cy="${r(y)}" r="${shirt ? 9 : 12}" fill="none" stroke="#000" stroke-opacity="0.4" stroke-width="2"/>`;
        if (!shirt) svg += `<circle cx="-3" cy="${r(y - 3)}" r="3" fill="#fff" opacity="0.35"/>`;
      }
    } else {
      // Varsity snaps.
      svg += `<path d="M0 40 L0 ${len}" stroke="#000" stroke-opacity="0.5" stroke-width="2.5"/>`;
      for (let i = 0; i < 5; i++) {
        const y = 110 + i * 120;
        svg += `<circle cx="0" cy="${y}" r="15" fill="#c9c4b8"/><circle cx="0" cy="${y}" r="9" fill="#8f8a80"/><circle cx="-4" cy="${y - 4}" r="4" fill="#fff" opacity="0.6"/>`;
      }
    }
    // Pockets.
    if (shirt) {
      [-1, 1].forEach((s) => {
        const x = s * 140;
        svg += `<path d="M${x - 70} 200 L${x + 70} 200 L${x + 70} 340 L${x} 356 L${x - 70} 340Z" fill="${base}"/><path d="M${x - 70} 200 L${x + 70} 200 L${x + 70} 340 L${x} 356 L${x - 70} 340Z" fill="#000" opacity="0.07"/>`;
        svg += stitch(`M${x - 64} 206 L${x - 64} 336 L${x} 350 L${x + 64} 336 L${x + 64} 206`, "#000", 0.35);
        svg += `<path d="M${x - 74} 196 L${x + 74} 196 L${x + 74} 236 L${x} 250 L${x - 74} 236Z" fill="${tone(base, -0.05)}"/><circle cx="${x}" cy="236" r="8" fill="#2c2116"/>`;
      });
    } else if (!varsity) {
      [-1, 1].forEach((s) => {
        const x = s * 150;
        // Chest flap pocket.
        svg += `<rect x="${x - 70}" y="190" width="140" height="150" fill="${base}"/><rect x="${x - 70}" y="190" width="140" height="150" fill="#000" opacity="0.06"/>`;
        svg += `<path d="M${x - 76} 184 H${x + 76} V228 L${x} 240 L${x - 76} 228Z" fill="${tone(base, -0.06)}"/>`;
        svg += stitch(`M${x - 64} 196 V334 H${x + 64} V196`, "#000", 0.35);
        // Lower patch pocket.
        svg += `<rect x="${x - 88}" y="${len - 280}" width="176" height="200" fill="#000" opacity="0.07"/>`;
        svg += stitch(`M${x - 82} ${len - 274} V${len - 86} H${x + 82} V${len - 274}`, "#000", 0.35);
        svg += `<path d="M${x - 88} ${len - 280} H${x + 88}" stroke="#000" stroke-opacity="0.4" stroke-width="2.5"/>`;
      });
      svg += `<rect x="${-150 - 6}" y="${len - 300}" width="12" height="60" fill="${tone(base, -0.15)}"/>`;
    } else {
      // Varsity hem & collar ribs.
      const hem = `M${-bw - 4} ${len} L${bw + 4} ${len} L${bw - 2} ${len + hemExtra} L${-bw + 2} ${len + hemExtra} Z`;
      svg += rib("vhem", hem, base, { bbox: [-bw - 6, len, bw + 6, len + hemExtra], step: 6 });
      svg += `<path d="M${-bw} ${len + 20}H${bw}M${-bw} ${len + 36}H${bw}" stroke="${col.accent}" stroke-width="7"/>`;
      // Welt pockets.
      [-1, 1].forEach((s) => {
        svg += `<path d="M${s * 150} ${len - 260} L${s * 190} ${len - 90}" stroke="${col.accent}" stroke-width="18" stroke-linecap="round"/>`;
      });
    }
    svg += print(p.prints.front, { cx: 0, cy: 280, w: bw * 2, base, accent: col.accent });
    // Collar.
    if (varsity) {
      const collar = `M-104 4 Q-90 70 0 92 Q90 70 104 4`;
      svg += `<path d="${collar}" fill="none" stroke="${base}" stroke-width="40"/><path d="${collar}" fill="none" stroke="#000" stroke-opacity="0.45" stroke-width="38" stroke-dasharray="1.4 3.2"/>`;
      svg += `<path d="${collar}" fill="none" stroke="${col.accent}" stroke-width="5" transform="translate(0 8)"/><path d="${collar}" fill="none" stroke="${col.accent}" stroke-width="5" transform="translate(0 -6)"/>`;
    } else {
      const cc = shirt ? tone(base, -0.04) : "#3A2A1C";
      [-1, 1].forEach((s) => {
        const c = `M${s * 8} 40 L${s * 104} -2 L${s * 150} 20 L${s * 80} 180 Z`;
        svg += `<path d="${c}" fill="#000" opacity="0.25" transform="translate(${s * 4} 8)" filter="url(#gb4)"/>`;
        svg += `<path d="${c}" fill="${cc}"/>`;
        if (!shirt) {
          let lines = "";
          for (let i = 0; i < 12; i++) lines += `M${s * (20 + i * 10)} ${40 - i * 2}L${s * (60 + i * 8)} ${180 - i * 12}`;
          svg += `<path d="${lines}" stroke="#000" stroke-opacity="0.25" stroke-width="2.5"/>`;
        }
        svg += stitch(`M${s * 18} 42 L${s * 104} 8 L${s * 140} 24 L${s * 80} 168`, isDark(cc) ? "#fff" : "#000", 0.22);
      });
    }
    if (view === "inside") {
      // Quilted lining.
      let q = "";
      for (let i = -12; i < 24; i++) q += `M${-bw + i * 50} 40 l${len} ${len}M${bw - i * 50} 40 l${-len} ${len}`;
      svg += `<defs><clipPath id="jq"><path d="${body}"/></clipPath></defs><path d="${q}" clip-path="url(#jq)" stroke="#000" stroke-opacity="0.18" stroke-width="2"/>`;
      svg += `<rect x="-70" y="60" width="140" height="44" fill="#0f0f0f"/><path d="${textPath("WRNGSIDE", { size: 18, x: 0, y: 90, anchor: "middle", mirrorN: true, tracking: 0.05 }).d}" fill="#EEEAE3"/>`;
      svg += `<rect x="${-bw + 24}" y="${len - 260}" width="50" height="130" fill="#F4F1EA"/>`;
    }
  }
  // Sleeves.
  [false, true].forEach((m) => {
    const f = m ? mirror : (x) => x;
    const sp = f(SP);
    const t = f(T);
    const u = f(U);
    const a = f(A);
    const d = `M${pt(sp)} Q${pt(f(add(lerp(SP, T, 0.5), P(-10, 0))))} ${pt(t)} L${pt(u)} Q${pt(f(add(lerp(U, A, 0.5), P(18, 0))))} ${pt(a)} Z`;
    svg += `<path d="${d}" fill="#000" opacity="0.22" transform="translate(${m ? -5 : 5} 6)" filter="url(#gb10)"/>`;
    svg += panel(m ? "jsR" : "jsL", d, sleeveCol, { prefix: pre, bbox, folds: [streak(f(lerp(SP, A, 0.6)), f(lerp(T, U, 0.5)), 5, 9)] });
    const cuffTop = [lerp(t, sp, varsity ? 0.12 : 0.1), lerp(u, a, varsity ? 0.12 : 0.1)];
    const cuff = `M${pt(t)} L${pt(u)} L${pt(cuffTop[1])} L${pt(cuffTop[0])} Z`;
    if (varsity) {
      svg += rib(`vc${m ? "R" : "L"}`, cuff, base, { bbox: bboxOf([t, u, ...cuffTop]), step: 6 });
    } else {
      svg += `<path d="${cuff}" fill="${tone(sleeveCol, -0.05)}"/>`;
      svg += stitch(`M${pt(cuffTop[0])}L${pt(cuffTop[1])}`, "#000", 0.35);
    }
    svg += stitch(`M${pt(sp)}L${pt(a)}`, "#000", 0.3);
  });
  return { svg, bbox };
}

/* ───────────── BOTTOMS (folded over the wire) ───────────── */

function drawBottoms(p, col, view, pose) {
  const kind = p.kind;
  const base = view === "inside" ? col.reverse || tone(col.hex, 0.1) : col.hex;
  const pre = "g";
  let svg = "";
  if (pose === "hang") {
    const shorts = kind === "shorts";
    const legH = shorts ? 270 : 520;
    const legW = shorts ? 268 : 236;
    const gap = 6;
    const bbox = [-legW - gap - 30, -10, legW + gap + 30, legH + 70];
    // Back half (waist side) peeking below and to the right.
    const backH = legH + 40;
    const back = `M${-legW - gap + 20} 6 L${legW + gap + 24} 6 L${legW + gap + 26} ${backH} L${-legW - gap + 24} ${backH} Z`;
    svg += panel("bkb", back, tone(base, -0.12), { prefix: pre, bbox, grain: true });
    const wbY = backH - 52;
    if (kind === "sweatpants" || kind === "shorts") {
      svg += rib("bkw", `M${-legW - gap + 24} ${wbY} L${legW + gap + 26} ${wbY} L${legW + gap + 26} ${backH} L${-legW - gap + 24} ${backH}Z`, tone(base, -0.12), { bbox: [-legW - 40, wbY, legW + 40, backH], step: 6 });
      svg += `<path d="M-40 ${wbY + 20} Q-30 ${backH + 40} -60 ${backH + 60}M40 ${wbY + 20} Q50 ${backH + 30} 70 ${backH + 56}" stroke="${isDark(base) ? "#d9d4c9" : "#222"}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    } else {
      svg += `<rect x="${-legW - gap + 24}" y="${wbY}" width="${(legW + gap) * 2}" height="52" fill="${tone(base, -0.16)}"/>`;
      [-0.7, -0.25, 0.25, 0.7].forEach((u) => (svg += `<rect x="${r(u * legW - 8)}" y="${wbY - 6}" width="16" height="64" fill="${tone(base, -0.08)}"/>`));
      svg += stitch(`M${-legW} ${wbY + 8} H${legW + 20}`, "#000", 0.3);
    }
    // Front legs: tapered, rounded over the wire, gathered at the hem.
    [-1, 1].forEach((s) => {
      const drop = s > 0 ? 10 : 0;
      const x0 = s * gap;
      const x1 = s * (gap + legW);
      const taper = shorts ? -14 : kind === "cargos" ? 22 : 30;
      const lh = legH + drop;
      const hx0 = x0 + s * 8;
      const hx1 = x1 - s * taper;
      const gather =
        kind === "cargos"
          ? `Q${r((hx0 + hx1) / 2 + s * 40)} ${lh + 14} ${r((hx0 + hx1) / 2)} ${lh + 4} Q${r((hx0 + hx1) / 2 - s * 40)} ${lh + 14} ${hx0} ${lh}`
          : `Q${r((hx0 + hx1) / 2)} ${lh + 10} ${hx0} ${lh}`;
      const leg = `M${x0} 2 Q${r((x0 + x1) / 2)} -16 ${x1} 4 Q${x1 + s * 6} ${r(lh * 0.5)} ${hx1} ${lh} ${gather} Q${x0 + s * 2} ${r(lh * 0.5)} ${x0} 2 Z`;
      svg += `<path d="${leg}" fill="#000" opacity="0.28" transform="translate(${s * 3} 8)" filter="url(#gb10)"/>`;
      const mid = (x0 + x1) / 2;
      svg += panel(`bl${s > 0 ? "R" : "L"}`, leg, base, {
        prefix: pre,
        bbox,
        folds: [
          streak(P(x0 + s * 26, 30), P(x0 + s * 34, lh - 20), 4, 9),
          streak(P(x1 - s * 26, 40), P(hx1 - s * 16, lh - 30), 4, 11),
          streak(P(mid - s * 30, 40), P(mid + s * 20, 200), 3, 7),
          streak(P(mid + s * 10, lh - 140), P(mid - s * 40, lh), 3, 9),
        ],
        lights: [streak(P(mid, 24), P(mid + s * 8, lh - 40), 8, 12), streak(P(x1 - s * 50, 30), P(x1 - s * 56, 200), 4, 6)],
      });
      // Fold highlight where it bends over the wire, and the shadow under it.
      svg += `<path d="M${x0 + s * 6} 2 Q${r(mid)} -12 ${x1 - s * 6} 5" stroke="#fff" stroke-opacity="${isDark(base) ? 0.16 : 0.32}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      svg += `<path d="M${x0 + s * 8} 30 Q${r(mid)} 18 ${x1 - s * 8} 32" stroke="#000" stroke-opacity="0.22" stroke-width="12" fill="none" filter="url(#gb4)"/>`;
      if (kind === "cargos") {
        // Knee seam and bellows cargo pocket.
        svg += stitch(`M${x0 + s * 10} ${r(lh * 0.62)} Q${r(mid)} ${r(lh * 0.6)} ${x1 - s * 14} ${r(lh * 0.62)}`, isDark(base) ? "#fff" : "#000", isDark(base) ? 0.14 : 0.26);
        const px = x1 - s * 22;
        const pw = 128;
        const pkt = `M${px} 110 L${px - s * pw} 110 L${px - s * pw} 296 Q${px - s * pw / 2} 306 ${px} 296 Z`;
        svg += `<path d="${pkt}" fill="#000" opacity="0.2" transform="translate(${s * 4} 6)" filter="url(#gb4)"/><path d="${pkt}" fill="${tone(base, 0.03)}"/>`;
        svg += `<path d="${pkt}" fill="url(#bl${s > 0 ? "R" : "L"}v)"/>`;
        svg += stitch(`M${px - s * 6} 120 V288 M${px - s * (pw - 6)} 120 V288`, isDark(base) ? "#fff" : "#000", isDark(base) ? 0.16 : 0.3);
        svg += `<path d="M${px + s * 6} 98 L${px - s * (pw + 6)} 98 L${px - s * (pw + 6)} 142 L${px + s * 6} 142 Z" fill="${tone(base, isDark(base) ? 0.05 : -0.06)}"/>`;
        svg += `<path d="M${px + s * 6} 142 L${px - s * (pw + 6)} 142" stroke="#000" stroke-opacity="0.35" stroke-width="2"/>`;
        if (s < 0 && view !== "inside") {
          svg += `<rect x="${px - s * 16 - 8}" y="180" width="16" height="44" fill="#C8261B"/><path d="${textPath("N", { size: 12, x: px - s * 16, y: 208, anchor: "middle", mirrorN: true }).d}" fill="#EEEAE3"/>`;
        }
        // Drawcord at the hem with a toggle.
        svg += `<path d="M${hx1 + s * 10} ${lh - 6} Q${hx1 + s * 24} ${lh + 30} ${hx1 + s * 6} ${lh + 54}" stroke="#111" stroke-width="5" fill="none"/><rect x="${hx1 + s * 6 - 8}" y="${lh + 50}" width="16" height="20" rx="5" fill="#2b2b2b"/>`;
        svg += stitch(`M${hx0 + s * 2} ${lh - 22} L${hx1 - s * 2} ${lh - 22}`, isDark(base) ? "#fff" : "#000", isDark(base) ? 0.16 : 0.3);
      }
      if (kind === "sweatpants") {
        const cuff = `M${x0 + s * 6} ${lh - 66} L${hx1 + s * 2} ${lh - 66} L${hx1} ${lh} Q${r((hx0 + hx1) / 2)} ${lh + 8} ${hx0} ${lh} Z`;
        svg += rib(`bc${s > 0 ? "R" : "L"}`, cuff, base, { bbox: [Math.min(x0, x1) - 20, lh - 70, Math.max(x0, x1) + 20, lh + 10], step: 6 });
        if (s < 0 && view !== "inside") {
          const t = textPath("GROUNDED", { font: "mono", size: 18, x: x1 + s * -54, y: 120, anchor: "middle", tracking: 0.1 });
          svg += `<g transform="rotate(-90 ${x1 + s * -54} 120)"><path d="${t.d}" fill="${col.accent}" opacity="0.7"/></g>`;
        }
      }
      if (kind === "shorts") {
        svg += stitch(`M${hx0 + s * 4} ${lh - 24} L${hx1 - s * 4} ${lh - 24}`, isDark(base) ? "#fff" : "#000", isDark(base) ? 0.16 : 0.3);
        svg += `<path d="M${hx1 - s * 2} ${lh - 50} L${hx1 + s * 2} ${lh}" stroke="#000" stroke-opacity="0.4" stroke-width="2"/>`;
        if (s < 0 && view !== "inside") {
          svg += `<path d="${textPath("SURGE", { size: 22, x: mid, y: lh - 56, anchor: "middle", tracking: 0.04 }).d}" fill="${col.accent}"/>`;
        }
      }
    });
    // Shadow in the gap between the legs.
    svg += `<path d="M-4 20 L4 20 L6 ${legH} L-6 ${legH}Z" fill="#000" opacity="0.45" filter="url(#gb4)"/>`;
    return { svg, bbox };
  }
  // Flat product view: full pants front/back.
  const shorts = kind === "shorts";
  const H = shorts ? 520 : 1040;
  const waist = 230;
  const hip = 290;
  const hemW = kind === "sweatpants" ? 150 : shorts ? 300 : 230;
  const rise = 330;
  const left = `M${-waist} 0 L${waist} 0 L${hip} ${rise * 0.6} L${hip - 10} ${H} L${hip - hemW - 10} ${H} L6 ${rise} L-6 ${rise} L${-(hip - hemW - 10)} ${H} L${-(hip - 10)} ${H} L${-hip} ${rise * 0.6} Z`;
  const bbox = [-hip - 30, -20, hip + 30, H + 40];
  svg += panel("pf", left, base, {
    prefix: pre,
    bbox,
    folds: [streak(P(-150, rise), P(-160, H - 40), 5, 14), streak(P(150, rise), P(160, H - 40), 5, 14), streak(P(-40, 80), P(-10, rise - 20), 3, 6)],
    lights: [streak(P(-200, 120), P(-210, H - 80), 6, 10)],
  });
  // Waistband.
  const wb = `M${-waist} 0 L${waist} 0 L${waist + 6} 60 L${-waist - 6} 60 Z`;
  if (kind === "cargos") {
    svg += `<path d="${wb}" fill="${tone(base, -0.06)}"/>`;
    [-0.7, -0.3, 0.3, 0.7].forEach((u) => (svg += `<rect x="${u * waist - 8}" y="-6" width="16" height="70" fill="${tone(base, 0.03)}"/>`));
  } else {
    svg += rib("pfw", wb, base, { bbox: [-waist - 8, 0, waist + 8, 60], step: 6 });
  }
  if (view !== "back") {
    svg += `<path d="M-30 60 Q-36 180 -60 220M30 60 Q40 170 64 216" stroke="${isDark(base) ? "#d9d4c9" : "#222"}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    svg += stitch(`M0 60 Q-6 200 -30 ${rise - 30}`, "#000", 0.35);
  }
  if (kind === "cargos") {
    [-1, 1].forEach((s) => {
      const x = s * (hip - 20);
      svg += `<rect x="${s > 0 ? x - 140 : x}" y="${rise + 40}" width="140" height="200" fill="#000" opacity="0.08"/>`;
      svg += stitch(`M${x} ${rise + 46} H${x - s * 134} V${rise + 234} H${x}`, isDark(base) ? "#fff" : "#000", 0.2);
      svg += `<rect x="${s > 0 ? x - 146 : x}" y="${rise + 30}" width="146" height="50" fill="${tone(base, -0.06)}"/>`;
      svg += `<path d="M${x - s * 10} ${H - 50} Q${x - s * 30} ${H + 10} ${x - s * 46} ${H + 30}" stroke="#111" stroke-width="5" fill="none"/>`;
    });
  }
  if (kind === "sweatpants") {
    [-1, 1].forEach((s) => {
      const cuff = `M${s * (hip - 10)} ${H - 80} L${s * (hip - hemW - 10)} ${H - 80} L${s * (hip - hemW - 10)} ${H} L${s * (hip - 10)} ${H}Z`;
      svg += rib(`pc${s}`, cuff, base, { bbox: [-hip, H - 80, hip, H], step: 6 });
    });
    if (view === "front") {
      const t = textPath("GROUNDED", { font: "mono", size: 22, x: -180, y: 190, anchor: "middle", tracking: 0.1 });
      svg += `<path d="${t.d}" fill="${col.accent}" opacity="0.75"/>`;
    }
  }
  if (kind === "shorts" && view === "front") {
    svg += `<path d="${textPath("SURGE", { size: 28, x: -170, y: H - 70, anchor: "middle" }).d}" fill="${col.accent}"/>`;
  }
  if (view === "inside") {
    const thread = mix(base, "#fff", 0.4);
    svg += `<path d="${overlock([P(-hip + 8, 80), P(-hip + 18, H - 20)])}" stroke="${thread}" stroke-width="1.5" fill="none"/>`;
    svg += `<path d="${overlock([P(hip - 8, 80), P(hip - 18, H - 20)])}" stroke="${thread}" stroke-width="1.5" fill="none"/>`;
    svg += `<rect x="-60" y="70" width="120" height="34" fill="#0f0f0f"/><path d="${textPath("WRNGSIDE", { size: 14, x: 0, y: 93, anchor: "middle", mirrorN: true, tracking: 0.05 }).d}" fill="#EEEAE3"/>`;
  }
  return { svg, bbox };
}

/* ───────────── EXTRAS ───────────── */

function drawCap(p, col, view, pose) {
  const base = view === "inside" ? col.reverse || tone(col.hex, 0.08) : col.hex;
  const pre = "g";
  let svg = "";
  if (pose === "hang") {
    // Profile view, hung from the back strap by one peg (strap top = pivot).
    const S = P(-112, -6);
    const ang = (38 * Math.PI) / 180;
    const rot = (q) => {
      const dx = q[0] - S[0];
      const dy = q[1] - S[1];
      return [S[0] + dx * Math.cos(ang) - dy * Math.sin(ang), S[1] + dx * Math.sin(ang) + dy * Math.cos(ang)];
    };
    const ext = [P(-120, -12), P(-118, 70), P(10, -12), P(102, 60), P(218, 134), P(170, 156), P(-96, 124), P(70, 132)].map(rot);
    const bb = bboxOf(ext, 6);
    // Re-centre so the strap pivot sits at x = 0, top of the box (anchor = top centre).
    const half = Math.max(S[0] - bb[0], bb[2] - S[0]);
    const bbox = [-half, 0, half, bb[3] - S[1] + 4];
    svg += `<g transform="translate(${r(-S[0])} ${r(-S[1] + 2)}) rotate(38 ${S[0]} ${S[1]})">`;
    const strap = `M-108 -8 C-150 20 -142 92 -96 116 L-80 112 C-118 88 -122 34 -94 2Z`;
    svg += `<path d="${strap}" fill="${tone(base, -0.12)}"/>`;
    svg += `<rect x="-140" y="40" width="22" height="34" rx="3" fill="#B08A3A" transform="rotate(-18 -129 57)"/>`;
    const crown = `M-96 122 C-112 30 -44 -12 8 -10 C70 -8 104 52 100 122 Z`;
    svg += panel("cc", crown, base, { prefix: pre, bbox: [-130, -20, 120, 130], folds: [streak(P(-40, 10), P(-70, 116), 3, 8)], lights: [streak(P(10, 4), P(46, 110), 6, 12)] });
    svg += `<path d="M8 -10 Q-4 50 -18 122M8 -10 Q50 40 56 122" stroke="#000" stroke-opacity="0.3" stroke-width="2" fill="none"/>`;
    svg += `<circle cx="8" cy="-10" r="8" fill="${tone(base, -0.1)}"/>`;
    svg += `<circle cx="-46" cy="44" r="4.5" fill="#000" opacity="0.55"/><circle cx="62" cy="38" r="4.5" fill="#000" opacity="0.55"/>`;
    if (view !== "inside") svg += `<path d="${textPath("N", { size: 46, x: 52, y: 100, anchor: "middle", mirrorN: true }).d}" fill="${col.accent}" opacity="0.92"/>`;
    const brim = `M68 112 Q160 98 218 132 Q170 158 66 130 Z`;
    svg += `<path d="${brim}" fill="#000" opacity="0.3" transform="translate(0 8)" filter="url(#gb10)"/>`;
    svg += panel("cb", brim, tone(base, -0.04), { prefix: pre, bbox: [60, 90, 222, 160] });
    svg += stitch(`M80 116 Q156 106 204 132`, isDark(base) ? "#fff" : "#000", 0.2);
    svg += `<path d="M-96 122 L100 122" stroke="#000" stroke-opacity="0.4" stroke-width="3"/>`;
    svg += `</g>`;
    return { svg, bbox };
  }
  // Front 3/4 product view.
  const bbox = [-260, -40, 260, 380];
  const crown = `M-210 220 Q-230 -10 0 -20 Q230 -10 210 220 Z`;
  svg += panel("cf", crown, base, { prefix: pre, bbox, folds: [streak(P(-120, 0), P(-180, 210), 4, 12)], lights: [streak(P(30, -10), P(40, 200), 10, 18)] });
  svg += `<path d="M0 -20 Q-10 100 0 220M-110 -6 Q-150 100 -150 220M110 -6 Q150 100 150 220" stroke="#000" stroke-opacity="0.28" stroke-width="2.4" fill="none"/>`;
  svg += `<circle cx="0" cy="-20" r="14" fill="${tone(base, -0.08)}"/>`;
  [-60, 60].forEach((x) => (svg += `<circle cx="${x}" cy="40" r="7" fill="#000" opacity="0.5"/>`));
  if (view === "front") svg += `<path d="${textPath("N", { size: 120, x: 0, y: 150, anchor: "middle", mirrorN: true }).d}" fill="${col.accent}"/>`;
  if (view === "back") {
    svg += `<path d="M-60 220 Q0 120 60 220Z" fill="#000" opacity="0.6"/><rect x="-70" y="190" width="140" height="22" fill="${tone(base, -0.1)}"/><rect x="-20" y="186" width="40" height="30" rx="4" fill="#B08A3A"/>`;
  }
  const brim = `M-230 220 Q0 200 230 220 Q250 330 0 360 Q-250 330 -230 220Z`;
  svg += `<path d="${brim}" fill="#000" opacity="0.3" transform="translate(0 14)" filter="url(#gb10)"/>`;
  svg += panel("cfb", brim, tone(base, -0.05), { prefix: pre, bbox });
  svg += stitch(`M-200 240 Q0 226 200 240`, isDark(base) ? "#fff" : "#000", 0.2);
  svg += stitch(`M-196 260 Q0 248 196 260`, isDark(base) ? "#fff" : "#000", 0.16);
  return { svg, bbox };
}

function drawSocks(p, col, view, pose) {
  const pre = "g";
  let svg = "";
  const hang = pose === "hang";
  const L = hang ? 290 : 320;
  const sock = (i, x, rot, c, stripe, dirn) => {
    const f = (X) => X * dirn;
    const d = `M${f(-46)} 0 L${f(46)} 0 L${f(46)} ${L - 6} Q${f(46)} ${L + 18} ${f(78)} ${L + 20} L${f(128)} ${L + 22} Q${f(164)} ${L + 24} ${f(164)} ${L + 68} Q${f(164)} ${L + 112} ${f(122)} ${L + 112} L${f(-6)} ${L + 112} Q${f(-46)} ${L + 112} ${f(-46)} ${L + 72} Z`;
    let o = `<g transform="translate(${x} 0) rotate(${rot})">`;
    o += `<path d="${d}" fill="#000" opacity="0.25" transform="translate(4 8)" filter="url(#gb10)"/>`;
    o += panel(`sk${i}`, d, c, { prefix: pre, bbox: [-190, 0, 190, L + 120], folds: [streak(P(f(-16), 80), P(f(-8), L - 10), 3, 6)] });
    o += rib(`skc${i}`, `M-46 0 L46 0 L46 70 L-46 70Z`, c, { bbox: [-48, 0, 48, 70], step: 5 });
    if (stripe) o += `<rect x="-46" y="80" width="92" height="13" fill="#E0371E"/><rect x="-46" y="100" width="92" height="6" fill="#E0371E"/>`;
    const heel = `M${f(-46)} ${L + 28} Q${f(-46)} ${L + 112} ${f(-6)} ${L + 112} L${f(30)} ${L + 112} Q${f(10)} ${L + 70} ${f(-46)} ${L + 28}Z`;
    const toe = `M${f(122)} ${L + 21} Q${f(164)} ${L + 24} ${f(164)} ${L + 68} Q${f(164)} ${L + 112} ${f(122)} ${L + 112} Q${f(104)} ${L + 66} ${f(122)} ${L + 21}Z`;
    const patch = isDark(c) ? tone(c, 0.1) : tone(c, -0.1);
    o += `<path d="${heel}" fill="${patch}"/><path d="${toe}" fill="${patch}"/>`;
    o += `<path d="M${f(-30)} ${L + 104} L${f(116)} ${L + 104}" stroke="#000" stroke-opacity="0.15" stroke-width="2" stroke-dasharray="4 3"/>`;
    const t = textPath("SPARK", { font: "mono", size: 16, x: 0, y: 44, anchor: "middle", tracking: 0.12 });
    o += `<path d="${t.d}" fill="${isDark(c) ? "#E6E0D3" : "#161616"}" opacity="0.85"/>`;
    o += `</g>`;
    return o;
  };
  const cols = ["#E6E0D3", "#161616", "#E6E0D3"];
  let bbox;
  if (hang) {
    // Three socks under one peg, fanned.
    svg += sock(0, -54, 7, cols[0], false, -1);
    svg += sock(2, 54, -7, cols[2], true, 1);
    svg += sock(1, 0, 0, cols[1], false, 1);
    bbox = [-250, -4, 250, L + 150];
  } else {
    svg += sock(0, -210, 0, cols[0], false, -1);
    svg += sock(1, 0, 0, cols[1], false, 1);
    svg += sock(2, 210, 0, cols[2], true, 1);
    bbox = [-430, -10, 430, L + 130];
  }
  return { svg, bbox };
}

function drawTote(p, col, view) {
  const base = col.hex;
  const pre = "g";
  const bbox = [-210, -8, 210, 690];
  let svg = "";
  // Handles.
  [-1, 1].forEach((s) => {
    const h = `M${s * 120} 290 Q${s * 120} 0 ${s * 24} 0 Q${s * 6} 0 ${s * 6} 40 M${s * 70} 290 Q${s * 70} 40 ${s * 20} 34`;
    svg += `<path d="M${s * 130} 290 Q${s * 132} -4 ${s * 10} 2" stroke="${tone(base, -0.12)}" stroke-width="26" fill="none" stroke-linecap="round"/>`;
    svg += `<path d="M${s * 130} 290 Q${s * 132} -4 ${s * 10} 2" stroke="#000" stroke-opacity="0.18" stroke-width="2" fill="none" transform="translate(${s * 8} 0)"/>`;
    svg += stitch(`M${s * 128} 286 Q${s * 128} 6 ${s * 14} 10`, "#000", 0.25);
    void h;
  });
  const bag = `M-200 270 L200 270 L206 690 L-206 690 Z`;
  svg += `<path d="${bag}" fill="#000" opacity="0.22" transform="translate(4 10)" filter="url(#gb10)"/>`;
  svg += panel("tt", bag, base, { prefix: pre, bbox, folds: [streak(P(-120, 300), P(-140, 680), 4, 12), streak(P(90, 290), P(110, 680), 3, 10)], lights: [streak(P(-20, 290), P(-10, 670), 10, 16)] });
  // Weave.
  let wv = "";
  for (let y = 274; y < 690; y += 6) wv += `M-206 ${y}H206`;
  svg += `<defs><clipPath id="ttc2"><path d="${bag}"/></clipPath></defs><path d="${wv}" clip-path="url(#ttc2)" stroke="#000" stroke-opacity="0.05" stroke-width="1.5"/>`;
  svg += stitch(`M-196 286 H196`, "#000", 0.3);
  [-1, 1].forEach((s) => (svg += `<rect x="${s > 0 ? 104 : -136}" y="270" width="32" height="40" fill="none" stroke="#000" stroke-opacity="0.3" stroke-width="1.5" stroke-dasharray="4 3"/>`));
  if (view === "back") {
    svg += `<rect x="-90" y="420" width="180" height="70" fill="none" stroke="${col.accent}" stroke-width="10"/><rect x="-40" y="404" width="80" height="102" fill="${base}"/><path d="M-36 455 H36" stroke="${col.accent}" stroke-width="8"/>`;
  } else {
    const t = textPath("FUSE", { size: 112, x: 0, y: 500, anchor: "middle", tracking: -0.01 });
    const m = textPath("CARRY YOUR OWN CURRENT", { font: "mono", size: 18, x: 0, y: 548, anchor: "middle", tracking: 0.16 });
    svg += `<path d="${t.d}" fill="${col.accent}"/><path d="${m.d}" fill="${col.accent}"/>`;
    svg += `<path d="${boltPath(150, 360, 30)}" fill="#E0371E"/>`;
  }
  return { svg, bbox };
}

function drawBeanie(p, col, view) {
  const base = view === "inside" ? col.reverse || tone(col.hex, 0.08) : col.hex;
  const pre = "g";
  const bbox = [-125, -6, 125, 272];
  let svg = "";
  const crown = `M-110 150 Q-118 10 0 2 Q118 10 110 150 Z`;
  svg += panel("bn", crown, base, { prefix: pre, bbox, folds: [streak(P(-40, 20), P(-60, 150), 3, 8)], lights: [streak(P(20, 10), P(30, 140), 8, 12)] });
  let rl = "";
  for (let x = -110; x <= 110; x += 9) rl += `M${x} 150 Q${x * 0.6} 60 ${x * 0.15} 6`;
  svg += `<defs><clipPath id="bnr"><path d="${crown}"/></clipPath></defs><path d="${rl}" clip-path="url(#bnr)" stroke="#000" stroke-opacity="${isDark(base) ? 0.5 : 0.18}" stroke-width="3" fill="none"/>`;
  const cuff = `M-116 140 L116 140 L120 268 L-120 268 Z`;
  svg += rib("bnc", cuff, base, { bbox: [-122, 140, 122, 270], step: 9 });
  svg += `<path d="M-116 140 L116 140" stroke="#000" stroke-opacity="0.35" stroke-width="4"/>`;
  if (view !== "back") {
    svg += `<rect x="-40" y="182" width="80" height="44" fill="#0f0f0f"/><path d="${textPath("STATIC", { font: "mono", size: 15, x: 0, y: 209, anchor: "middle", tracking: 0.14 }).d}" fill="#EEEAE3"/>`;
  }
  return { svg, bbox };
}

/* ───────────── dispatcher ───────────── */

export function drawGarment(p, col, view, pose) {
  const k = p.kind;
  if (k === "tee" || k === "longsleeve" || k === "jersey") return drawTee(p, col, view, pose);
  if (k === "hoodie" || k === "ziphoodie") return drawHoodie(p, col, view, pose);
  if (k === "jacket" || k === "varsity" || k === "overshirt") return drawJacket(p, col, view, pose);
  if (k === "cargos" || k === "sweatpants" || k === "shorts") return drawBottoms(p, col, view, pose);
  if (k === "cap") return drawCap(p, col, view, pose);
  if (k === "socks") return drawSocks(p, col, view, pose);
  if (k === "tote") return drawTote(p, col, view, pose);
  if (k === "beanie") return drawBeanie(p, col, view, pose);
  throw new Error(`No drawing for ${k}`);
}

export const seedFor = (p, col) => hashString(p.handle + col.slug) % 97;
