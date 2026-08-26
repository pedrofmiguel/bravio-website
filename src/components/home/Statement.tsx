"use client";

import { useRef } from "react";
import { useLang } from "@/lib/lang-context";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * The brand statement, paced to the scroll.
 *
 * Words lift from muted to full ink as the section crosses the viewport, so
 * reading speed is tied to scrolling speed. Motivated: this is the one passage
 * on the page that is asking to be read rather than scanned, and slowing the
 * reader down is exactly what the section is for.
 *
 * Words are wrapped once on mount and only their colour is scrubbed, so the
 * scroll handler never touches layout.
 */
export default function Statement() {
  const { t, lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const text = textRef.current;
    if (!root || !text) return;

    if (prefersReducedMotion()) {
      text.classList.add("is-ready");
      return;
    }

    const words = Array.from(text.querySelectorAll("[data-word]"));

    const ctx = gsap.context(() => {
      gsap.set(text, { visibility: "visible" });
      gsap.fromTo(
        words,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.5,
          scrollTrigger: {
            trigger: root,
            start: "top 72%",
            end: "bottom 62%",
            scrub: 0.6,
          },
        }
      );
    }, root);

    return () => ctx.revert();
  }, [lang]);

  return (
    <section
      ref={rootRef}
      className="mx-auto max-w-[1500px] px-5 py-32 sm:px-8 sm:py-44 lg:px-12 lg:py-56"
    >
      <p
        ref={textRef}
        data-anim
        className="font-display type-display max-w-[19ch] text-balance sm:max-w-[22ch]"
      >
        {t.statement.lines.map((line, lineIndex) => (
          <span key={lineIndex} className="block">
            {line.split(" ").map((word, wordIndex) => (
              <span key={wordIndex} data-word className="inline-block">
                {word}
                {" "}
              </span>
            ))}
          </span>
        ))}
      </p>
    </section>
  );
}
