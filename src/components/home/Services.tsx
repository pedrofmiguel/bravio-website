"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLang } from "@/lib/lang-context";
import { SERVICE_MEDIA } from "@/lib/media";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * The three offerings, as a sticky stack.
 *
 * Each panel sticks and the one behind settles back as the next arrives.
 * Motivated: the three services are alternatives, not steps, and stacking makes
 * the reader weigh one at a time instead of comparing three cards at a glance.
 *
 * Smoothness notes, since this section was rough on the first pass:
 *
 *  - The panel is exactly `h-[100dvh]`, not `min-h` plus padding. A sticky
 *    element taller than the viewport only sticks once its bottom edge is
 *    reached, so the previous height mismatch (pt-20 at sm against a fixed
 *    4rem subtraction) meant the panels never held still.
 *  - `scrub: 1` rather than `true`. A 1:1 mapping steps visibly under Lenis;
 *    a one second catch-up smooths it into the interpolated scroll.
 *  - The stack is desktop only, via gsap.matchMedia. On a phone the cards are
 *    taller than the viewport no matter what, so they simply flow.
 *
 * Sticking is CSS. GSAP only scrubs transform and opacity, so nothing here
 * touches layout or reparents a node.
 */
export default function Services() {
  const { t } = useLang();
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);

    mm.add("(min-width: 1024px)", () => {
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", root);

      panels.forEach((panel, i) => {
        if (i === panels.length - 1) return;

        gsap.to(panel.querySelector("[data-panel-inner]"), {
          scale: 0.93,
          yPercent: -2.5,
          opacity: 0.4,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            // Driven by the arrival of the next panel, so the outgoing card
            // recedes exactly as the incoming one covers it.
            trigger: panels[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <h2 className="type-label text-ink-muted">{t.services.label}</h2>
      </div>

      <div className="relative mt-8 flex flex-col gap-16 lg:mt-0 lg:block lg:gap-0">
        {t.services.items.map((item, i) => (
          <article
            key={item.title}
            data-panel
            className="lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:items-center"
          >
            <div
              data-panel-inner
              className="mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12"
            >
              <div className="on-fig grid grid-cols-1 overflow-hidden bg-ground text-ink lg:grid-cols-2">
                <div className="relative aspect-16/10 w-full lg:aspect-auto lg:min-h-[68vh]">
                  <Image
                    src={SERVICE_MEDIA[i].src}
                    alt={SERVICE_MEDIA[i].alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col justify-center gap-8 p-7 sm:p-10 lg:p-14">
                  <div>
                    <h3 className="font-display type-title max-w-[14ch]">
                      {item.title}
                    </h3>
                    <p className="mt-5 max-w-[44ch] text-[1rem] leading-relaxed text-ink-muted">
                      {item.body}
                    </p>
                  </div>

                  <p className="type-label text-ink-muted">{item.meta}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
