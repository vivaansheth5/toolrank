import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site-config";
import { SavedView } from "@/components/account/SavedView";
import "@/components/help/pages.css";

export const metadata: Metadata = { title: "Your Line", robots: { index: false, follow: true } };
export const viewport: Viewport = { themeColor: site.themeColor.day };

export default function SavedPage() {
  return (
    <main id="main" data-theme="day" className="theme-day">
      <SavedView />
    </main>
  );
}
