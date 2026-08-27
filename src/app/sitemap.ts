import type { MetadataRoute } from "next";
import { ROUTES, absolute } from "@/lib/site";

/**
 * Sitemap for the three real routes.
 *
 * Both languages live at the same URL - the preference is client side, not a
 * path segment - so there is one entry per route and no hreflang alternates.
 * If PT ever moves to /pt/... this is the second file to change, after the
 * router itself.
 *
 * lastModified is the build time. The site is not database backed, so a
 * deploy is genuinely the only thing that changes a page.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: absolute(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
