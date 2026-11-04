import type { Metadata } from "next";
import { Suspense } from "react";
import { preload } from "react-dom";
import { renderTime } from "@/lib/time";
import { TheLine } from "@/components/line/TheLine";
import { TornEdge } from "@/components/home/TornEdge";
import { Manifesto } from "@/components/home/Manifesto";
import { NextDrop } from "@/components/home/NextDrop";
import { Categories } from "@/components/home/Categories";
import { LookbookTeaser } from "@/components/home/LookbookTeaser";
import { Craft } from "@/components/home/Craft";
import { Community } from "@/components/home/Community";
import { WrongList } from "@/components/home/WrongList";
import { ThemeSync } from "@/components/home/ThemeSync";
import { Preloader } from "@/components/home/Preloader";
import { ProductCard } from "@/components/shop/ProductCard";
import { CableDivider } from "@/components/ui/CableDivider";
import { TLink } from "@/components/ui/TLink";
import { getBestSellers, toListing } from "@/lib/commerce";
import { site } from "@/lib/site-config";
import { pageMeta } from "@/lib/seo";
import "@/components/home/home.css";
import { Lines } from "@/components/ui/Lines";

export const metadata: Metadata = pageMeta({ title: site.title, description: site.description, path: "/", absolute: true });

export default async function Home() {
  // The wall is the hero's largest paint (LCP): fetch it before the CSS asks for it.
  preload("/scene/wall.svg", { as: "image", fetchPriority: "high" });
  const best = (await getBestSellers()).map(toListing);
  const now = renderTime();
  return (
    <main id="main" data-theme="night">
      <Preloader />
      <TheLine />
      <div id="after-line" className="after-line theme-day">
        <TornEdge />
        {/* Each below-the-fold section is its own Suspense boundary, so React
            hydrates them as separate, interruptible tasks after THE LINE
            instead of one long task that blocks the first tap. */}
        <Suspense>
          <section className="lights-on" aria-label="Manifesto">
            <Manifesto />
          </section>
        </Suspense>
        <Suspense>
          <NextDrop />
        </Suspense>
        <Suspense>
          <Categories />
        </Suspense>
        <CableDivider className="home-cable" />
        <Suspense>
          <section className="wanted wrap cv-auto" aria-labelledby="wanted-title">
            <div className="sec-head">
              <h2 id="wanted-title" className="t-h2">
                <Lines lines={["MOST WANTED"]} />
              </h2>
              <TLink href="/shop" className="t-meta link-u">
                SHOP ALL →
              </TLink>
            </div>
            <div className="wanted-grid">
              {best.map((p) => (
                <ProductCard key={p.handle} product={p} now={now} />
              ))}
            </div>
          </section>
        </Suspense>
        <Suspense>
          <LookbookTeaser />
        </Suspense>
        <Suspense>
          <Craft />
        </Suspense>
        <Suspense>
          <Community />
        </Suspense>
        <Suspense>
          <WrongList />
        </Suspense>
      </div>
      <ThemeSync targetId="after-line" />
    </main>
  );
}
