import type { Metadata, Viewport } from "next";
import { renderTime } from "@/lib/time";
import { drops, site, ui, copy, pageSeo } from "@/lib/site-config";
import { pageMeta } from "@/lib/seo";
import { getDropProducts, toListing } from "@/lib/commerce";
import { formatLongDate } from "@/lib/format";
import { DropLock } from "@/components/drops/DropLock";
import { ProductCard } from "@/components/shop/ProductCard";
import { CableDivider } from "@/components/ui/CableDivider";
import { TLink } from "@/components/ui/TLink";
import "@/components/drops/drops.css";
import { Lines } from "@/components/ui/Lines";

export const metadata: Metadata = pageMeta({
  title: pageSeo.drops.title,
  description: pageSeo.drops.description,
  path: "/drops",
});
export const viewport: Viewport = { themeColor: site.themeColor.night };

export default async function DropsPage() {
  const next = drops.list.find((d) => d.id === drops.next)!;
  const nextPieces = (await getDropProducts(next.id)).map(toListing);
  const others = drops.list.filter((d) => d.id !== next.id);
  const lists = await Promise.all(others.map((d) => getDropProducts(d.id).then((l) => l.map(toListing))));
  const now = renderTime();
  return (
    <main id="main" data-theme="night" className="theme-night drops-page">
      <DropLock dropId={next.id} number={next.number} name={next.name} releaseAt={next.releaseAt!} story={next.story} pieces={nextPieces} />
      <CableDivider />
      <section id="archive" className="wrap archive" aria-labelledby="archive-title">
        <h2 id="archive-title" className="t-h1">
          <Lines lines={[ui.pages.drops.archive]} />
        </h2>
        {others.map((d, i) => (
          <article key={d.id} className="arch-drop" data-status={d.status}>
            <header className="arch-head">
              <p className="arch-num t-display">{d.number}</p>
              <div className="arch-meta">
                <p className="t-meta">
                  {d.status === "live" ? (
                    <>
                      <span className="live-dot" aria-hidden="true" /> {ui.pages.drops.liveNow}
                    </>
                  ) : (
                    ui.pages.drops.archived
                  )}{" "}
                  · {d.releasedAt ? formatLongDate(d.releasedAt).toUpperCase() : ""} · {d.location}
                </p>
                <h3 className="t-h2">{d.name}</h3>
                <p className="text-muted arch-story">{d.story}</p>
                {d.status === "live" && (
                  <TLink href="/" className="btn btn-signal arch-cta">
                    {copy.ctas.shopTheLine}
                  </TLink>
                )}
              </div>
            </header>
            <div className="arch-grid">
              {lists[i].map((p) => (
                <ProductCard key={p.handle} product={p} now={now} sizes="(min-width: 1024px) 20vw, 50vw" />
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
