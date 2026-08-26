"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLang } from "@/lib/lang-context";
import { GALLERY } from "@/lib/media";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import Reveal from "@/components/ui/Reveal";
import { UnderlineLink } from "@/components/ui/ArrowLink";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * A look into the archive, on the way to the story page.
 *
 * Three frames at different heights, each drifting at its own rate. Motivated:
 * the differing speeds separate the images into planes, which is what stops a
 * three image row reading as a stock gallery strip.
 */

const FRAMES = [
  { media: GALLERY[0], speed: -50, className: "col-span-6 lg:col-span-4 aspect-4/5" },
  {
    media: GALLERY[3],
    speed: 34,
    className: "col-span-6 lg:col-span-4 aspect-4/5 lg:mt-28",
  },
  {
    media: GALLERY[5],
    speed: -22,
    className: "col-span-12 lg:col-span-4 aspect-3/2 lg:aspect-4/5 lg:mt-10",
  },
];

export default function GalleryTeaser() {
  const { t } = useLang();
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-frame]").forEach((frame) => {
        const speed = Number(frame.dataset.speed ?? 0);
        // The frame stays put and the oversized image drifts inside it, so
        // neighbouring frames never collide as they scroll.
        gsap.fromTo(
          frame.querySelector("[data-frame-inner]"),
          { yPercent: -speed / 8 },
          {
            yPercent: speed / 8,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="mx-auto max-w-[1500px] px-5 py-28 sm:px-8 sm:py-36 lg:px-12 lg:py-44"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <Reveal>
          <h2 className="font-display type-title max-w-[16ch]">
            {t.galleryTeaser.heading}
          </h2>
          <p className="mt-4 max-w-[42ch] text-[0.98rem] text-ink-muted">
            {t.galleryTeaser.body}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <UnderlineLink href="/story">{t.cta.work}</UnderlineLink>
        </Reveal>
      </div>

      <div className="mt-16 grid grid-cols-12 gap-4 sm:gap-6 lg:mt-24">
        {FRAMES.map((frame, i) => (
          <div key={i} className={frame.className}>
            <Reveal delay={i * 0.08} distance={40} className="h-full">
              <div
                data-frame
                data-speed={frame.speed}
                className="group relative h-full w-full overflow-hidden"
              >
                {/* Taller than the frame so the drift never exposes an edge. */}
                <div data-frame-inner className="absolute inset-x-0 -inset-y-[9%]">
                  <Image
                    src={frame.media.src}
                    alt={frame.media.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 32vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-brand)] group-hover:scale-105"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}
