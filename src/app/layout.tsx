import type { Metadata, Viewport } from "next";
import { DM_Sans, Outfit } from "next/font/google";
import "./globals.css";

import { LangProvider } from "@/lib/lang-context";
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
  metadataBase: new URL("https://bravio.pt"),
  title: {
    default: "bravio | Private chef and catering",
    template: "%s | bravio",
  },
  description:
    "Private chef and catering for dinners, celebrations and events. Menus built around your table, cooked in your kitchen.",
  openGraph: {
    title: "bravio | Private chef and catering",
    description:
      "Private chef and catering for dinners, celebrations and events. Menus built around your table, cooked in your kitchen.",
    type: "website",
    locale: "en_GB",
    alternateLocale: "pt_PT",
    siteName: "bravio",
  },
  icons: {
    icon: "/brand/logomark.svg",
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
  colorScheme: "light dark",
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
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
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
