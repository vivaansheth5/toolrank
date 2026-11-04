import type { Metadata, Viewport } from "next";
import { CollectionPage } from "@/components/shop/CollectionPage";
import { site } from "@/lib/site-config";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Shop everything",
  description: "Heavyweight oversized tees, hoodies, jackets, cargos and extras from WRNGSIDE. Limited drops, made in India, COD available.",
  path: "/shop",
});
export const viewport: Viewport = { themeColor: site.themeColor.day };

export default function ShopPage() {
  return <CollectionPage handle="all" />;
}
