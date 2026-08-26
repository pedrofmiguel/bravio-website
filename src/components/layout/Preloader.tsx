"use client";

import { useRef } from "react";
import { Logomark, Wordmark } from "@/components/brand/Marks";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { resetScroll, startScroll, stopScroll } from "@/lib/lenis-store";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * First-visit opening.
 *
 * The mark turns into place, the wordmark rises to meet it, then the panel
 * lifts away to hand over to the hero. It runs once per tab: a repeat on every
 * internal navigation would be charming for ten minutes and unbearable after
 * that, and the route transition already carries the brand.
 *
 * The panel is in the server-rendered markup and hidden by CSS when it should
 * not run. That decision is made by the blocking inline script in the document
 * head (see INTRO_GATE in app/layout.tsx), which runs before first paint. The
 * alternative, deciding in an effect, means the hero paints for a frame before
 * the panel drops over it.
 */

export const SEEN_KEY = "bravio.intro-seen";

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    // The head script already decided. Reading its verdict keeps the two in
    // step and means reduced motion is handled in exactly one place.
    if (document.documentElement.dataset.intro === "skip") return;

    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Blocked storage just means the intro plays again next time.
    }

    stopScroll();
    resetScroll();

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        startScroll();
        ScrollTrigger.refresh();
        // The hero entry waits for this so the two never overlap.
        window.dispatchEvent(new Event("bravio:intro-done"));
      },
    });

    tl.fromTo(
      markRef.current,
      { autoAlpha: 0, scale: 0.4, rotate: -110 },
      { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.25 }
    )
      .fromTo(
        wordRef.current,
        { yPercent: 115 },
        { yPercent: 0, duration: 0.9, ease: "power4.out" },
        "-=0.75"
      )
      .fromTo(
        ruleRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.1, ease: "power2.inOut" },
        "-=0.7"
      )
      .to({}, { duration: 0.25 })
      .to([markRef.current, wordRef.current, ruleRef.current], {
        autoAlpha: 0,
        y: -18,
        duration: 0.5,
        ease: "power2.in",
        stagger: 0.04,
      })
      .to(rootRef.current, { yPercent: -100, duration: 1, ease: "power4.inOut" }, "-=0.15")
      .set(rootRef.current, { display: "none" });

    return () => {
      tl.kill();
      startScroll();
    };
  }, []);

  return (
    <div
      id="intro"
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 z-[95] grid place-items-center bg-fig text-creme"
    >
      <div className="flex flex-col items-center gap-7 px-6">
        <div ref={markRef} className="invisible opacity-0">
          <Logomark className="h-[17vmin] min-h-[104px] w-auto" />
        </div>

        <div className="overflow-hidden">
          <div ref={wordRef}>
            <Wordmark className="h-[26px] w-auto sm:h-[34px]" />
          </div>
        </div>

        <span
          ref={ruleRef}
          aria-hidden="true"
          className="block h-px w-[42vw] max-w-[280px] origin-left bg-creme/30"
        />
      </div>
    </div>
  );
}
