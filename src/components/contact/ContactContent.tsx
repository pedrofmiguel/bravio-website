"use client";

import { useLang } from "@/lib/lang-context";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { getLenis, takeLanding } from "@/lib/lenis-store";
import PageHero from "@/components/layout/PageHero";
import ContactSection from "./ContactSection";

/** Shared with the link that asks to open here. */
const ENQUIRY_ID = "enquiry";

/**
 * Contact page. The enquiry block is the same component the home page uses,
 * with its own label suppressed because the page heading already covers it.
 */
export default function ContactContent() {
  const { t } = useLang();

  // A link can ask this page to open on the form rather than at the page
  // heading - the hero CTA does, since "reserve" is a request to fill the form
  // in, not to read the page.
  //
  // The work is deferred one frame on purpose. PageTransition resets the
  // scroll to the top in its own layout effect, and a parent's effect runs
  // *after* this one, so anything done here synchronously would be undone a
  // moment later. A frame later is still well inside the veil, so the move is
  // never seen: the page is simply already on the form when the veil lifts.
  useIsomorphicLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      // Claimed inside the frame rather than outside it: in development React
      // mounts effects twice, and taking the id in the effect body would spend
      // it on the run whose cleanup cancels this.
      if (takeLanding() !== ENQUIRY_ID) return;

      const target = document.getElementById(ENQUIRY_ID);
      if (!target) return;

      const lenis = getLenis();
      if (lenis) {
        // force, because the transition holds Lenis stopped until the veil is
        // gone. immediate, because this is where the page opens - a smooth
        // scroll here would be a journey the visitor never sees the start of.
        lenis.scrollTo(target, { immediate: true, force: true });
      } else {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      }

      // Bring the keyboard with the viewport, or the next Tab would start back
      // at the header and walk down the whole page. The section takes focus
      // rather than the first field: focusing an input here would throw up the
      // keyboard on a phone before the visitor has read anything.
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <PageHero
        line1={t.contactPage.heroLine1}
        line2={t.contactPage.heroLine2}
      />
      <ContactSection id={ENQUIRY_ID} showLabel={false} />
    </>
  );
}
