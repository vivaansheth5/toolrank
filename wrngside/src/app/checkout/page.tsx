import type { Metadata, Viewport } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";
import { site, ui, pageSeo } from "@/lib/site-config";
import "@/components/checkout/checkout.css";
import { Lines } from "@/components/ui/Lines";

export const metadata: Metadata = { title: pageSeo.checkout.title, robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: site.themeColor.day };

export default function CheckoutPage() {
  return (
    <main id="main" data-theme="day" className="theme-day">
      <div className="wrap pt-header co-page">
        <p className="t-meta text-muted">{ui.pages.checkout.kicker}</p>
        <h1 className="t-h1">
          <Lines lines={[...ui.pages.checkout.title]} mode="mount" />
        </h1>
        <CheckoutView />
      </div>
    </main>
  );
}
