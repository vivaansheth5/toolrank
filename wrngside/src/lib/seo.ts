import type { Metadata } from "next";
import { seo, site } from "./site-config";

type PageMeta = {
  /** Short title; the root layout template appends " — WRNGSIDE". */
  title: string;
  description: string;
  /** Canonical path, also used as og:url. */
  path: string;
  image?: { url: string; alt: string };
  /** Use the title as-is (home page). */
  absolute?: boolean;
};

/**
 * Metadata for an indexable page. Next merges metadata shallowly, so a page
 * that sets only a title would inherit the home page's og:url and og:title.
 * Every indexable page goes through here instead.
 */
export function pageMeta({ title, description, path, image, absolute }: PageMeta): Metadata {
  const full = absolute ? title : `${title} — ${site.name}`;
  const img = image ?? { url: seo.defaultOgImage, alt: seo.defaultOgAlt };
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_IN",
      url: path,
      title: full,
      description,
      images: [{ url: img.url, width: 1200, height: 630, alt: img.alt }],
    },
    twitter: { card: "summary_large_image", site: seo.twitterHandle, title: full, description, images: [img.url] },
  };
}
