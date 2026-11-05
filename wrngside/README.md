# WRNGSIDE

Storefront for WRNGSIDE, premium Indian streetwear released in limited drops. Next.js App Router, TypeScript, Tailwind v4, GSAP 3 (`useGSAP`), Lenis. Commerce runs on a typed mock shaped like the Shopify Storefront API.

The home page hero is **THE LINE**: the live drop hangs on power cables strung between concrete poles on a Delhi street at night. You browse it by moving sideways along the street.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

Node 22+. The app is self-contained in this folder; deploy it on Vercel with **Root Directory = `wrngside`**.

---

## 1. Plan

### Component tree

```
app/layout.tsx                  fonts, boot script (js / reduced-motion / ticker flags), Organization JSON-LD
└─ AppShell                     TransitionProvider (power-cut transitions, garment flight)
   ├─ SmoothScroll              Lenis on fine pointers, driven by the one gsap.ticker loop
   ├─ RevealObserver            line and image reveals, once
   ├─ TabTitle · GlobalKeys     "COME BACK TO THE WRONG SIDE" · "/" opens search
   ├─ CartDrawer* · SearchOverlay*   loaded on first use (*)
   ├─ MobileMenu · NotifyDialog · Toaster · Announcer (aria-live) · Cursor
   ├─ Ticker · Header
   ├─ page
   └─ Footer (FooterWordmark, Clock)

app/page.tsx (home)
├─ Preloader                    first visit per session, 1.8s cap from navigation start
├─ TheLine (server)             the whole scene, server-rendered and CLS-free
│  ├─ layers: sky · skyline · buildings · Wall · night (under) · line · night (over) · light · foreground
│  ├─ Pole × n · Garment × 12 (+ SwingTag) · Crow × n · HUD
│  └─ LineController → LineEngine   all motion, input and physics
├─ TornEdge (LIGHTS ON) · Manifesto · NextDrop · Categories · MOST WANTED (ProductCard)
└─ LookbookTeaser · Craft · Community · WrongList          (each its own Suspense boundary)
```

### Folder structure

```
src/
  app/                    routes: shop, shop/[category], products/[handle], cart, checkout(+confirmed),
                          drops, lookbook, about, help(+[topic]), legal/[doc], search, account, saved,
                          not-found, sitemap, robots, manifest, icons
  components/
    line/                 THE LINE: TheLine, LineEngine, LineController, layout, Pole, Garment, Wall, Crow, line.css
    home/ shop/ product/ cart/ checkout/ drops/ lookbook/ help/ search/ account/ shell/ sound/ ui/
  lib/
    site-config.ts        every price, policy, threshold, date and piece of copy (see §3)
    commerce/             Storefront-shaped mock: types, index (queries), helpers, cart-store, mock/
    frame-loop.ts         the single gsap.ticker loop
    gsap.ts · scroll.ts · split-text.ts · flight.ts · format.ts · seo.ts · stores.ts · device.ts
public/
  scene/                  the scene plates (one file per layer)
  products/{handle}/{colour}/   cutout, front, back, inside-out, model-N
  campaign/ · og/ · textures/
scripts/                  placeholder art, scene plates, campaign art and Open Graph image generators
```

### How THE LINE works

**Layout.** The server lays everything out in two units: `P`, the pitch between garments (38vw on desktop, capped by height; 72vw on phones), and `H`, the stage height. Poles go in every 3–4 garments. Each garment's hang point sits on its span's cable curve, and its top is offset by its hang style (`components/line/layout.ts`). Everything is a CSS variable, so the first paint is already the finished scene and nothing shifts when JavaScript arrives.

**Scroll mapping (desktop: fine pointer, motion allowed).**
- The section pins with CSS `position: sticky` for exactly `track width − viewport width` of vertical scroll, mapped 1:1 to sideways travel.
- Wheel `deltaX` (trackpad swipes) is fed into the scroll through Lenis's `virtualScroll` hook while the line is pinned.
- Click-and-drag uses Draggable with InertiaPlugin on a proxy, and the throw is written back as scroll.
- Arrow keys move one garment, Home/End jump to the ends, and focusing a garment brings it to the centre.
- 150 ms after movement stops, a garment within 30% of centre eases there over 500 ms. This never happens mid-throw.
- `overscroll-behavior-x: none` keeps sideways swipes from triggering browser Back.

