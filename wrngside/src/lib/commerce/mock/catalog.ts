/**
 * Mock catalogue in the brief's raw shape. `lib/commerce` reshapes it into
 * Storefront-API-like objects; the art generator (scripts/) reads it too, so
 * this file must stay import-free.
 *
 * Image paths follow the slots real photography will use:
 *   /products/{handle}/{colour}/cutout|front|back|inside-out|model-1 .svg
 * Swap the files (and extensions here) when photos arrive.
 */

export type Category = "tees" | "outerwear" | "bottoms" | "extras";
export type HangStyle = "pegs" | "hanger" | "folded" | "strap" | "handles" | "laces";
export type GarmentKind =
  | "tee"
  | "longsleeve"
  | "jersey"
  | "hoodie"
  | "ziphoodie"
  | "jacket"
  | "varsity"
  | "overshirt"
  | "cargos"
  | "sweatpants"
  | "shorts"
  | "cap"
  | "socks"
  | "tote"
  | "beanie";

export type PrintKind =
  | "livewire-chest"
  | "livewire-back"
  | "logo-chest"
  | "noentry-chest"
  | "noentry-back"
  | "oneway-sleeve"
  | "oneway-back"
  | "jersey-front"
  | "jersey-back"
  | "440v-front"
  | "440v-back"
  | "blackout-chest"
  | "blackout-back"
  | "uturn-front"
  | "uturn-back"
  | "detour-chest"
  | "detour-back"
  | "lineman-chest"
  | "lineman-back"
  | "varsity-front"
  | "varsity-back"
  | "cargo-tab"
  | "grounded-hip"
  | "surge-leg"
  | "cap-front"
  | "socks-cuff"
  | "tote-front"
  | "tote-back"
  | "beanie-label"
  | "none";

export interface RawColour {
  name: string;
  slug: string;
  hex: string;
  /** Trim / print ink for the placeholder art. */
  accent: string;
  /** Inside fabric shade (reverse side), placeholder art only. */
  reverse?: string;
}

export interface RawSize {
  label: string;
  available: boolean;
  stock: number;
}

export interface RawImages {
  cutout: string;
  front: string;
  back: string;
  insideOut: string;
  model: string[];
}

export interface RawProduct {
  id: string;
  handle: string;
  title: string;
  /** e.g. "oversized tee" — used in accessible names: "LIVE WIRE oversized tee". */
  type: string;
  category: Category;
  kind: GarmentKind;
  price: number;
  compareAtPrice?: number;
  currency: "INR";
  colours: RawColour[];
  sizes: RawSize[];
  images: RawImages;
  gsm: number;
  fit: string;
  fabric: string;
  care: string[];
  hangStyle: HangStyle;
  /** 0–1. Heavier pieces sag the cable more and swing less, more slowly. */
  weight: number;
  drop: string;
  isNew: boolean;
  isLimited: boolean;
  restocking?: boolean;
  /** Locked until this time (ISO, IST offset). */
  releaseAt?: string;
  description: string;
  details: string[];
  sizeChart: "tee" | "longsleeve" | "hoodie" | "jacket" | "overshirt" | "cargos" | "sweatpants" | "shorts" | "onesize" | "socks";
  /** Real-world size of the cutout in cm (sets true relative scale on THE LINE). */
  dims: { w: number; h: number };
  prints: { front: PrintKind; back: PrintKind };
  tags: string[];
}

const care = {
  cotton: [
    "Machine wash cold, inside out",
    "Gentle spin, no bleach",
    "Dry flat in the shade",
    "Iron inside out, never on the print",
  ],
  fleece: [
    "Machine wash cold, inside out",
    "Wash with similar colours",
    "Do not tumble dry",
    "Iron on low, never on the print",
  ],
  canvas: ["Spot clean with a damp cloth", "Hand wash cold if you must", "Dry in the shade", "Do not bleach"],
  knit: ["Hand wash cold", "Reshape and dry flat", "Do not wring", "Do not tumble dry"],
  wool: ["Dry clean only", "Air between wears", "Store on a wide hanger", "Do not iron the patches"],
};

function imgs(handle: string, colour: string): RawImages {
  const base = `/products/${handle}/${colour}`;
  return {
    cutout: `${base}/cutout.svg`,
    front: `${base}/front.svg`,
    back: `${base}/back.svg`,
    insideOut: `${base}/inside-out.svg`,
    model: [`${base}/model-1.svg`],
  };
}

