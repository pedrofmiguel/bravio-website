"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLang } from "@/lib/lang-context";
import { COURSES } from "@/lib/media";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { Logomark, Wordmark } from "@/components/brand/Marks";
import { ArrowLink } from "@/components/ui/ArrowLink";

/**
 * VARIANT B: brand led.
 *
 * The mark and wordmark carry the opening, with one line of copy under them.
 * A band of plates runs along the bottom edge, cropped by the fold, so the
 * page still opens on food rather than on a logo alone.
 *
 * The band matters: without it this is the preloader a second time. With it,
 * the brand states itself and the work is already visible underneath.
 */
export default function HeroBrand() {
  const { t, lang } = useLang();
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      root.querySelectorAll("[data-anim]").forEach((el) => el.classList.add("is-ready"));
      return;
    }

    let ctx: gsap.Context | null = null;

    const play = () => {
      ctx = gsap.context(() => {
        gsap.set("[data-anim]", { visibility: "visible" });
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.fromTo(
          "[data-brand-mark]",
          { autoAlpha: 0, scale: 0.72, rotate: -50 },
          { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.4, ease: "power3.out" }
        )
          .fromTo(
            "[data-brand-word]",
            { yPercent: 115 },
            { yPercent: 0, duration: 1.1 },
            "-=0.95"
          )
          .fromTo(
            "[data-brand-fade]",
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1, stagger: 0.1 },
            "-=0.7"
          )
          .fromTo(
            "[data-brand-plate]",
            { yPercent: 40, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 1.2, stagger: 0.07 },
            "-=0.85"
          );
      }, root);
    };

    let settled = false;
    const start = () => {
      if (settled) return;
      settled = true;
      play();
    };
    window.addEventListener("bravio:intro-done", start, { once: true });
    const timer = window.setTimeout(start, 120);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("bravio:intro-done", start);
      ctx?.revert();
    };
  }, [lang]);

  return (
    <section
      ref={rootRef}
      className="on-fig relative flex min-h-[100dvh] flex-col justify-between overflow-hidden bg-ground text-ink"
    >
      <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col items-center justify-center px-5 pb-10 pt-24 text-center sm:px-8 lg:px-12">
        <div data-anim data-brand-mark className="invisible">
          <Logomark className="h-[13vmin] min-h-[76px] w-auto" />
        </div>

        <div className="mt-7 overflow-hidden">
          <div data-anim data-brand-word className="invisible">
            <Wordmark className="h-[clamp(2rem,5.2vw,4.25rem)] w-auto" title="bravio" />
          </div>
        </div>

        <p
          data-anim
          data-brand-fade
          className="type-lead invisible mt-8 max-w-[42ch] text-balance text-ink-muted"
        >
          {t.hero.sub}
        </p>

        <div
          data-anim
          data-brand-fade
          className="invisible mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <ArrowLink href="/contact">{t.cta.book}</ArrowLink>
          <ArrowLink href="/story" variant="outline">
            {t.cta.work}
          </ArrowLink>
        </div>
      </div>

      {/* Plates cropped by the fold. Enough to read as food, not enough to
          compete with the mark. */}
      <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
        {COURSES.slice(0, 4).map((media) => (
          <div
            key={media.src}
            data-anim
            data-brand-plate
            className="invisible relative h-[18vh] min-h-[110px] overflow-hidden sm:h-[22vh]"
          >
            <Image
              src={media.src}
              alt={media.alt}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div id="hero-sentinel" aria-hidden="true" className="absolute bottom-0 h-px w-full" />
    </section>
  );
}
