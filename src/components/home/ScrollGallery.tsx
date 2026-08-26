"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLang } from "@/lib/lang-context";
import { ASPECT_RATIO, GALLERY } from "@/lib/media";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { UnderlineLink } from "@/components/ui/ArrowLink";

/**
 * The archive, panned sideways by vertical scroll.
 *
 * The section pins and the track slides horizontally as the page is scrubbed,
 * so the whole archive passes the eye without the reader leaving the flow.
 * Motivated: it is a lot of images that want to be seen in sequence, and a
 * vertical grid of twelve would eat four screens of page.
 *
 * Frames keep a common height and take their width from the photograph's own
 * ratio, so the rhythm of the row comes from the pictures rather than from a
 * uniform card size.
 *
 * Desktop only, via gsap.matchMedia. On touch, and under reduced motion, the
 * same markup is simply a native horizontally scrollable rail with snap
 * points, which is better on a phone than any hijack would be.
 *
 * Note on pinning: this reintroduces ScrollTrigger's pin-spacer, which is the
 * thing that used to crash route changes. It is safe now only because setup
 * runs in useLayoutEffect (see lib/use-isomorphic-layout-effect.ts), so the
 * revert lands before React removes the node. `npm run verify:nav` covers it.
 */

const FRAME_HEIGHT_VH = 54;

export default function ScrollGallery() {
  const { t } = useLang();
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || prefersReducedMotion()) return;

    const mm = gsap.matchMedia(root);

    mm.add("(min-width: 1024px) and (pointer: fine)", () => {
      const distance = () => track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          // Scroll length equals the horizontal travel, so the pan tracks the
          // wheel one to one rather than racing or lagging it.
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative overflow-hidden">
      <div className="flex min-h-[100dvh] flex-col justify-center py-24 lg:py-0">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display type-title max-w-[16ch]">
                {t.galleryTeaser.heading}
              </h2>
              <p className="mt-4 max-w-[42ch] text-[0.98rem] text-ink-muted">
                {t.galleryTeaser.body}
              </p>
            </div>
            <UnderlineLink href="/story">{t.cta.work}</UnderlineLink>
          </div>
        </div>

        {/* On desktop GSAP translates this track. Everywhere else it is a
            plain scroll rail, which is why the overflow and snap live here. */}
        <div
          className="mt-12 w-full overflow-x-auto lg:mt-16 lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div
            ref={trackRef}
            className="flex w-max items-center gap-4 px-5 sm:gap-6 sm:px-8 lg:px-12"
          >
            {GALLERY.map((media) => (
              <figure
                key={media.src}
                className="group relative shrink-0 snap-center overflow-hidden bg-ink/5"
                style={{
                  height: `${FRAME_HEIGHT_VH}vh`,
                  // Width follows the photograph's own ratio, so the row is
                  // paced by the pictures instead of by a uniform card.
                  width: `${FRAME_HEIGHT_VH * ASPECT_RATIO[media.aspect]}vh`,
                }}
              >
                <Image
                  src={media.src}
                  alt={media.alt}
                  fill
                  sizes="(max-width: 1024px) 70vw, 40vw"
                  className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-brand)] group-hover:scale-[1.04]"
                />
              </figure>
            ))}
          </div>
        </div>

        {/* Position along the track. A line rather than a counter: it says
            where you are without pretending to be a control. */}
        <div className="mx-auto mt-10 hidden w-full max-w-[1500px] px-5 sm:px-8 lg:block lg:px-12">
          <span className="block h-px w-full bg-rule">
            <span
              ref={progressRef}
              className="block h-px w-full origin-left scale-x-0 bg-ink"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
