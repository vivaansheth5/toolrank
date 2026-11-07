import type { Metadata, Viewport } from "next";
import { lookbook, site, ui, pageSeo } from "@/lib/site-config";
import { pageMeta } from "@/lib/seo";
import { getProductsByHandles, toListing } from "@/lib/commerce";
import { LookbookView } from "@/components/lookbook/LookbookView";
import { Lines } from "@/components/ui/Lines";
import "@/components/lookbook/lookbook.css";

export const metadata: Metadata = pageMeta({
  title: pageSeo.lookbook.title,
  description: pageSeo.lookbook.description,
  path: "/lookbook",
});
export const viewport: Viewport = { themeColor: site.themeColor.night };

export default async function LookbookPage() {
  const handles = [...new Set(lookbook.chapters.flatMap((c) => c.products))];
  const list = (await getProductsByHandles(handles)).map(toListing);
  const products = Object.fromEntries(list.map((p) => [p.handle, p]));
  return (
    <main id="main" data-theme="night" className="theme-night lookbook-page">
      <header className="wrap pt-header lb-head">
        <p className="t-meta text-muted">{lookbook.season}</p>
        <h1 className="t-display">
          <Lines lines={[...ui.pages.lookbook.title]} mode="mount" />
        </h1>
        <p className="t-meta">{ui.pages.lookbook.hint}</p>
      </header>
      <LookbookView products={products} />
    </main>
  );
}
