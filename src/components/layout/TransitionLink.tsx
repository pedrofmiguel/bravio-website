"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useTransition } from "./PageTransition";

type Props = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * An internal link that hands navigation to the branded transition.
 *
 * It stays a real <Link>, so the href is in the markup for crawlers, middle
 * click and "open in new tab" all behave, and Next still prefetches the route.
 * Only a plain left click is intercepted.
 */
export default function TransitionLink({
  href,
  onClick,
  children,
  ...rest
}: Props) {
  const { navigate } = useTransition();

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        // Let the browser handle anything that is not a plain left click.
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }

        event.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
