"use client";

import { useLang } from "@/lib/lang-context";
import PageHero from "@/components/layout/PageHero";
import ContactSection from "./ContactSection";

/**
 * Contact page. The enquiry block is the same component the home page uses,
 * with its own label suppressed because the page heading already covers it.
 */
export default function ContactContent() {
  const { t } = useLang();

  return (
    <>
      <PageHero
        line1={t.contactPage.heroLine1}
        line2={t.contactPage.heroLine2}
      />
      <ContactSection showLabel={false} />
    </>
  );
}
