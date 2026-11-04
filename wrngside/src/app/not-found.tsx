import type { Metadata } from "next";
import Image from "next/image";
import { copy, ui, pageSeo } from "@/lib/site-config";
import { TLink } from "@/components/ui/TLink";
import { Lines } from "@/components/ui/Lines";
import { Peg } from "@/components/line/Garment";
import "@/components/help/pages.css";

export const metadata: Metadata = { title: pageSeo.notFound.title, robots: { index: false } };

/** An empty pole at night, one sock pegged to the line under a buzzing lamp. */
export default function NotFound() {
  return (
    <main id="main" data-theme="night" className="theme-night nf">
      <div className="nf-scene" aria-hidden="true">
        <Image src="/campaign/lost-sock.svg" alt="" fill sizes="100vw" preload />
        <span className="nf-lamp" />
        <span className="nf-sock">
          <span className="nf-peg">
            <Peg />
          </span>
          <Image src="/products/spark-socks/mixed/cutout.svg" alt="" width={200} height={180} />
        </span>
      </div>
      <div className="wrap nf-copy">
        <p className="t-meta">{ui.pages.notFound.kicker}</p>
        <h1 className="t-h1 nf-title">
          <Lines lines={[...ui.pages.notFound.title]} mode="mount" />
        </h1>
        <p className="t-lead">{copy.notFound.body}</p>
        <TLink href="/" className="btn btn-signal">
          {copy.ctas.backToTheLine}
        </TLink>
      </div>
    </main>
  );
}
