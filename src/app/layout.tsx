import type { Metadata, Viewport } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";

import { LangProvider } from "@/lib/lang-context";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  businessJsonLd,
  websiteJsonLd,
} from "@/lib/site";
import PageTransition from "@/components/layout/PageTransition";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Preloader from "@/components/layout/Preloader";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Grain from "@/components/layout/Grain";
import SkipLink from "@/components/layout/SkipLink";

/**
 * Outfit stands in for Gottora, the display face in the brand guidelines.
 * Gottora is not a free or Google font and no licence file was supplied, so
 * the geometric sans closest to it in proportion is used instead. To swap the
 * real thing in later: drop the woff2 into /public/fonts, replace this with
 * next/font/local, and keep the --font-outfit variable name so nothing else
 * has to change.
 */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Every route sets its own canonical. This is the home page's, and the
  // fallback for anything that forgets.
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Without these Google caps the preview at a thumbnail and a short
      // snippet, which throws away the photography the site is built on.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
    locale: "en_GB",
    alternateLocale: "pt_PT",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  // The phone number in the footer is a real link already; this stops iOS
  // from finding numbers in body copy and turning them blue on its own.
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: "/brand/logomark.svg",
    apple: "/brand/logomark.svg",
  },
};

/**
 * Runs before first paint and decides whether the opening panel should play.
 * Doing this in an effect instead would let the hero paint for a frame before
 * the panel covered it, which is the flash this exists to prevent.
 */
const INTRO_GATE = `(function(){try{
  var seen = sessionStorage.getItem("bravio.intro-seen") === "1";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (seen || reduce) document.documentElement.dataset.intro = "skip";
}catch(e){document.documentElement.dataset.intro="skip";}})();`;

export const viewport: Viewport = {
  themeColor: "#341114",
  // "light", not "light dark": the palette no longer follows the OS, so
  // advertising dark support would only tell the browser to draw form
  // controls and scrollbars for a theme the page never renders. Sections that
  // are fig re-declare the scheme themselves, so their native controls still
  // come out dark.
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${dmSans.variable} antialiased`}
      // INTRO_GATE stamps data-intro on <html> before React hydrates, which is
      // the whole point of it (it has to beat first paint). React then sees an
      // attribute the server did not render and warns about a mismatch. This
      // is the documented escape hatch for exactly that pattern, and it is
      // shallow: it covers attributes on <html> itself, nothing inside.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
        {/* Structured data. Sits in the markup rather than in a Metadata field
            because Next has no metadata key for JSON-LD, and this is the shape
            Google documents. The content is generated from lib/site.ts, so it
            cannot drift from what the footer actually shows. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([businessJsonLd(), websiteJsonLd()]),
          }}
        />
      </head>
      <body>
        <LangProvider>
          <SmoothScroll />
          <Preloader />
          <SkipLink />
          <PageTransition>
            <Header />
            <main id="content">{children}</main>
            <Footer />
          </PageTransition>
          <Grain />
        </LangProvider>
      </body>
    </html>
  );
}
