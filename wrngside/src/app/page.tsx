import type { Metadata } from "next";
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
import { getBestSellers } from "@/lib/commerce";
import { site } from "@/lib/site-config";
import { pageMeta } from "@/lib/seo";
import "@/components/home/home.css";

export const metadata: Metadata = pageMeta({ title: site.title, description: site.description, path: "/", absolute: true });

export default async function Home() {
  const best = await getBestSellers();
  const now = renderTime();
  return (
    <main id="main" data-theme="night">
      <Preloader />
      <TheLine />
      <div id="after-line" className="after-line theme-day">
        <TornEdge />
        <section className="lights-on" aria-label="Manifesto">
          <Manifesto />
        </section>
        <NextDrop />
        <Categories />
        <CableDivider className="home-cable" />
        <section className="wanted wrap cv-auto" aria-labelledby="wanted-title">
          <div className="sec-head">
            <h2 id="wanted-title" className="t-h2">
              MOST WANTED
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
        <LookbookTeaser />
        <Craft />
        <Community />
        <WrongList />
      </div>
      <ThemeSync targetId="after-line" />
    </main>
  );
}