**Physics loop.** `lib/frame-loop.ts` runs one `gsap.ticker` loop with `lagSmoothing(0)`; Lenis's `raf` runs inside it. Each subscriber pauses when its section is off-screen (IntersectionObserver) or the tab is hidden. Per frame, `LineEngine.tick` does the following:
- **Pendulums:** line velocity comes from the position delta. Each garment is a damped pendulum, `target = clamp(k·v, ±max)`, trailing the movement with `k ≈ 0.004°` per px/s. Stiffness, damping and max angle blend by the garment's `weight`: tees 50 / 4 / 14°, outerwear 32 / 3.6 / 8°.
- **Wind:** noise sway of ±1.2° at about 0.3 Hz with a phase per garment, plus a gust every 8–14 s that travels left to right.
- **Cursor air:** garments within 160 px of the cursor lean up to 3° away.
- **Cables:** each span vibrates in five modes driven by velocity, and hovers and clicks send a ripple. Garments ride the moving curve, and swing tags are a second pendulum.
- **Writes:** transforms go straight to elements (never React state), and only when they change.

**Lighting.**
- **Light pools:** two `mix-blend-mode: multiply` night layers, one under the line and one over it, carry a soft pool at each lamp and move with the poles. A garment brightens as it passes under a lamp, with no per-garment filters.
- **Shadows:** each garment's shadow is a pre-blurred copy of its cutout on the wall, pushed away from the nearest lamp by `(garment x − lamp x) × 0.08`. It gets longer and softer with distance (blur 10 → 22 px) and fades towards 0.15 opacity.
- **Rim light:** a single `drop-shadow` applied once, not per frame.

**Touch fallback (chosen by input type, not width).** There's no pin. The line is a native horizontal scroller (`overflow-x: auto`, `scroll-snap-type: x proximity`, `overscroll-behavior-x: contain`) inside a 78svh stage, so vertical page scroll is never touched. Physics and lighting read the scroller's `scrollLeft` and velocity. Parallax runs on CSS scroll-driven animations where the browser supports them, and in the loop otherwise. The first tap flips a swing tag, the second opens the product.

**Reduced motion.** A static scene with a native scroller and visible prev/next buttons. No pin, physics, parallax, flicker or loader.

**Lite mode.** Triggered by `hardwareConcurrency ≤ 4`, `deviceMemory ≤ 2`, or under 50 fps for 2 s. It drops particles, blur layers, crows and the minor parallax layers.

**Memory.** Opening a product stores the garment index in `sessionStorage`; coming Back lands on the same garment.

---

