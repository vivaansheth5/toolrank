import type { Metadata } from "next";
import { Suspense } from "react";
import { preload } from "react-dom";
import { renderTime } from "@/lib/time";
import { TheLine } from "@/components/line/TheLine";
import { TornEdge } from "@/components/home/TornEdge";
import { Manifesto } from "@/components/home/Manifesto";
import { Categories } from "@/components/home/Categories";
import { LookbookTeaser } from "@/components/home/LookbookTeaser";
import { Community } from "@/components/home/Community";
import { WrongList } from "@/components/home/WrongList";
import { ThemeSync } from "@/components/home/ThemeSync";
import { Preloader } from "@/components/home/Preloader";
import { ProductCard } from "@/components/shop/ProductCard";
import { CableDivider } from "@/components/ui/CableDivider";
import { TLink } from "@/components/ui/TLink";
import { getBestSellers, toListing } from "@/lib/commerce";
import { site, ui } from "@/lib/site-config";
import { pageMeta } from "@/lib/seo";
import "@/components/home/home.css";
import { Lines } from "@/components/ui/Lines";

export const metadata: Metadata = pageMeta({ title: site.title, description: site.description, path: "/", absolute: true });

export default async function Home() {
  // Fetch the hero's first paints before the CSS asks for them. The poster wall's
  // concrete is in view everywhere. The graffiti wall (8K at 2x+, 4K at 1x, as
  // the CSS image-set picks) is only in the first view on desktop; on phones it
  // starts a screen to the right, so it loads with the CSS and leaves the
  // bandwidth to what's on screen.
  preload("/scene/concrete.webp", { as: "image", fetchPriority: "high" });
  preload("/scene/wall-4k.webp", { as: "image", imageSrcSet: "/scene/wall-4k.webp 1x, /scene/wall-8k.webp 2x", fetchPriority: "high", media: "(hover: hover) and (pointer: fine)" });
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
          <Categories />
        </Suspense>
        <CableDivider className="home-cable" />
        <Suspense>
          <section className="wanted wrap cv-auto" aria-labelledby="wanted-title">
            <div className="sec-head">
              <h2 id="wanted-title" className="t-h2">
                <Lines lines={[ui.pages.home.mostWanted]} />
              </h2>
              <TLink href="/shop" className="t-meta link-u">
                {ui.pages.home.shopAll}
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
