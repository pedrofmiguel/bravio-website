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
 * Six fig coloured columns sweep up over the outgoing page, the logomark turns
 * into place at the centre, the route swaps behind the cover, then the columns
 * carry on upward to reveal the new page.
 *
 * Why it is worth the machinery: the transition is the one moment where the
 * mark is shown at full scale, so it doubles as the brand signature. It also
 * hides the layout shift of a fresh route mounting, which is why the router
 * push waits for the cover to finish rather than racing it.
 */

const COLUMNS = 6;

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
  const columnsRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  // A navigation is in flight. Guards against double clicks mid-timeline.
  const busyRef = useRef(false);
  // Distinguishes a real navigation from the first mount, which must not play
  // a reveal (the preloader owns the opening moment instead).
  const pendingRef = useRef(false);
  const [isBusy, setIsBusy] = useState(false);

  // Park the columns below the fold up front. Setting this from GSAP rather
  // than a Tailwind class means GSAP owns the transform from the first frame
  // and never has to parse a matrix it did not write.
  useIsomorphicLayoutEffect(() => {
    const columns = columnsRef.current?.children;
    if (columns) gsap.set(columns, { yPercent: 100 });
  }, []);

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

      const columns = columnsRef.current?.children;
      if (!rootRef.current || !columns) {
        router.push(href);
        return;
      }

      stopScroll();
      rootRef.current.style.pointerEvents = "auto";

      gsap
        .timeline({ defaults: { ease: "power4.inOut" } })
        .set(rootRef.current, { autoAlpha: 1 })
        // Columns start parked below the fold and rise to fill the screen.
        .to(columns, {
          yPercent: 0,
          duration: 0.75,
          stagger: { each: 0.055, from: "start" },
        })
        .fromTo(
          markRef.current,
          { autoAlpha: 0, scale: 0.55, rotate: -75 },
          { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.7, ease: "power3.out" },
          "-=0.45"
        )
        .call(() => router.push(href));
    },
    [pathname, router]
  );

  // Runs once the new route has mounted. Plays the second half of the sweep.
  useIsomorphicLayoutEffect(() => {
    if (!pendingRef.current) return;
    pendingRef.current = false;

    const columns = columnsRef.current?.children;
    if (!rootRef.current || !columns) return;

    resetScroll();

    const tl = gsap.timeline({
      defaults: { ease: "power4.inOut" },
      onComplete: () => {
        if (rootRef.current) {
          rootRef.current.style.pointerEvents = "none";
          gsap.set(rootRef.current, { autoAlpha: 0 });
        }
        // Columns wait below the fold, ready for the next navigation.
        gsap.set(columns, { yPercent: 100 });
        busyRef.current = false;
        setIsBusy(false);
        startScroll();
        // New DOM means every pinned section needs re-measuring.
        ScrollTrigger.refresh();
      },
    });

    tl.to(markRef.current, {
      autoAlpha: 0,
      scale: 1.25,
      duration: 0.45,
      ease: "power2.in",
    })
      // They carry on in the same direction rather than retreating, so the
      // sweep reads as one continuous movement across the route change.
      .to(
        columns,
        {
          yPercent: -100,
          duration: 0.8,
          stagger: { each: 0.055, from: "start" },
        },
        "-=0.2"
      )
      .set(markRef.current, { clearProps: "all" });

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
        <div ref={columnsRef} className="absolute inset-0 flex">
          {Array.from({ length: COLUMNS }).map((_, i) => (
            <div
              key={i}
              className="h-full flex-1 bg-fig"
              // A hair of overlap stops sub-pixel seams showing between columns.
              style={{ marginRight: i === COLUMNS - 1 ? 0 : "-1px" }}
            />
          ))}
        </div>

        <div className="absolute inset-0 grid place-items-center">
          <div ref={markRef} className="invisible opacity-0">
            <Logomark className="h-[30vmin] min-h-[150px] w-auto text-creme" />
          </div>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
