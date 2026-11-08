import type { Metadata, Viewport } from "next";
import { ConfirmedView } from "@/components/checkout/ConfirmedView";
import { site, pageSeo } from "@/lib/site-config";
import "@/components/checkout/checkout.css";

export const metadata: Metadata = { title: pageSeo.confirmed.title, robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: site.themeColor.day };

export default function ConfirmedPage() {
  return (
    <main id="main" data-theme="day" className="theme-day">
      <div className="wrap pt-header co-page">
        <ConfirmedView />
      </div>
    </main>
  );
}