const S = (label: string, stock: number): RawSize => ({ label, available: stock > 0, stock });

export const catalog: RawProduct[] = [
  // ───────────────────────────── TEES ─────────────────────────────
  {
    id: "gid://shopify/Product/9000000001",
    handle: "live-wire-tee",
    title: "LIVE WIRE",
    type: "oversized tee",
    category: "tees",
    kind: "tee",
    price: 1899,
    currency: "INR",
    colours: [
      { name: "Black", slug: "black", hex: "#151515", accent: "#EEEAE3", reverse: "#2a2a2a" },
      { name: "Bone", slug: "bone", hex: "#E3DCCD", accent: "#141414", reverse: "#d6cfc0" },
    ],
    sizes: [S("S", 14), S("M", 3), S("L", 22), S("XL", 9), S("XXL", 0)],
    images: imgs("live-wire-tee", "black"),
    gsm: 240,
    fit: "Boxy oversized. Dropped shoulders, wide sleeves, cropped 2 cm shorter than our standard tee.",
    fabric: "100% combed cotton, 240 GSM single jersey, pre-shrunk and enzyme washed.",
    care: care.cotton,
    hangStyle: "pegs",
    weight: 0.3,
    drop: "drop-04",
    isNew: true,
    isLimited: false,
    description:
      "The one that named the drop. A heavyweight boxy tee with a puff-printed wire that runs across the chest and sparks at the end.",
    details: ["Puff print on chest, screen print on back", "1x1 rib collar, 2.5 cm", "Woven mirrored-N label at the hem"],
    sizeChart: "tee",
    dims: { w: 76.2, h: 75.5 },
    prints: { front: "livewire-chest", back: "livewire-back" },
    tags: ["tee", "black", "graphic", "puff print", "drop 04"],
  },
  {
    id: "gid://shopify/Product/9000000002",
    handle: "neutral-tee",
    title: "NEUTRAL",
    type: "tee",
    category: "tees",
    kind: "tee",
    price: 1499,
    compareAtPrice: 1799,
    currency: "INR",
    colours: [
      { name: "Ash", slug: "ash", hex: "#8E8C87", accent: "#151515", reverse: "#9d9b96" },
      { name: "Black", slug: "black", hex: "#151515", accent: "#5a5a5a", reverse: "#2a2a2a" },
      { name: "Bone", slug: "bone", hex: "#E3DCCD", accent: "#b8b1a2", reverse: "#d6cfc0" },
    ],
    sizes: [S("S", 30), S("M", 41), S("L", 38), S("XL", 26), S("XXL", 12)],
    images: imgs("neutral-tee", "ash"),
    gsm: 240,
    fit: "Relaxed oversized. Our standard block: dropped shoulders and a straight hem.",
    fabric: "100% combed cotton, 240 GSM single jersey, pre-shrunk.",
    care: care.cotton,
    hangStyle: "pegs",
    weight: 0.28,
    drop: "drop-01",
    isNew: false,
    isLimited: false,
    description:
      "The blank we started with, made properly. Heavy, soft, and cut to sit right. A tonal mirrored N on the chest is the only noise.",
    details: ["Tonal embroidered mirrored N", "Taped shoulder seams", "Double-needle hem"],
    sizeChart: "tee",
    dims: { w: 76.2, h: 75.5 },
    prints: { front: "logo-chest", back: "none" },
    tags: ["tee", "blank", "basic", "grey", "ash", "core"],
  },
  {
    id: "gid://shopify/Product/9000000003",
    handle: "no-entry-boxy-tee",
    title: "NO ENTRY",
    type: "boxy tee",
    category: "tees",
    kind: "tee",
    price: 1699,
    currency: "INR",
    colours: [{ name: "Bone", slug: "bone", hex: "#E3DCCD", accent: "#C8261B", reverse: "#d6cfc0" }],
    sizes: [S("S", 8), S("M", 12), S("L", 2), S("XL", 6), S("XXL", 4)],
    images: imgs("no-entry-boxy-tee", "bone"),
    gsm: 240,
    fit: "Boxy. Wide body, short sleeves that hit mid-bicep.",
    fabric: "100% combed cotton, 240 GSM, pre-shrunk.",
    care: care.cotton,
    hangStyle: "pegs",
    weight: 0.3,
    drop: "drop-04",
    isNew: true,
    isLimited: false,
    description:
      "The red disc every Delhi driver ignores, printed dead centre. On the back, the only direction we take: WRONG SIDE ONLY.",
    details: ["Water-based screen print", "Back print: NO ENTRY / WRONG SIDE ONLY", "Side-seam woven label"],
    sizeChart: "tee",
    dims: { w: 76.2, h: 71 },
    prints: { front: "noentry-chest", back: "noentry-back" },
    tags: ["tee", "white", "bone", "graphic", "no entry", "drop 04"],
  },
  {
    id: "gid://shopify/Product/9000000004",
    handle: "one-way-long-sleeve",
    title: "ONE WAY",
    type: "long sleeve tee",
    category: "tees",
    kind: "longsleeve",
    price: 2199,
    currency: "INR",
    colours: [{ name: "Black", slug: "black", hex: "#151515", accent: "#EEEAE3", reverse: "#2a2a2a" }],
    sizes: [S("S", 0), S("M", 0), S("L", 0), S("XL", 0), S("XXL", 0)],
    images: imgs("one-way-long-sleeve", "black"),
    gsm: 240,
    fit: "Oversized with long, slightly stacked sleeves.",
    fabric: "100% combed cotton, 240 GSM, pre-shrunk.",
    care: care.cotton,
    hangStyle: "pegs",
    weight: 0.34,
    drop: "drop-02",
    isNew: false,
    isLimited: true,
    description: "One direction, printed down the left arm so it reads as you walk away.",
    details: ["Sleeve print: ONE WAY →", "Ribbed cuffs", "Back neck print"],
    sizeChart: "longsleeve",
    dims: { w: 75.3, h: 75.5 },
    prints: { front: "oneway-sleeve", back: "oneway-back" },
    tags: ["long sleeve", "black", "graphic", "drop 02"],
  },
  {
    id: "gid://shopify/Product/9000000005",
    handle: "high-tension-jersey",
    title: "HIGH TENSION",
    type: "mesh jersey",
    category: "tees",
    kind: "jersey",
    price: 2299,
    currency: "INR",
    colours: [{ name: "Ink / Hazard", slug: "ink-hazard", hex: "#1A1B1F", accent: "#F2C51C", reverse: "#26272b" }],
    sizes: [S("S", 3), S("M", 2), S("L", 1), S("XL", 2)],
    images: imgs("high-tension-jersey", "ink-hazard"),
    gsm: 180,
    fit: "Loose football fit. V-neck, raglan sleeves.",
    fabric: "100% recycled polyester airtex mesh, 180 GSM.",
    care: ["Machine wash cold", "Do not iron the numbers", "Line dry", "Do not tumble dry"],
    hangStyle: "pegs",
    weight: 0.24,
    drop: "drop-04",
    isNew: true,
    isLimited: true,
    description: "A matchday jersey for a team that doesn't exist. Number 440, hazard-yellow trims, airtex mesh that breathes in October.",
    details: ["Heat-pressed numbers", "Contrast raglan sleeves", "Limited to one run"],
    sizeChart: "tee",
    dims: { w: 74.9, h: 74 },
    prints: { front: "jersey-front", back: "jersey-back" },
    tags: ["jersey", "football", "mesh", "yellow", "drop 04"],
  },

  // ─────────────────────────── OUTERWEAR ──────────────────────────
  {
    id: "gid://shopify/Product/9000000006",
    handle: "440v-hoodie",
    title: "440V",
    type: "hoodie",
    category: "outerwear",
    kind: "hoodie",
    price: 3499,
    currency: "INR",
    colours: [
      { name: "Black", slug: "black", hex: "#141414", accent: "#E9E4DA", reverse: "#3a3a3a" },
      { name: "Ash", slug: "ash", hex: "#8B8984", accent: "#141414", reverse: "#a3a19c" },
    ],
    sizes: [S("S", 10), S("M", 18), S("L", 15), S("XL", 7), S("XXL", 3)],
    images: imgs("440v-hoodie", "black"),
    gsm: 400,
    fit: "Oversized. Dropped shoulders, double-layer hood, long ribbed cuffs.",
    fabric: "80% cotton, 20% polyester loopback fleece, 400 GSM. Unbrushed, so it wears in instead of pilling.",
    care: care.fleece,
    hangStyle: "hanger",
    weight: 0.7,
    drop: "drop-04",
    isNew: true,
    isLimited: false,
    description: "Heavy enough to stop a draft, loud enough to stop traffic. 440V in puff print across the chest; a warning on the back.",
    details: ["Puff print front, screen print back", "Double-layer hood, flat drawcords", "Kangaroo pocket"],
    sizeChart: "hoodie",
    dims: { w: 70.3, h: 84 },
    prints: { front: "440v-front", back: "440v-back" },
    tags: ["hoodie", "black", "graphic", "puff print", "drop 04"],
  },
  {
    id: "gid://shopify/Product/9000000007",
    handle: "blackout-zip-hoodie",
    title: "BLACKOUT",
    type: "zip hoodie",
    category: "outerwear",
    kind: "ziphoodie",
    price: 3799,
    currency: "INR",
    colours: [{ name: "Black", slug: "black", hex: "#121212", accent: "#2b2b2b", reverse: "#373737" }],
    sizes: [S("S", 6), S("M", 9), S("L", 0), S("XL", 4), S("XXL", 2)],
    images: imgs("blackout-zip-hoodie", "black"),
    gsm: 400,
    fit: "Oversized, slightly cropped. Two-way zip.",
    fabric: "80% cotton, 20% polyester loopback fleece, 400 GSM.",
    care: care.fleece,
    hangStyle: "hanger",
    weight: 0.72,
    drop: "drop-04",
    isNew: true,
    isLimited: false,
    description: "All black, all the way down. Tonal prints you only notice under a streetlamp, and a two-way metal zip.",
    details: ["Two-way metal zip", "Tonal high-density prints", "Split kangaroo pockets"],
    sizeChart: "hoodie",
    dims: { w: 70.3, h: 84 },
    prints: { front: "blackout-chest", back: "blackout-back" },
    tags: ["hoodie", "zip", "black", "tonal", "drop 04"],
  },
  {
    id: "gid://shopify/Product/9000000008",
    handle: "u-turn-reversible-hoodie",
    title: "U-TURN",
    type: "reversible hoodie",
    category: "outerwear",
    kind: "hoodie",
    price: 3999,
    currency: "INR",
    colours: [{ name: "Charcoal / Rust", slug: "charcoal-rust", hex: "#38383A", accent: "#9A4326", reverse: "#9A4326" }],
    sizes: [S("S", 4), S("M", 6), S("L", 5), S("XL", 2), S("XXL", 0)],
    images: imgs("u-turn-reversible-hoodie", "charcoal-rust"),
    gsm: 420,
    fit: "Oversized. Fully reversible, no exposed seams on either side.",
    fabric: "Double-faced cotton fleece, 420 GSM: charcoal outside, rust inside.",
    care: care.fleece,
    hangStyle: "hanger",
    weight: 0.75,
    drop: "drop-04",
    isNew: true,
    isLimited: true,
    description: "Made to be worn on the wrong side. Charcoal one way, rust the other, finished properly on both. Pick a side. Change your mind.",
    details: ["Fully reversible", "Bound seams throughout", "Pockets on both faces"],
    sizeChart: "hoodie",
    dims: { w: 70.3, h: 84 },
    prints: { front: "uturn-front", back: "uturn-back" },
    tags: ["hoodie", "reversible", "grey", "rust", "inside out", "drop 04"],
  },
  {
    id: "gid://shopify/Product/9000000009",
    handle: "detour-overshirt",
    title: "DETOUR",
    type: "overshirt",
    category: "outerwear",
    kind: "overshirt",
    price: 3299,
    currency: "INR",
    colours: [{ name: "Olive", slug: "olive", hex: "#545536", accent: "#D9C9A0", reverse: "#62633f" }],
    sizes: [S("S", 12), S("M", 16), S("L", 14), S("XL", 8), S("XXL", 4)],
    images: imgs("detour-overshirt", "olive"),
    gsm: 330,
    fit: "Boxy overshirt. Wear it open over a tee or buttoned as a shirt.",
    fabric: "100% cotton brushed twill, 330 GSM.",
    care: care.cotton,
    hangStyle: "hanger",
    weight: 0.55,
    drop: "drop-05",
    isNew: true,
    isLimited: false,
    releaseAt: "2026-11-06T20:00:00+05:30",
    description: "A heavy twill overshirt for the long way round. Two chest pockets, horn buttons, a diamond road sign on the back.",
    details: ["Corozo buttons", "Two flap chest pockets", "Back print: DETOUR sign"],
    sizeChart: "overshirt",
    dims: { w: 67.8, h: 82.8 },
    prints: { front: "detour-chest", back: "detour-back" },
    tags: ["overshirt", "shirt", "olive", "green", "drop 05"],
  },
  {
    id: "gid://shopify/Product/9000000010",
    handle: "lineman-work-jacket",
    title: "LINEMAN",
    type: "work jacket",
    category: "outerwear",
    kind: "jacket",
    price: 4999,
    currency: "INR",
    colours: [
      { name: "Duck", slug: "duck", hex: "#6C5233", accent: "#2A1E14", reverse: "#7a3a28" },
      { name: "Black", slug: "black", hex: "#17171A", accent: "#3a2b20", reverse: "#7a3a28" },
    ],
    sizes: [S("S", 3), S("M", 5), S("L", 4), S("XL", 1), S("XXL", 0)],
    images: imgs("lineman-work-jacket", "duck"),
    gsm: 380,
    fit: "Boxy chore jacket. Room for a hoodie underneath.",
    fabric: "12 oz cotton duck canvas, garment-washed. Corduroy collar. Quilted lining.",
    care: care.canvas,
    hangStyle: "hanger",
    weight: 0.85,
    drop: "drop-04",
    isNew: true,
    isLimited: true,
    description: "Named after the people who climb the poles so the rest of the city can sleep. Duck canvas, corduroy collar, tool pockets that actually hold tools.",
    details: ["Corduroy collar", "Four front pockets, one tool loop", "Back print: WRNGSIDE ELECTRICAL WORKS"],
    sizeChart: "jacket",
    dims: { w: 71.6, h: 73.8 },
    prints: { front: "lineman-chest", back: "lineman-back" },
    tags: ["jacket", "workwear", "canvas", "brown", "drop 04"],
  },
  {
    id: "gid://shopify/Product/9000000011",
    handle: "wrong-way-varsity-jacket",
    title: "WRONG WAY",
    type: "varsity jacket",
    category: "outerwear",
    kind: "varsity",
    price: 5999,
    currency: "INR",
    colours: [{ name: "Ink / Bone", slug: "ink-bone", hex: "#1B1C22", accent: "#E6DFD0", reverse: "#5b2a2a" }],
    sizes: [S("S", 8), S("M", 10), S("L", 9), S("XL", 5), S("XXL", 2)],
    images: imgs("wrong-way-varsity-jacket", "ink-bone"),
    gsm: 560,
    fit: "Classic varsity block, cut a size larger through the body.",
    fabric: "Melton wool body (60% wool), faux-leather sleeves, quilted satin lining.",
    care: care.wool,
    hangStyle: "hanger",
    weight: 0.9,
    drop: "drop-05",
    isNew: true,
    isLimited: true,
    releaseAt: "2026-11-06T20:00:00+05:30",
    description: "A varsity for a college you didn't get into. Chenille mirrored N on the chest, WRONG WAY arched across the back.",
    details: ["Chenille patch", "Striped rib collar, cuffs and hem", "Snap front"],
    sizeChart: "jacket",
    dims: { w: 71.6, h: 73.8 },
    prints: { front: "varsity-front", back: "varsity-back" },
    tags: ["varsity", "jacket", "wool", "black", "drop 05"],
  },

  // ──────────────────────────── BOTTOMS ───────────────────────────
  {
    id: "gid://shopify/Product/9000000012",
    handle: "short-circuit-cargos",
    title: "SHORT CIRCUIT",
    type: "cargo pants",
    category: "bottoms",
    kind: "cargos",
    price: 2999,
    currency: "INR",
    colours: [
      { name: "Black", slug: "black", hex: "#161616", accent: "#3a3a3a", reverse: "#2c2c2c" },
      { name: "Olive", slug: "olive", hex: "#4E5034", accent: "#2c2d1c", reverse: "#5d5f40" },
    ],
    sizes: [S("S", 12), S("M", 16), S("L", 10), S("XL", 5), S("XXL", 0)],
    images: imgs("short-circuit-cargos", "black"),
    gsm: 300,
    fit: "Relaxed, wide leg with a drawcord hem so you can choose the stack.",
    fabric: "100% cotton ripstop, 300 GSM.",
    care: care.cotton,
    hangStyle: "folded",
    weight: 0.6,
    drop: "drop-04",
    isNew: true,
    isLimited: false,
    description: "Six pockets, two drawcords and enough room to move. Ripstop that softens every wash.",
    details: ["Bellows cargo pockets", "Drawcord waist and hems", "Woven tab on the left cargo"],
    sizeChart: "cargos",
    dims: { w: 54.4, h: 60 },
    prints: { front: "cargo-tab", back: "none" },
    tags: ["cargos", "pants", "trousers", "black", "drop 04"],
  },
  {
    id: "gid://shopify/Product/9000000013",
    handle: "grounded-sweatpants",
    title: "GROUNDED",
    type: "sweatpants",
    category: "bottoms",
    kind: "sweatpants",
    price: 2499,
    currency: "INR",
    colours: [
      { name: "Ash", slug: "ash", hex: "#8C8A85", accent: "#151515", reverse: "#a19f9a" },
      { name: "Black", slug: "black", hex: "#151515", accent: "#4a4a4a", reverse: "#333333" },
    ],
    sizes: [S("S", 9), S("M", 14), S("L", 11), S("XL", 6), S("XXL", 2)],
    images: imgs("grounded-sweatpants", "ash"),
    gsm: 400,
    fit: "Relaxed straight leg, ribbed cuffs.",
    fabric: "80% cotton, 20% polyester loopback fleece, 400 GSM.",
    care: care.fleece,
    hangStyle: "folded",
    weight: 0.55,
    drop: "drop-04",
    isNew: true,
    isLimited: false,
    description: "The heavy sweats you live in. Matches the 440V hoodie fleece for fleece.",
    details: ["Embroidered GROUNDED at the hip", "Deep side pockets, one back pocket", "Flat drawcord"],
    sizeChart: "sweatpants",
    dims: { w: 54.4, h: 60 },
    prints: { front: "grounded-hip", back: "none" },
    tags: ["sweatpants", "joggers", "grey", "fleece", "drop 04"],
  },
  {
    id: "gid://shopify/Product/9000000014",
    handle: "surge-shorts",
    title: "SURGE",
    type: "shorts",
    category: "bottoms",
    kind: "shorts",
    price: 1799,
    currency: "INR",
    colours: [{ name: "Black", slug: "black", hex: "#161616", accent: "#E9E4DA", reverse: "#2c2c2c" }],
    sizes: [S("S", 0), S("M", 0), S("L", 0), S("XL", 0), S("XXL", 0)],
    images: imgs("surge-shorts", "black"),
    gsm: 280,
    fit: "Long, loose shorts that sit just above the knee.",
    fabric: "100% cotton French terry, 280 GSM.",
    care: care.cotton,
    hangStyle: "folded",
    weight: 0.35,
    drop: "drop-03",
    isNew: false,
    isLimited: false,
    restocking: true,
    description: "Built for 46°C. French terry that breathes, a hem long enough to look intentional.",
    details: ["Drawcord waist", "Two side pockets", "Small print on the left leg"],
    sizeChart: "shorts",
    dims: { w: 60.8, h: 35 },
    prints: { front: "surge-leg", back: "none" },
    tags: ["shorts", "black", "summer", "drop 03"],
  },

  // ──────────────────────────── EXTRAS ────────────────────────────
  {
    id: "gid://shopify/Product/9000000015",
    handle: "overhead-cap",
    title: "OVERHEAD",
    type: "cap",
    category: "extras",
    kind: "cap",
    price: 1299,
    currency: "INR",
    colours: [
      { name: "Black", slug: "black", hex: "#161616", accent: "#E9E4DA", reverse: "#2a2a2a" },
      { name: "Bone", slug: "bone", hex: "#DED6C5", accent: "#161616", reverse: "#cfc7b6" },
    ],
    sizes: [S("ONE SIZE", 25)],
    images: imgs("overhead-cap", "black"),
    gsm: 0,
    fit: "Six-panel, unstructured, mid-depth crown. Adjustable strap.",
    fabric: "100% washed cotton twill. Brass slider.",
    care: ["Spot clean", "Do not machine wash", "Reshape while damp", "Dry in the shade"],
    hangStyle: "strap",
    weight: 0.12,
    drop: "drop-04",
    isNew: true,
    isLimited: false,
    description: "Six panels of washed twill and a mirrored N stitched up front. Hung by the strap, worn however.",
    details: ["Embroidered front", "Brass slider strap", "Taped inner seams"],
    sizeChart: "onesize",
    dims: { w: 36, h: 32.3 },
    prints: { front: "cap-front", back: "none" },
    tags: ["cap", "hat", "black", "accessories", "drop 04"],
  },
  {
    id: "gid://shopify/Product/9000000016",
    handle: "spark-socks",
    title: "SPARK",
    type: "socks (3-pack)",
    category: "extras",
    kind: "socks",
    price: 699,
    currency: "INR",
    colours: [{ name: "Mixed", slug: "mixed", hex: "#E6E0D3", accent: "#E0371E", reverse: "#d6d0c3" }],
    sizes: [S("UK 6–8", 30), S("UK 9–11", 22)],
    images: imgs("spark-socks", "mixed"),
    gsm: 0,
    fit: "Crew height, cushioned sole.",
    fabric: "80% combed cotton, 17% polyamide, 3% elastane.",
    care: ["Machine wash warm", "Inside out", "Do not iron", "Line dry"],
    hangStyle: "pegs",
    weight: 0.1,
    drop: "drop-04",
    isNew: true,
    isLimited: false,
    description: "Three pairs: bone, black and one with a signal-red stripe. SPARK knitted into every cuff.",
    details: ["3 pairs per pack", "Cushioned sole", "Reinforced heel and toe"],
    sizeChart: "socks",
    dims: { w: 50, h: 44.4 },
    prints: { front: "socks-cuff", back: "none" },
    tags: ["socks", "accessories", "white", "drop 04"],
  },
  {
    id: "gid://shopify/Product/9000000017",
    handle: "fuse-tote",
    title: "FUSE",
    type: "tote bag",
    category: "extras",
    kind: "tote",
    price: 999,
    currency: "INR",
    colours: [{ name: "Natural", slug: "natural", hex: "#D8CBAF", accent: "#141414", reverse: "#cdbf9f" }],
    sizes: [S("ONE SIZE", 40)],
    images: imgs("fuse-tote", "natural"),
    gsm: 400,
    fit: "40 × 42 cm body, 28 cm drop handles, 10 cm gusset.",
    fabric: "14 oz natural cotton canvas.",
    care: care.canvas,
    hangStyle: "handles",
    weight: 0.2,
    drop: "drop-04",
    isNew: true,
    isLimited: false,
    description: "Heavy canvas, long handles, an inside pocket for your keys. CARRY YOUR OWN CURRENT.",
    details: ["Inside zip pocket", "Reinforced handle stitching", "Screen print both sides"],
    sizeChart: "onesize",
    dims: { w: 42, h: 69.8 },
    prints: { front: "tote-front", back: "tote-back" },
    tags: ["tote", "bag", "canvas", "accessories", "drop 04"],
  },
  {
    id: "gid://shopify/Product/9000000018",
    handle: "static-beanie",
    title: "STATIC",
    type: "beanie",
    category: "extras",
    kind: "beanie",
    price: 999,
    currency: "INR",
    colours: [
      { name: "Black", slug: "black", hex: "#161616", accent: "#E9E4DA", reverse: "#2a2a2a" },
      { name: "Safety Orange", slug: "safety-orange", hex: "#D4541F", accent: "#161616", reverse: "#c24a18" },
    ],
    sizes: [S("ONE SIZE", 20)],
    images: imgs("static-beanie", "black"),
    gsm: 0,
    fit: "Cuffed, mid-height.",
    fabric: "100% acrylic rib knit. Soft, warm, zero itch.",
    care: care.knit,
    hangStyle: "pegs",
    weight: 0.1,
    drop: "drop-05",
    isNew: true,
    isLimited: false,
    releaseAt: "2026-11-06T20:00:00+05:30",
    description: "A rib-knit beanie with a woven label on the cuff. For the hour the cold actually arrives.",
    details: ["Woven label", "Double-layer cuff", "Fine 2x2 rib"],
    sizeChart: "onesize",
    dims: { w: 25, h: 27.8 },
    prints: { front: "beanie-label", back: "none" },
    tags: ["beanie", "hat", "winter", "black", "orange", "drop 05"],
  },
];

