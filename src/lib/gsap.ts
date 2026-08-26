/**
 * Single GSAP entry point.
 *
 * Registering plugins in more than one module double-registers them and makes
 * ScrollTrigger refresh order unpredictable, so every animated component
 * imports gsap and ScrollTrigger from here and nowhere else.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Module scope runs once per bundle, so this is enough to keep registration
// and the global defaults from being applied twice.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // The brand moves slowly and settles. One curve, used everywhere.
  gsap.defaults({ ease: "power3.out", duration: 1 });

  // ScrollTrigger measures against the real viewport, not the visual one, so
  // mobile URL-bar collapse does not re-trigger every pinned section.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger };

/** True when the visitor has asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
