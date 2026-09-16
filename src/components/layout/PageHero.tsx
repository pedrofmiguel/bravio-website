"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import type { Media } from "@/lib/media";

/**
 * Shared opening block for the secondary pages.
 *
 * Shorter than the home hero, so the route transition resolves straight into
 * type. It still lands on fig, which keeps the columns of the transition and
 * the top of the page the same colour and hides the seam.
 *
 * `media` is optional. Without it the block is type only (contact). With it
 * the photograph stands beside the headline in its own upright frame rather
 * than behind it: type over faces reads as neither.
 */
export default function PageHero({
  line1,
  line2,
  media,
}: {
  line1: string;
  line2: string;
  media?: Media;
}) {
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      root.querySelectorAll("[data-anim]").forEach((el) =>
        el.classList.add("is-ready")
      );
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set("[data-anim]", { visibility: "visible" });
      gsap.fromTo(
        "[data-page-line]",
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 1.25,
          ease: "power4.out",
          stagger: 0.1,
          // The route transition is still clearing the screen at this point.
          delay: 0.35,
        }
      );

      if (root.querySelector("[data-page-media]")) {
        gsap.fromTo(
          "[data-page-media]",
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.5,
            ease: "power4.out",
            delay: 0.45,
          }
        );
        gsap.fromTo(
          "[data-page-media] img",
          { scale: 1.15 },
          { scale: 1, duration: 1.9, ease: "power3.out", delay: 0.45 }
        );
      }
    }, root);

    return () => ctx.revert();
  }, [line1, line2, media?.src]);

  const heading = (
    <h1 className="font-display type-hero">
      <span className="line-mask">
        <span data-anim data-page-line className="block">
          {line1}
        </span>
      </span>
      <span className="line-mask">
        <span data-anim data-page-line className="block">
          {line2}
        </span>
      </span>
    </h1>
  );

  return (
    <section
      ref={rootRef}
      className="on-fig relative flex min-h-[62vh] items-end bg-ground text-ink sm:min-h-[70vh]"
    >
      <div className="mx-auto w-full max-w-[1500px] px-5 pb-16 pt-32 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
        {media ? (
          <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">{heading}</div>

            <div className="lg:col-span-5 lg:col-start-8">
              <div
                data-anim
                data-page-media
                // Narrower than the column on phones, so a 2:3 frame does not
                // turn the hero into two screens of scrolling.
                className="relative mx-auto aspect-2/3 w-[78%] max-w-[26rem] overflow-hidden sm:w-[60%] lg:mx-0 lg:ml-auto lg:w-full"
              >
                <Image
                  src={media.src}
                  alt={media.alt}
                  fill
                  preload
                  sizes="(max-width: 640px) 78vw, (max-width: 1024px) 60vw, 26rem"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        ) : (
          heading
        )}
      </div>

      <div id="hero-sentinel" aria-hidden="true" className="absolute bottom-0 h-px w-full" />
    </section>
  );
}
