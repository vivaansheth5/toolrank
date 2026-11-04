import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site-config";
import { CartPageView } from "@/components/cart/CartPageView";
import { Lines } from "@/components/ui/Lines";

export const metadata: Metadata = { title: "Your bag", robots: { index: false, follow: true } };
export const viewport: Viewport = { themeColor: site.themeColor.day };

export default function CartPage() {
  return (
    <main id="main" data-theme="day" className="theme-day">
      <div className="wrap pt-header cart-page">
        <h1 className="t-h1">
          <Lines lines={["YOUR BAG"]} mode="mount" />
        </h1>
        <CartPageView />
      </div>
    </main>
  );
}
