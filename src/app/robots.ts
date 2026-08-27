import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * robots.txt, generated so the sitemap URL tracks the canonical origin
 * instead of being hardcoded in a static file that nobody remembers to edit.
 *
 * /api is disallowed because the only route under it is the enquiry endpoint:
 * it answers POST, has nothing to index, and every crawl of it burns a slot in
 * the route's rate limiter.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
