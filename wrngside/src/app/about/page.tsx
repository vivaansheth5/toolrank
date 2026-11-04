import type { Metadata, Viewport } from "next";
import Image from "next/image";
import { about, site } from "@/lib/site-config";
import { PageHeader } from "@/components/ui/PageHeader";
import { ScrubText } from "@/components/ui/ScrubText";
import { TLink } from "@/components/ui/TLink";
import "@/components/help/pages.css";

export const metadata: Metadata = {
  title: "About",
  description: "WRNGSIDE: raised on the wrong side of the wire. The name, the city, the process, the team.",
  alternates: { canonical: "/about" },
};
export const viewport: Viewport = { themeColor: site.themeColor.day };

const IMAGES = ["/campaign/lookbook-01.svg", "/campaign/lookbook-04.svg", "/campaign/cat-outerwear.svg", "/campaign/lookbook-02.svg"];

export default function AboutPage() {
  return (
    <main id="main" data-theme="day" className="theme-day about-page">
      <PageHeader kicker={`EST. ${site.established} — ${site.city}, ${site.country}`} title={["RAISED ON", "THE WRONG SIDE", "OF THE WIRE."]} />
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
          <p className="t-h2">THAT&apos;S US. THE CLOTHES SAY THE REST.</p>
          <TLink href="/" className="btn btn-signal">
            SHOP THE LINE
          </TLink>
        </div>
      </div>
    </main>
  );
}
