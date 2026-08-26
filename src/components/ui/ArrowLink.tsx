"use client";

import type { ReactNode } from "react";
import TransitionLink from "@/components/layout/TransitionLink";

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
