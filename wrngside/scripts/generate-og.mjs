#!/usr/bin/env node
// Open Graph images (1200×630) via Playwright against a running server:
//   home  = a real frame of THE LINE at night
//   products = product shot + brand type
// JPEG, kept under ~300 KB so WhatsApp still shows the preview.
// Usage: node scripts/generate-og.mjs http://localhost:3200
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { catalog } from "../src/lib/commerce/mock/catalog.ts";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2] || "http://localhost:3200";
const font = (f) => fs.readFileSync(path.join(root, "scripts", "fonts", f)).toString("base64");
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const browser = await chromium.launch();

// Home: THE LINE at night, chrome hidden.
{
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => sessionStorage.setItem("wrng:loaded", "1"));
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: ".ticker,.site-header,.hud,.line-hint,.cursor,.grain{display:none!important} html{scrollbar-width:none;scrollbar-gutter:auto!important}" });
  await page.evaluate(() => window.scrollTo(0, Number(new URLSearchParams(location.search).get("y")) || 0));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(root, "public", "og", "home.jpg"), type: "jpeg", quality: 82 });
  await ctx.close();
}

// Products (stale cards for retired handles go first).
const ogDir = path.join(root, "public", "og", "products");
const live = new Set(catalog.map((p) => `${p.handle}.jpg`));
for (const f of fs.readdirSync(ogDir)) if (!live.has(f)) fs.rmSync(path.join(ogDir, f));
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const p of catalog) {
  const html = `<!doctype html><html><head><style>
@font-face{font-family:A;src:url(data:font/ttf;base64,${font("archivo-125-900.ttf")})}
@font-face{font-family:M;src:url(data:font/ttf;base64,${font("geistmono-500.ttf")})}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;display:grid;grid-template-columns:504px minmax(0,1fr);background:#0b0b0b;color:#eeeae3;font-family:M}
.img{background:#dcd7ce url(${base}${p.colours[0].media[p.lead ?? "front"]}) center/cover}
.r{padding:56px 56px 48px;display:flex;flex-direction:column;justify-content:space-between;min-width:0;overflow:hidden}
.k{font-size:18px;letter-spacing:.12em}.t{font-family:A;font-size:104px;line-height:.86;letter-spacing:-.02em;text-transform:uppercase;overflow:hidden}
.ty{font-size:22px;letter-spacing:.1em;color:#8c8984;text-transform:uppercase;margin-top:18px}
.p{font-size:34px;letter-spacing:.06em}.row{display:flex;justify-content:space-between;align-items:flex-end}
.logo{font-family:A;font-size:30px}.n{display:inline-block;transform:scaleX(-1)}
svg{display:block;width:100%;height:30px}
</style></head><body><div class="img"></div><div class="r">
<div class="k">WR<span class="n">N</span>GSIDE · ${p.drop.replace("drop-", "DROP ")}</div>
<div><div class="t">${p.title}</div><div class="ty">${p.type}</div></div>
<svg viewBox="0 0 600 30" preserveAspectRatio="none"><path d="M0 4 Q300 30 600 4" stroke="#eeeae3" stroke-width="2" fill="none"/><circle cx="420" cy="15" r="5" fill="#ff3b1f"/></svg>
<div class="row"><div class="p">${inr.format(p.price)}</div><div class="logo">WR<span class="n">N</span>GSIDE</div></div>
</div></body></html>`;
  await page.setContent(html, { waitUntil: "networkidle" });
  // Shrink the title until every word fits the column and it stays within two lines.
  await page.evaluate(async () => {
    await document.fonts.ready;
    const t = document.querySelector(".t");
    for (let s = 104; s > 40; s -= 2) {
      t.style.fontSize = s + "px";
      if (t.scrollWidth <= t.clientWidth && t.offsetHeight <= s * 0.86 * 2 + 4) break;
    }
  });
  await page.screenshot({ path: path.join(root, "public", "og", "products", `${p.handle}.jpg`), type: "jpeg", quality: 84 });
}

// Apple touch icon from the favicon.
await page.setViewportSize({ width: 180, height: 180 });
await page.setContent(`<body style="margin:0"><img src="${base}/icon.svg" width="180" height="180"></body>`, { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(root, "src", "app", "apple-icon.png") });
await browser.close();
console.log("og images written");
