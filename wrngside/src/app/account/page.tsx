import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site-config";
import { AccountView } from "@/components/account/AccountView";
import "@/components/help/pages.css";
import "@/components/checkout/checkout.css";

export const metadata: Metadata = { title: "Account", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: site.themeColor.day };

export default function AccountPage() {
  return (
    <main id="main" data-theme="day" className="theme-day">
      <AccountView />
    </main>
  );
}
