import type { Metadata } from "next";
import { CONTACT_DETAILS } from "./i18n";

/**
 * Site-level facts that are not page copy.
 *
 * The canonical origin ends up in metadataBase, the sitemap, robots.txt and
 * the structured data, so it lives here rather than being retyped in four
 * files that can drift apart. NEXT_PUBLIC_SITE_URL is the escape hatch for a
 * staging domain that should describe itself honestly.
 *
 * Everything the structured data claims about the business is read from
 * CONTACT_DETAILS or from this file. Nothing here is invented: search engines
 * treat this as fact about a real business, so a placeholder that reaches
 * production is worse than an absent field.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bravio.pt"
).replace(/\/$/, "");

export const SITE_NAME = "bravio";

/** Used for the default title, the OG title and the structured data name. */
export const SITE_TITLE = "bravio | Private chef and catering";

export const SITE_DESCRIPTION =
  "Private chef and catering for dinners, celebrations and events. Menus built around your table, cooked in your kitchen.";

/** Where the kitchen works. Matches t.footer.based. */
export const LOCALITY = "Lisbon";
export const COUNTRY = "PT";

/**
 * The generated share card, served by app/opengraph-image.tsx.
 *
 * It has to be named explicitly by any page that sets its own `openGraph`.
 * The file convention resolves into the root segment's metadata, and a child
 * segment's `openGraph` replaces that object whole - images included - so a
 * page declaring one without this would ship with no card at all.
 */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "bravio - private chef and catering",
};

/** Every indexable route, in the order they matter. Drives the sitemap. */
export const ROUTES = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/story", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.7 },
] as const;

/**
 * Routes that are fig from the top of the page to the bottom of the footer.
 *
 * Every other route opens on a fig hero and then runs creme, which is what the
 * header's sentinel watches for: it starts creme on transparent and picks up a
 * creme plate once the hero has passed. On a route that never leaves fig that
 * plate would be a beige bar floating on a dark page, so the header stays in
 * its hero tone for the whole scroll instead. Kept beside ROUTES because it is
 * a fact about the route, not about the header.
 */
export const DARK_ROUTES: ReadonlySet<string> = new Set(["/contact"]);

export const absolute = (path: string) => `${SITE_URL}${path === "/" ? "" : path}`;

/**
 * Metadata for one route.
 *
 * Next merges metadata between segments *shallowly*, so a page that declares
 * its own `openGraph` replaces the layout's entirely - losing the share image,
 * the site name and the locale with it. Same for `twitter`. Building the whole
 * nested object here is what stops a page from silently dropping its card by
 * setting a title.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: absolute(path),
      type,
      locale: "en_GB",
      alternateLocale: "pt_PT",
      siteName: SITE_NAME,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [OG_IMAGE],
    },
  };
}

/**
 * True for contact details that are still stand-ins.
 *
 * A number like +351 912 000 000 is fine sitting in the footer of a site that
 * has not launched. It is not fine inside structured data, which is a claim
 * about a real business that Google will happily print in a knowledge panel
 * next to a "call" button. So the field is omitted until it is real, rather
 * than published as fact.
 */
function isPlaceholder(value: string): boolean {
  return /(\b0{3,}\b|example\.|@example|555[- ]?01)/i.test(value);
}

/** Drops keys whose value is missing or still a stand-in. */
function omitPlaceholders<T extends Record<string, unknown>>(fields: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(fields).filter(
      ([, value]) => typeof value === "string" && !isPlaceholder(value)
    )
  ) as Partial<T>;
}

/**
 * schema.org description of the business.
 *
 * FoodEstablishment is the closest fit that Google actually reads: the work is
 * catering and private chef service, and there is no dining room to describe,
 * so there is no street address and no opening hours. Claiming either would be
 * inventing facts. areaServed carries the "we come to you" part instead.
 */
export function businessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    logo: absolute("/brand/logomark.svg"),
    image: absolute("/opengraph-image"),
    ...omitPlaceholders({
      email: CONTACT_DETAILS.email,
      telephone: CONTACT_DETAILS.phone,
    }),
    servesCuisine: "Portuguese",
    priceRange: "$$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: LOCALITY,
      addressCountry: COUNTRY,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: `${LOCALITY}, Portugal`,
    },
    sameAs: [CONTACT_DETAILS.instagramUrl],
    knowsLanguage: ["en", "pt"],
  };
}

/** Lets the search result show the three routes as a sub-navigation. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: ["en", "pt"],
    publisher: { "@id": `${SITE_URL}/#business` },
  };
}