## 2. Run, check, regenerate

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` · `npm run typecheck` | ESLint (React Compiler rules) · `tsc` |
| `scripts/photos/` (Python) | cuts garments out of product photos, upscales them and writes every product image; see `scripts/photos/README.md` |
| `npm run scene` | redraws scene plates in `public/scene/` and `components/line/scene-anchors.ts` |
| `npm run campaign` | stages the product cut-outs in night and daylight scenes and writes `public/campaign/*.webp` |
| `npm run og -- http://localhost:3000` | regenerates Open Graph cards (home = THE LINE at night, one per product) and the apple touch icon from a running server |

---

## 3. Configuration: `src/lib/site-config.ts`

Every price, policy, threshold, date and piece of copy lives here:

- **`site`, `contact`, `legal`:** name, domain, city, IST, support channels, the grievance officer.
- **`commerce`:** free-shipping threshold, shipping fee, COD limit, return and exchange windows, low-stock thresholds, dispatch cut-off, delivery estimates and serviceable pincodes.
- **`codes`:** WRONG10 (newsletter), LIGHTSOUT15 (transformer egg), the DROP 05 access code.
- **`drops`:** the live drop, the next drop and its `releaseAt`, the archive. The countdowns, ticker, posters and drop page all read from here.
- **`copy`, `ui`, `pageSeo`:** the copy kit, every heading, label, button and empty state, and page titles and descriptions. `{braces}` are filled in at render time.
- **Content:** `nav`, `footer`, `faq`, `policies`, `legalDocs`, `sizeCharts`, `lookbook`, `community`, `about`, `hindi`, `lineConfig`, `seo`, `sound`.

Product data (prices, sizes and stock, colours, GSM, fabric, hang style, weight, real-world size and where THE LINE grips each piece) lives in `src/lib/commerce/mock/catalog.ts`.

### Replace before launch

- `contact.whatsappNumber` is `910000000000`, a deliberately invalid placeholder.
- `legal.address` (registered office), the grievance officer, entity name, support emails and social handles.
- `site.url` (`https://wrngside.com`) is used for canonical URLs, Open Graph and the sitemap.
- **Discount and access codes:** they're checked in the browser for this mock, so they ship in the client bundle. Move them to Shopify (discounts) or a server check.
- **Stock and countdowns:** these come from the mock catalog and `drops`. With Shopify they should come from inventory and the release schedule.
- **Product facts:** names come from the prints, but prices, stock, GSM, fabric composition, fit notes and size charts are placeholders written from the photos. Check every product in `mock/catalog.ts` and `sizeCharts` against the line sheet.
- **Product photos** were cut from the screenshots supplied, then upscaled 4× with Real-ESRGAN, so fine print can look painted at full size. Send the original files and rerun `scripts/photos/` (same file names).

### Devanagari: needs a native speaker

Every Devanagari string is in `hindi` in `site-config.ts`, marked `HI:`:

- **Wall stencil:** रॉन्ग साइड
- **Danger plate:** खतरा
- **Street boards:** टीज़ मार्ग · जर्सीज़ मार्ग · आउटरवियर मार्ग · बॉटम्स मार्ग
- **Shop signs:** चाय · जनरल स्टोर · मोबाइल रिपेयर · बिजली घर
- **No-entry sticker:** प्रवेश निषेध

They render as live text in Teko, so the browser shapes the conjuncts. Teko loads only where it's used.

---

## 4. Dropping in real assets

- **Product images** live in `public/products/{handle}/{colour}/`: `cutout.webp` (front on transparent, for THE LINE), `cutout-back.webp`, `front.webp`, `back.webp`, extra views (`side-left`, `side-right`, `detail-*`) and `model-1.webp` (on the wire at night). Product shots are 1000×1250 on dust with the garment inside a 12% margin, which is where the flight from THE LINE lands. Paths come from `media()` in `mock/catalog.ts`. Each product's `dims` (width × height of the cut-out in cm) sets its true scale on THE LINE, and `hold` sets where the pegs or hanger grip it; `scripts/photos/assets.py` measures both from the cut-out.
- **Scene plates** are `public/scene/{sky,skyline,buildings,wall,asphalt,moon,fg-cables,fg-neem}`. Keep the names; swap the extension in `components/line/line.css` and `TheLine.tsx`. Lit windows, the neon sign and the aviation light sit on anchors in `components/line/scene-anchors.ts`, so move those to match new buildings.
- **Logo:** `components/ui/Logo.tsx` sets WRNGSIDE in Archivo with the mirrored N. Replace it with the supplied SVG, keeping the per-letter flip.
- **Favicon:** `src/app/icon.svg` and `public/icon.svg`; the apple touch icon is generated.
- **Open Graph:** `npm run og` after swapping art.

---

## 5. Switching to Shopify

The UI only talks to `src/lib/commerce`:

- **Queries:** `index.ts` exposes `getProduct`, `getAllProducts`, `getCollection(Products)`, `getLineProducts`, `getBestSellers`, `getPairings`, `getReviews`, `getDropProducts`, `searchProductsSync` and the drop helpers. Replace their bodies with Storefront API queries; the signatures stay.
- **Types:** `types.ts` mirrors Storefront objects (`Product`, `ProductVariant`, `Money`, `Cart`, `CartLine`). Brand fields live under `product.wrng` (hang style, weight, dims, GSM, drop, release date), so map them to metafields.
- **Cart:** `cart-store.ts` mirrors `cartLinesAdd` / `cartLinesUpdate` / `cartLinesRemove` / `cartNoteUpdate` against localStorage. Swap in the Storefront cart mutations and send CHECKOUT to the cart's `checkoutUrl`. The checkout page here is a demo (UPI, card, COD) and charges nothing.
- **Search:** it runs over the bundled catalog. Use Storefront `predictiveSearch`.
- **Listings:** `toListing()` (in `helpers.ts`) trims products for cards and rails. Keep it, or query only those fields.

---

## 6. QA: measured here

Measured in headless Chromium:

- **Widths 360 / 390 / 768 / 1024 / 1440 / 1920 / 2560:** no horizontal overflow on 17 pages. On ultrawide the sky and skyline extend and nothing stretches.
- **Keyboard only:** browse the line, open a product, pick a size, add to bag, reach checkout. Focus is trapped in drawers, Esc closes them, and focus returns to the opener.
- **Phone profile (Pixel 7, 4× CPU slowdown, slow 4G at 1.6 Mbps / 150 ms):**

| Page | LCP | CLS | Note |
| --- | --- | --- | --- |
| Home | 1.6–2.1 s | ≤ 0.010 | about 235 KB gzipped JS before load plus 22 KB after (bag drawer and SplitText) |
| Shop | ~1.0 s | 0.000 | |
| Product | ~0.95 s | 0.000 | |
| About | ~0.8 s | 0.000 | |

On the home page, the longest main-thread tasks during load are about 0.4–0.5 s under that throttle. INP and the 60 fps target need confirming on real mid-range Android phones and with Lighthouse, which this environment doesn't have.
- **Fonts:** display-font fallbacks are sized for Archivo at width 125, so headlines wrap the same before and after the webfont loads.

Not built: the optional WebGL cloth ripple. Sound is synthesised with Web Audio (no audio files), is off by default, and never autoplays.
