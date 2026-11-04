import type { Metadata, Viewport } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";
import { site } from "@/lib/site-config";
import "@/components/checkout/checkout.css";
import { Lines } from "@/components/ui/Lines";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: site.themeColor.day };

export default function CheckoutPage() {
  return (
    <main id="main" data-theme="day" className="theme-day">
      <div className="wrap pt-header co-page">
        <p className="t-meta text-muted">CHECKOUT · SECURE · GST INCLUDED</p>
        <h1 className="t-h1">
          <Lines lines={["PAY UP."]} mode="mount" />
        </h1>
        <CheckoutView />
      </div>
    </main>
  );
}
