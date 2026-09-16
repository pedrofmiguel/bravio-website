"use client";

import { Fragment, useRef, type ElementType } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * Text paced to the scroll.
 *
 * Words lift from muted to full ink as the block crosses the viewport, so
 * reading speed is tied to scrolling speed. Reserved for passages that ask to
 * be read rather than scanned: the home statement and the story intro.
 *
 * Words are wrapped once on render and only their opacity is scrubbed, so the
 * scroll handler never touches layout. Each entry in `lines` is set as its own
 * block line.
 */
export default function ScrollLit({
  lines,
  as: Tag = "p",
  className,
  resetKey,
  start = "top 72%",
  end = "bottom 62%",
}: {
  lines: string[];
  as?: ElementType;
  className?: string;
  /** Change this to rebuild the scrub, e.g. on language switch. */
  resetKey?: string | number;
  start?: string;
  end?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.classList.add("is-ready");
      return;
    }

    const words = Array.from(el.querySelectorAll("[data-word]"));
    // Measured against the enclosing section, padding included, so the sweep
    // spans the whole block the reader is scrolling through.
    const trigger = el.closest("section") ?? el;

    const ctx = gsap.context(() => {
      gsap.set(el, { visibility: "visible" });
      gsap.fromTo(
        words,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.5,
          scrollTrigger: { trigger, start, end, scrub: 0.6 },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [resetKey, start, end]);

  return (
    <Tag ref={ref} data-anim className={className}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="block">
          {line.split(" ").map((word, wordIndex) => (
            // The space sits outside the word: trailing whitespace inside an
            // inline-block is trimmed, which runs the words together and
            // leaves the line nowhere to wrap.
            <Fragment key={wordIndex}>
              <span data-word className="inline-block">
                {word}
              </span>{" "}
            </Fragment>
          ))}
        </span>
      ))}
    </Tag>
  );
}
