"use client";

import { useSyncExternalStore } from "react";

/**
 * Reactive `prefers-reduced-motion`.
 *
 * The media query is a genuine external store, so subscribing to it is both
 * the idiomatic React shape and better behaviour: a visitor who turns the OS
 * setting on mid-session gets the static layout without reloading.
 *
 * For one-shot checks inside GSAP setup, use prefersReducedMotion() from
 * lib/gsap instead. This hook is for components that render differently.
 */

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** The server cannot know, so it assumes motion is fine and the client corrects. */
function getServerSnapshot() {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
