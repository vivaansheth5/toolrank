import type { Metadata, Viewport } from "next";
import { CollectionPage } from "@/components/shop/CollectionPage";
import { site } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Shop everything",
  description: "Heavyweight oversized tees, hoodies, jackets, cargos and extras from WRNGSIDE. Limited drops, made in India, COD available.",
  alternates: { canonical: "/shop" },
};
export const viewport: Viewport = { themeColor: site.themeColor.day };

export default function ShopPage() {
  return <CollectionPage handle="all" />;
}
