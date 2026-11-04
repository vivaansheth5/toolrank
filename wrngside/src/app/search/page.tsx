import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site-config";
import { SearchResults } from "@/components/search/SearchResults";
import "@/components/help/pages.css";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true }, alternates: { canonical: "/search" } };
export const viewport: Viewport = { themeColor: site.themeColor.day };

export default function SearchPage() {
  return (
    <main id="main" data-theme="day" className="theme-day">
      <SearchResults />
    </main>
  );
}
