import type { Metadata, Viewport } from "next";
import Image from "next/image";
import { about, site, ui, copy, pageSeo } from "@/lib/site-config";
import { pageMeta } from "@/lib/seo";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScrubText } from "@/components/ui/ScrubText";
import { TLink } from "@/components/ui/TLink";
import "@/components/help/pages.css";
import { fill } from "@/lib/format";

export const metadata: Metadata = pageMeta({
  title: pageSeo.about.title,
  description: pageSeo.about.description,
  path: "/about",
});
export const viewport: Viewport = { themeColor: site.themeColor.day };

const IMAGES = ["/campaign/lookbook-01.webp", "/campaign/lookbook-04.webp", "/campaign/cat-outerwear.webp", "/campaign/lookbook-02.webp"];

export default function AboutPage() {
  return (
    <main id="main" data-theme="day" className="theme-day about-page">
      <PageHeader kicker={fill(ui.pages.about.kicker, { year: site.established, city: site.city, country: site.country })} title={[...ui.pages.about.title]} />
      <div className="wrap about-body">
        {about.sections.map((s, i) => (
          <section key={s.kicker} className="about-sec" aria-labelledby={`about-${i}`}>
            <p className="t-meta text-muted">{s.kicker}</p>
            <ScrubText as="h2" text={s.heading} className="t-h1 about-heading" />
            <div className="about-cols">
              <div className="prose">
                {s.body.map((b) => (
                  <p key={b} className="t-lead">
                    {b}
                  </p>
                ))}
              </div>
              <figure className="about-fig" data-reveal="img">
                <div className="reveal-inner">
                  <div className="about-img">
                    <Image src={IMAGES[i % IMAGES.length]} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" loading="lazy" />
                  </div>
                </div>
              </figure>
            </div>
            <span id={`about-${i}`} className="sr-only">
              {s.heading}
            </span>
          </section>
        ))}
        <div className="about-end">
          <p className="t-h2">{ui.pages.about.end}</p>
          <TLink href="/" className="btn btn-signal">
            {copy.ctas.shopTheLine}
          </TLink>
        </div>
      </div>
    </main>
  );
}
