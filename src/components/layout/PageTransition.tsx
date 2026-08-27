"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Logomark } from "@/components/brand/Marks";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { resetScroll, startScroll, stopScroll } from "@/lib/lenis-store";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * Branded route transition.
 *
 * A single fig veil dissolves over the outgoing page while the logomark settles
 * into the centre, the route swaps behind it, then the veil dissolves away.
 *
 * This replaced a sweep of six columns that rose up the screen. The columns
 * were legible as separate rectangles - staggered, with visible edges between
 * them - and read as machinery rather than as the page changing. One veil
 * moving on opacity has no edges to notice, so the eye stays on the mark.
 *
 * Why the transition exists at all: it is the one moment the mark is shown at
 * full scale, so it doubles as the brand signature, and it covers the layout
 * shift of a fresh route mounting. That is why the router push waits for the
 * veil to reach full opacity rather than racing it.
 */

/** Long and symmetric. Nothing in the transition should arrive sharply. */
const EASE = "power2.inOut";

type TransitionValue = { navigate: (href: string) => void; isBusy: boolean };

const TransitionContext = createContext<TransitionValue | null>(null);

export function useTransition(): TransitionValue {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be used inside <PageTransition>");
  return ctx;
}

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const rootRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  // A navigation is in flight. Guards against double clicks mid-timeline.
  const busyRef = useRef(false);
  // Distinguishes a real navigation from the first mount, which must not play
  // a reveal (the preloader owns the opening moment instead).
  const pendingRef = useRef(false);
  const [isBusy, setIsBusy] = useState(false);

  const navigate = useCallback(
    (href: string) => {
      if (busyRef.current) return;
      if (href === pathname) return;

      if (prefersReducedMotion()) {
        router.push(href);
        return;
      }

      busyRef.current = true;
      pendingRef.current = true;
      setIsBusy(true);

      if (!rootRef.current || !veilRef.current) {
        router.push(href);
        return;
      }

      stopScroll();
      rootRef.current.style.pointerEvents = "auto";

      gsap
        .timeline()
        .set(rootRef.current, { autoAlpha: 1 })
        // The veil comes up on opacity alone. A faint scale on the way in
        // gives it somewhere to settle, so it reads as a plane arriving
        // rather than the screen dimming.
        .fromTo(
          veilRef.current,
          { autoAlpha: 0, scale: 1.04 },
          { autoAlpha: 1, scale: 1, duration: 0.62, ease: EASE }
        )
        .fromTo(
          markRef.current,
          { autoAlpha: 0, scale: 0.94 },
          { autoAlpha: 1, scale: 1, duration: 0.55, ease: "power2.out" },
          "-=0.34"
        )
        .call(() => router.push(href));
    },
    [pathname, router]
  );

  // Runs once the new route has mounted. Plays the second half of the veil.
  useIsomorphicLayoutEffect(() => {
    if (!pendingRef.current) return;
    pendingRef.current = false;

    if (!rootRef.current || !veilRef.current) return;

    resetScroll();

    const tl = gsap.timeline({
      onComplete: () => {
        if (rootRef.current) {
          rootRef.current.style.pointerEvents = "none";
          gsap.set(rootRef.current, { autoAlpha: 0 });
        }
        gsap.set([veilRef.current, markRef.current], { clearProps: "all" });
        busyRef.current = false;
        setIsBusy(false);
        startScroll();
        // New DOM means every pinned section needs re-measuring.
        ScrollTrigger.refresh();
      },
    });

    // The mark keeps drifting toward the viewer as it leaves, so the exit
    // continues the entrance instead of reversing it.
    tl.to(markRef.current, {
      autoAlpha: 0,
      scale: 1.06,
      duration: 0.42,
      ease: "power2.in",
    })
      .to(
        veilRef.current,
        { autoAlpha: 0, scale: 1.03, duration: 0.72, ease: EASE },
        "-=0.26"
      );

    return () => {
      tl.kill();
    };
  }, [pathname]);

  return (
    <TransitionContext.Provider value={{ navigate, isBusy }}>
      {children}

      <div
        ref={rootRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[90] invisible opacity-0"
      >
        {/* bg-fig rather than a themed token: the veil has to be the same
            colour in light and dark. */}
        <div ref={veilRef} className="absolute inset-0 bg-fig" />

        <div className="absolute inset-0 grid place-items-center">
          <div ref={markRef} className="invisible opacity-0">
            <Logomark className="h-[30vmin] min-h-[150px] w-auto text-creme" />
          </div>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
