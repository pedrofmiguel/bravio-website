"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect on the client, useEffect on the server.
 *
 * Every GSAP setup in this project runs through this rather than useEffect,
 * and the reason is a real crash rather than a style preference.
 *
 * React runs `useEffect` destroy functions AFTER it has removed the deleted
 * DOM nodes. Anything that reparents a React-owned node (ScrollTrigger's
 * `pin: true` wraps the pinned element in a pin-spacer) therefore leaves React
 * holding a stale parent, and unmounting the route throws
 * "removeChild: The node to be removed is not a child of this node",
 * which takes the whole page down to the error boundary.
 *
 * `useLayoutEffect` cleanups run during the mutation phase, before those
 * removals, so gsap.context().revert() restores the DOM in time.
 *
 * The plain useEffect fallback only ever runs during SSR, where there is no
 * DOM to tear down and React would otherwise warn.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
