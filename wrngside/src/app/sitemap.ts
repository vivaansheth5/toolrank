import type { MetadataRoute } from "next";
import { site } from "@/lib/site-config";
import { categories, getAllProductsSync } from "@/lib/commerce";
import { helpTopics } from "@/components/help/help-topics";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const u = (path: string, priority = 0.6, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly") => ({ url: `${site.url}${path}`, lastModified: now, changeFrequency, priority });
  return [
    u("/", 1, "daily"),
    u("/shop", 0.9, "daily"),
    ...categories.map((c) => u(`/shop/${c}`, 0.8, "daily")),
    ...getAllProductsSync().map((p) => ({ ...u(`/products/${p.handle}`, 0.8, "daily"), images: [`${site.url}${p.featuredImage.url}`] })),
    u("/drops", 0.8, "daily"),
    u("/lookbook", 0.6),
    u("/about", 0.5, "monthly"),
    u("/help", 0.5, "monthly"),
    ...helpTopics.map((t) => u(`/help/${t.slug}`, 0.4, "monthly")),
    ...["terms", "privacy", "refunds", "grievance"].map((d) => u(`/legal/${d}`, 0.2, "yearly")),
  ];
}
