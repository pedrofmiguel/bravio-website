"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLang } from "@/lib/lang-context";
import { SERVICE_MEDIA } from "@/lib/media";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * SERVICES, OPTION 1: media led, sticky stack retained.
 *
 * The problem with the split card was dead space. Half of a very large slab
 * was fig holding four short lines, so the copy looked marooned and the card
 * looked unbalanced. Nothing was wrong with the stack itself.
 *
 * So the photograph now fills the whole card and the copy sits on it, bottom
 * left, over a scrim that only exists where the text is. No empty half, the
 * image gets the full width it deserves, and the section reads as media with
 * words on it rather than a picture bolted to a text panel.
 */
export default function ServicesMedia() {
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
              <div className="on-fig relative aspect-4/5 w-full overflow-hidden text-ink sm:aspect-16/10 lg:aspect-auto lg:h-[74vh]">
                <Image
                  src={SERVICE_MEDIA[i].src}
                  alt={SERVICE_MEDIA[i].alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 90vw"
                  className="object-cover"
                />

                {/* Scrim only under the copy, angled off before the midpoint so
                    the photograph is never dimmed across its whole width. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-fig via-fig/70 to-transparent lg:bg-gradient-to-r lg:from-fig/95 lg:via-fig/60 lg:to-transparent"
                />

                <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 lg:inset-y-0 lg:right-auto lg:flex lg:w-[52%] lg:flex-col lg:justify-end lg:p-14">
                  <h3 className="font-display type-title max-w-[13ch]">
                    {item.title}
                  </h3>
                  <p className="mt-5 max-w-[42ch] text-[1rem] leading-relaxed text-creme/75">
                    {item.body}
                  </p>
                  <p className="type-label mt-7 text-creme/55">{item.meta}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
