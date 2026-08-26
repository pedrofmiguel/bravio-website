"use client";

import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis-store";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * Lenis drives the whole page.
 *
 * The brief asked for a slow scroll, so the interpolation is deliberately
 * heavier than the Lenis default (lerp 0.1) and the wheel is geared down. This
 * is the single biggest lever on how expensive the site feels, so it is worth
 * treating as a design value rather than a config default.
 *
 * Lenis is driven from GSAP's ticker rather than its own rAF loop: two loops
 * fighting over the same frame is where scroll jitter comes from.
 */
export default function SmoothScroll() {
  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      lerp: 0.075,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.4,
      // Touch devices already interpolate natively and fight Lenis if it also
      // takes over, so it stays on wheel and keyboard only.
      syncTouch: false,
    });

    setLenis(lenis);

    // Keep ScrollTrigger's idea of scroll position in step with Lenis.
    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
