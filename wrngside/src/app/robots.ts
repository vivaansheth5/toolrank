import type { MetadataRoute } from "next";
import { site } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/checkout", "/account", "/cart", "/search", "/saved"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
