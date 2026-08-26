import type { Metadata } from "next";
import ServicesPreview from "@/components/preview/ServicesPreview";

/**
 * TEMPORARY. Lives on the `services-preview` branch only, so it ships to a
 * Vercel preview URL and never to production. Delete the branch, this route
 * and src/components/preview once the services layout is chosen.
 */
export const metadata: Metadata = {
  title: "Services preview",
  robots: { index: false, follow: false },
};

export default function ServicesPreviewPage() {
  return <ServicesPreview />;
}
