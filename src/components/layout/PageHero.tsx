"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * Shared opening block for the secondary pages.
 *
 * Shorter than the home hero and without a photograph, so the route transition
 * resolves straight into type. It still lands on fig, which keeps the columns
 * of the transition and the top of the page the same colour and hides the seam.
 */
export default function PageHero({
  line1,
  line2,
}: {
  line1: string;
  line2: string;
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
    }, root);

    return () => ctx.revert();
  }, [line1, line2]);

  return (
    <section
      ref={rootRef}
      className="on-fig relative flex min-h-[62vh] items-end bg-ground text-ink sm:min-h-[70vh]"
    >
      <div className="mx-auto w-full max-w-[1500px] px-5 pb-16 pt-32 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
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
      </div>

      <div id="hero-sentinel" aria-hidden="true" className="absolute bottom-0 h-px w-full" />
    </section>
  );
}
