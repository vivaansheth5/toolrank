import type { Metadata, Viewport } from "next";
import { CollectionPage } from "@/components/shop/CollectionPage";
import { site, pageSeo } from "@/lib/site-config";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: pageSeo.shop.title,
  description: pageSeo.shop.description,
  path: "/shop",
});
export const viewport: Viewport = { themeColor: site.themeColor.day };

export default function ShopPage() {
  return <CollectionPage handle="all" />;
}