/** Order of THE LINE for the live drop. */
export const lineOrder = [
  "live-wire-tee",
  "no-entry-boxy-tee",
  "high-tension-jersey",
  "440v-hoodie",
  "blackout-zip-hoodie",
  "u-turn-reversible-hoodie",
  "lineman-work-jacket",
  "short-circuit-cargos",
  "grounded-sweatpants",
  "overhead-cap",
  "spark-socks",
  "fuse-tote",
];

/** Most wanted (best sellers) — mock ordering. */
export const bestSellers = [
  "live-wire-tee",
  "440v-hoodie",
  "short-circuit-cargos",
  "neutral-tee",
  "u-turn-reversible-hoodie",
  "no-entry-boxy-tee",
  "grounded-sweatpants",
  "overhead-cap",
];

/** Complete-the-fit pairings. */
export const pairings: Record<string, string[]> = {
  "live-wire-tee": ["short-circuit-cargos", "overhead-cap", "spark-socks"],
  "neutral-tee": ["grounded-sweatpants", "static-beanie", "fuse-tote"],
  "no-entry-boxy-tee": ["short-circuit-cargos", "fuse-tote", "spark-socks"],
  "one-way-long-sleeve": ["grounded-sweatpants", "overhead-cap", "spark-socks"],
  "high-tension-jersey": ["surge-shorts", "spark-socks", "overhead-cap"],
  "440v-hoodie": ["grounded-sweatpants", "neutral-tee", "static-beanie"],
  "blackout-zip-hoodie": ["short-circuit-cargos", "live-wire-tee", "overhead-cap"],
  "u-turn-reversible-hoodie": ["short-circuit-cargos", "neutral-tee", "spark-socks"],
  "detour-overshirt": ["neutral-tee", "short-circuit-cargos", "fuse-tote"],
  "lineman-work-jacket": ["440v-hoodie", "short-circuit-cargos", "overhead-cap"],
  "wrong-way-varsity-jacket": ["neutral-tee", "grounded-sweatpants", "static-beanie"],
  "short-circuit-cargos": ["live-wire-tee", "lineman-work-jacket", "spark-socks"],
  "grounded-sweatpants": ["440v-hoodie", "neutral-tee", "spark-socks"],
  "surge-shorts": ["high-tension-jersey", "neutral-tee", "spark-socks"],
  "overhead-cap": ["live-wire-tee", "fuse-tote", "spark-socks"],
  "spark-socks": ["grounded-sweatpants", "surge-shorts", "overhead-cap"],
  "fuse-tote": ["no-entry-boxy-tee", "overhead-cap", "spark-socks"],
  "static-beanie": ["440v-hoodie", "wrong-way-varsity-jacket", "spark-socks"],
};

