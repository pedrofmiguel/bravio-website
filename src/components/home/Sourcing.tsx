"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLang } from "@/lib/lang-context";
import { SOURCING } from "@/lib/media";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import Reveal, { RevealLines } from "@/components/ui/Reveal";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * Full bleed produce block.
 *
 * The one place the greens from the brand board carry a whole section. It is
 * deliberate and used once: it marks the shift from what bravio sells to how
 * bravio works, and gives the cream body of the page a floor to land on.
 *
 * The photograph sits behind the type at low opacity with a slow parallax, so
 * the block reads as one surface rather than a card with a picture in it.
 */
export default function Sourcing() {
  const { t, lang } = useLang();
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-sourcing-image]",
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="on-pistou relative overflow-hidden bg-ground text-ink"
    >
      <div
        data-sourcing-image
        aria-hidden="true"
        className="absolute inset-0 scale-115"
      >
        <Image
          src={SOURCING.src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Scrim. Without it the photograph washes the green out entirely and
          the body copy drops below AA against the busy areas of the frame. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-ground/88 mix-blend-multiply"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-ground/45" />

      <div className="relative mx-auto max-w-[1500px] px-5 py-32 sm:px-8 sm:py-44 lg:px-12 lg:py-52">
        <RevealLines
          as="h2"
          resetKey={lang}
          text={t.sourcing.heading}
          className="font-display type-display max-w-[12ch]"
        />
        <Reveal delay={0.15}>
          <p className="type-lead mt-8 max-w-[52ch] text-ink-muted">
            {t.sourcing.body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
