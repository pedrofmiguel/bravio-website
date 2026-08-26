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
