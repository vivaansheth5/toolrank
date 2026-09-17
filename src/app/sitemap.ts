import type { MetadataRoute } from "next";
import { tools } from "@/data/tools";
import { categories } from "@/data/categories";

const BASE_URL = "https://tooldhundho.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/explore",
    "/find-my-tool",
    "/compare",
    "/deals",
    "/search",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${BASE_URL}/category/${c.slug}`,
    lastModified: new Date(),
  }));

  const toolRoutes = tools.map((t) => ({
    url: `${BASE_URL}/tools/${t.slug}`,
    lastModified: t.createdAt,
  }));

  return [...staticRoutes, ...categoryRoutes, ...toolRoutes];
}
