import type { Metadata, Viewport } from "next";
import { lookbook, site } from "@/lib/site-config";
import { getProductsByHandles } from "@/lib/commerce";
import { LookbookView } from "@/components/lookbook/LookbookView";
import { Lines } from "@/components/ui/Lines";
import "@/components/lookbook/lookbook.css";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "DROP 04 — LIVE WIRE, shot after midnight across Delhi. Five chapters.",
  alternates: { canonical: "/lookbook" },
};
export const viewport: Viewport = { themeColor: site.themeColor.night };

export default async function LookbookPage() {
  const handles = [...new Set(lookbook.chapters.flatMap((c) => c.products))];
  const list = await getProductsByHandles(handles);
  const products = Object.fromEntries(list.map((p) => [p.handle, p]));
  return (
    <main id="main" data-theme="night" className="theme-night lookbook-page">
      <header className="wrap pt-header lb-head">
        <p className="t-meta text-muted">{lookbook.season}</p>
        <h1 className="t-display">
          <Lines lines={["AFTER", "MIDNIGHT."]} mode="mount" />
        </h1>
        <p className="t-meta">SCROLL TO WALK THE CHAPTERS ↓</p>
      </header>
      <LookbookView products={products} />
    </main>
  );
}
