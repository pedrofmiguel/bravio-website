import type Lenis from "lenis";

/**
 * Module level handle on the single Lenis instance.
 *
 * The page transition and the preloader both need to lock and reset scrolling,
 * and neither of them sits inside the component that creates Lenis. A tiny
 * singleton is cheaper here than threading a ref through three providers.
 */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis(): Lenis | null {
  return instance;
}

/** Jump to the top without the smooth interpolation, used between routes. */
export function resetScroll() {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
  } else if (typeof window !== "undefined") {
    window.scrollTo(0, 0);
  }
}

export function stopScroll() {
  getLenis()?.stop();
}

export function startScroll() {
  getLenis()?.start();
}

/**
 * A section the *next* route should open on rather than at its top.
 *
 * Set by the link that starts the navigation and read by the arriving page,
 * which are two components with no relationship to each other, so it rides
 * here rather than through the URL. A hash would do the same job and be
 * shareable, but it also makes the browser jump to the anchor before Lenis and
 * ScrollTrigger have set up - the exact fight the rest of the site avoids by
 * keeping in-page targets out of the URL.
 *
 * It is one-shot: whoever reads it takes it. A navigation that never reaches
 * the page holding the section leaves the intent behind rather than firing it
 * at some later, unrelated visit.
 */
let pendingLanding: string | null = null;

export function requestLanding(id: string) {
  pendingLanding = id;
}

/** Reads the pending landing and clears it. */
export function takeLanding(): string | null {
  const id = pendingLanding;
  pendingLanding = null;
  return id;
}