/** Mock reviews for the product page. Replace with your reviews provider. */
export interface RawReview {
  handle: string;
  name: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  size: string;
  fit: "Runs small" | "True to size" | "Runs big";
  photo?: string;
  date: string;
}

export const reviews: RawReview[] = [
  {
    handle: "live-wire-tee",
    name: "Arjun M.",
    city: "Pune",
    rating: 5,
    title: "Heavier than it looks",
    body: "Proper weight to it. Washed it four times, the puff print hasn't cracked. Took my usual L and it's boxy the way I wanted.",
    size: "L",
    fit: "True to size",
    photo: "/campaign/review-01.svg",
    date: "2026-10-24",
  },
  {
    handle: "live-wire-tee",
    name: "Nikita S.",
    city: "Bengaluru",
    rating: 4,
    title: "Size down if you're small",
    body: "I'm 160 cm and the S is still big on me. Looks great tucked into cargos though.",
    size: "S",
    fit: "Runs big",
    date: "2026-10-21",
  },
  {
    handle: "440v-hoodie",
    name: "Dev K.",
    city: "Delhi",
    rating: 5,
    title: "Delhi winter approved",
    body: "Thick enough that I skipped a jacket last week. The hood actually holds its shape.",
    size: "XL",
    fit: "True to size",
    photo: "/campaign/review-02.svg",
    date: "2026-10-28",
  },
  {
    handle: "u-turn-reversible-hoodie",
    name: "Sana R.",
    city: "Mumbai",
    rating: 5,
    title: "Wearing it rust side out",
    body: "Both sides are finished so well I keep switching. The seams are taped inside, no loose threads anywhere.",
    size: "M",
    fit: "True to size",
    date: "2026-10-30",
  },
  {
    handle: "short-circuit-cargos",
    name: "Kabir T.",
    city: "Hyderabad",
    rating: 4,
    title: "Great stack",
    body: "Drawcord hems are the move. Waist runs a touch big, the cord fixes it.",
    size: "M",
    fit: "Runs big",
    photo: "/campaign/review-03.svg",
    date: "2026-10-19",
  },
  {
    handle: "neutral-tee",
    name: "Ishaan P.",
    city: "Kolkata",
    rating: 5,
    title: "Bought three",
    body: "Best blank I own. The ash is a proper heather grey, not that flat colour.",
    size: "L",
    fit: "True to size",
    date: "2026-09-12",
  },
];
