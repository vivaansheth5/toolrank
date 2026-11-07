/**
 * THE LINE layout, shared by the server render and the client engine.
 *
 * Horizontal positions are in P units (pitch between garments; CSS var --P),
 * vertical positions in H units (stage height; --H). The server renders the
 * scene with calc() from these numbers, so nothing shifts when JS arrives;
 * the engine reads the same numbers to drive physics.
 */
import type { Category, GarmentKind, HangStyle, RawHold } from "@/lib/commerce/types";

export interface LineGarmentInput {
  handle: string;
  title: string;
  type: string;
  category: Category;
  kind: GarmentKind;
  hangStyle: HangStyle;
  weight: number;
  dims: { w: number; h: number };
  /** Where the piece is gripped, measured off its cutout. */
  hold: RawHold;
  colourName: string;
  colourHex: string;
  price: number;
  cutout: string;
  sizes: { label: string; available: boolean }[];
  drop: string;
  label: string;
}

export const LINE = {
  /** Pole padding either side, P units. */
  Q: 0.32,
  /** Intro: x of the first pole (opening poster frame), P units. */
  intro: 1.6,
  /** First (off-screen) pole. */
  pole0: -0.45,
  /** Main cable height at the insulators, H units. */
  y0: 0.3,
  maxPerSpan: 4,
  /** Hanger hook height (cm). */
  hookCm: 12,
} as const;

export interface PoleSpec {
  index: number;
  x: number;
  category: Category | null;
  /** Street-name board (first pole of each category). */
  board: Category | null;
  last: boolean;
  first: boolean;
  transformer: boolean;
}

export interface SpanSpec {
  index: number;
  x0: number;
  x1: number;
  /** Sag depth at mid-span, H units. */
  sag: number;
  garments: number[];
}

export interface GarmentSpec extends LineGarmentInput {
  index: number;
  span: number;
  x: number;
  /** Position along the span 0..1. */
  u: number;
  /** Rest hang point y (H units). */
  y: number;
  /** Distance from the cable to the top of the cutout (cm). */
  topCm: number;
  /** Peg positions (fractions of cutout width), for pegs/strap styles. */
  pegs: number[];
  /** Swing tag attachment x offset from the garment centre (cm). */
  tagCm: number;
  /** Lamp this garment is closest to. */
  lamp: number;
  /** Signed distance to that lamp, P units. */
  lampDx: number;
}

export interface LineLayout {
  poles: PoleSpec[];
  spans: SpanSpec[];
  garments: GarmentSpec[];
  /** Lamp x positions (P units) — one per pole. */
  lamps: number[];
  /** x of the last pole (track width = this × P + outro). */
  endX: number;
  /** Crow perches: span index + u. */
  perches: { span: number; u: number }[];
}

export function cableY(span: SpanSpec, u: number) {
  return LINE.y0 + 4 * u * (1 - u) * span.sag;
}

function hangGeometry(hang: HangStyle, dims: { w: number; h: number }, hold: RawHold) {
  // topCm: cable → top of the cutout. pegs: fractions of width. tagCm: tag offset.
  if (hang === "hanger") {
    // The hanger's shoulders sit hold.dropCm below the top of the piece (a
    // hood rises well above them, a collar barely); the hook climbs from
    // there to the cable.
    return { topCm: LINE.hookCm - hold.dropCm, pegs: [], tagCm: dims.w * 0.36 };
  }
  // Pegs bite just under the top edge where they grip, so the cutout rides
  // that far above the cable, plus the fold of fabric over it.
  return { topCm: -hold.dropCm - 0.6, pegs: hold.pegs, tagCm: dims.w * 0.4 };
}

export function buildLineLayout(items: LineGarmentInput[]): LineLayout {
  const { Q, intro, pole0, maxPerSpan } = LINE;
  // Group consecutive garments by category, then chunk into spans.
  const groups: { category: Category; idx: number[] }[] = [];
  items.forEach((g, i) => {
    const last = groups[groups.length - 1];
    if (last && last.category === g.category) last.idx.push(i);
    else groups.push({ category: g.category, idx: [i] });
  });
  const chunks: { category: Category; idx: number[]; firstOfCategory: boolean }[] = [];
  groups.forEach((g) => {
    for (let k = 0; k < g.idx.length; k += maxPerSpan) chunks.push({ category: g.category, idx: g.idx.slice(k, k + maxPerSpan), firstOfCategory: k === 0 });
  });

  const poles: PoleSpec[] = [{ index: 0, x: pole0, category: null, board: null, last: false, first: true, transformer: false }];
  const spans: SpanSpec[] = [];
  // Intro span from the off-screen pole to the first street pole (crows sit here).
  spans.push({ index: 0, x0: pole0, x1: intro, sag: 0.034, garments: [] });

  let x = intro;
  const garments: GarmentSpec[] = [];
  chunks.forEach((c, ci) => {
    poles.push({ index: poles.length, x, category: c.category, board: c.firstOfCategory ? c.category : null, last: false, first: false, transformer: false });
    const n = c.idx.length;
    const len = 2 * Q + n;
    const wsum = c.idx.reduce((a, i) => a + items[i].weight, 0);
    const span: SpanSpec = { index: spans.length, x0: x, x1: x + len, sag: 0.02 + 0.008 * n + 0.012 * wsum, garments: [] };
    c.idx.forEach((gi, k) => {
      const gx = x + Q + k + 0.5;
      const u = (gx - span.x0) / len;
      const g = items[gi];
      const geo = hangGeometry(g.hangStyle, g.dims, g.hold);
      span.garments.push(gi);
      garments.push({ ...g, index: gi, span: span.index, x: gx, u, y: cableY(span, u), ...geo, lamp: 0, lampDx: 0 });
    });
    spans.push(span);
    x += len;
    void ci;
  });
  poles.push({ index: poles.length, x, category: null, board: null, last: true, first: false, transformer: false });

  // The transformer sits on the pole between outerwear and bottoms (or the middle pole).
  const tIdx = poles.findIndex((p) => p.board === "bottoms");
  poles[tIdx > 0 ? tIdx : Math.floor(poles.length / 2)].transformer = true;

  const lamps = poles.map((p) => p.x + 0.12);
  garments.forEach((g) => {
    let best = 0;
    lamps.forEach((lx, i) => {
      if (Math.abs(g.x - lx) < Math.abs(g.x - lamps[best])) best = i;
    });
    g.lamp = best;
    g.lampDx = g.x - lamps[best];
  });
  garments.sort((a, b) => a.index - b.index);

  const perches = [
    { span: 0, u: 0.58 },
    { span: Math.min(2, spans.length - 1), u: 0.08 },
    { span: spans.length - 1, u: 0.9 },
  ];

  return { poles, spans, garments, lamps, endX: x, perches };
}

/** Cable path in normalized units (x: P×1000, y: H×1000) for the server render. */
export function spanPathD(span: SpanSpec, samples = 24, offset = { x: 0 }) {
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const xx = (span.x0 + (span.x1 - span.x0) * u - offset.x) * 1000;
    const yy = cableY(span, u) * 1000;
    pts.push(`${xx.toFixed(1)} ${yy.toFixed(2)}`);
  }
  return `M${pts.join("L")}`;
}
