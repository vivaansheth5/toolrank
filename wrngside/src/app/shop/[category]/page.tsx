import type { Metadata, Viewport } from "next";
import { CollectionPage } from "@/components/shop/CollectionPage";
import { categories, getCollection } from "@/lib/commerce";
import { site } from "@/lib/site-config";

export function generateStaticParams() {
  return categories.map((category) => ({ category }));
}
export const dynamicParams = false;
export const viewport: Viewport = { themeColor: site.themeColor.day };

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const c = await getCollection(category);
  if (!c) return {};
  return { title: c.seo.title, description: c.seo.description, alternates: { canonical: c.path } };
}

export default async function CategoryPage({ params }: PageProps<"/shop/[category]">) {
  const { category } = await params;
  return <CollectionPage handle={category} />;
}
