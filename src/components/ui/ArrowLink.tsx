"use client";

import type { ReactNode } from "react";
import TransitionLink from "@/components/layout/TransitionLink";
import { getLenis } from "@/lib/lenis-store";
import { prefersReducedMotion } from "@/lib/gsap";

/**
 * The site's only button shape.
 *
 * One radius system across the whole project: interactive elements are full
 * pill, everything else is square.
 *
 * Both variants read their colours from the section tone tokens, so a CTA
 * dropped on a fig block inverts to creme automatically instead of relying on
 * a caller remembering to pass the right classes.
 */

type Variant = "solid" | "outline";

const BASE =
  "group relative inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[0.9rem] font-medium leading-none transition-[background-color,color,opacity,transform] duration-300 disabled:cursor-not-allowed disabled:opacity-55";

const VARIANTS: Record<Variant, string> = {
  solid:
    "bg-cta text-cta-fg hover:opacity-88 active:scale-[0.98] active:opacity-100",
  outline:
    "border border-current text-current hover:bg-current active:scale-[0.98]",
};

function Inner({ children, variant }: { children: ReactNode; variant: Variant }) {
  return (
    <>
      <span
        className={
          variant === "outline"
            ? "relative transition-colors duration-300 group-hover:text-ground"
            : "relative"
        }
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className={`relative text-[1.05em] leading-none transition-transform duration-300 group-hover:translate-x-0.5 ${
          variant === "outline" ? "group-hover:text-ground" : ""
        }`}
      >
        &#8594;
      </span>
    </>
  );
}

export function ArrowLink({
  href,
  children,
  variant = "solid",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <TransitionLink
      href={href}
      className={`${BASE} ${VARIANTS[variant]} ${className ?? ""}`}
    >
      <Inner variant={variant}>{children}</Inner>
    </TransitionLink>
  );
}

/**
 * Same button, pointed at a section of the current page instead of a route.
 *
 * It stays a real anchor with a real href, so it works before hydration, right
 * clicks, and reads to a screen reader as the in-page link it is. Only a plain
 * left click is intercepted, and only to hand the scroll to Lenis - a native
 * jump would skip the interpolation the whole site is tuned around and leave
 * Lenis's internal position out of step with the document's.
 *
 * The URL is deliberately not given the hash. Landing on the page with one
 * makes the browser jump before Lenis and ScrollTrigger have set up, which
 * fights the preloader and leaves every pinned section measured from the wrong
 * place.
 */
export function ArrowAnchor({
  targetId,
  children,
  variant = "solid",
  className,
}: {
  /** id of the element to scroll to, without the #. */
  targetId: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <a
      href={`#${targetId}`}
      onClick={(event) => {
        // Anything but a plain left click stays the browser's business.
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }

        const target = document.getElementById(targetId);
        // No target means the section is not on this page. Let the browser try.
        if (!target) return;

        event.preventDefault();

        const lenis = getLenis();
        if (lenis) {
          lenis.scrollTo(target);
        } else {
          // Lenis is never created under reduced motion, so this is also the
          // reduced-motion path: no smoothing, just go there.
          target.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start",
          });
        }

        // Carry the keyboard along with the viewport, or the next Tab would
        // continue from the hero and walk back down the whole page. focus-visible
        // means a mouse click still shows no ring.
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }}
      className={`${BASE} ${VARIANTS[variant]} ${className ?? ""}`}
    >
      <Inner variant={variant}>{children}</Inner>
    </a>
  );
}

export function ArrowButton({
  children,
  variant = "solid",
  className,
  ...rest
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${className ?? ""}`}
      {...rest}
    >
      <Inner variant={variant}>{children}</Inner>
    </button>
  );
}

/** Quieter text link with a rule that draws in on hover. */
export function UnderlineLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <TransitionLink
      href={href}
      className={`group relative inline-flex w-fit items-center gap-2 pb-1 text-[0.95rem] ${className ?? ""}`}
    >
      {children}
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
        &#8594;
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-100 bg-current opacity-30 transition-opacity duration-300 group-hover:opacity-100"
      />
    </TransitionLink>
  );
}
