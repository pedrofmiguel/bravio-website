import type { Metadata } from "next";
import NotFoundContent from "@/components/layout/NotFoundContent";

/** Nothing here is worth a search result, and a 404 that gets indexed is a
 *  404 that shows up in someone's search for the brand. */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundContent />;
}
