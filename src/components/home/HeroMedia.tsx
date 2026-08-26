"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLang } from "@/lib/lang-context";
import { HERO } from "@/lib/media";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { Logomark } from "@/components/brand/Marks";
import { ArrowLink } from "@/components/ui/ArrowLink";

/**
 * VARIANT C: mark plus message, media full bleed.
 *
 * Keeps the headline doing the selling, adds the logomark as a small crest
 * above it, and takes the photograph full height to the right edge instead of
 * floating it in a box with gutters. The gutter is what made the original read
 * as unfinished: a photo with air on three sides and a bleed on none.
 *
 * The mark also sits large and very quiet behind the type, at creme 5%, which
 * gives the fig field some texture without another colour entering the page.
 */
export default function HeroMedia() {
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
          "[data-hero-crest]",
          { autoAlpha: 0, scale: 0.6, rotate: -60 },
          { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.2, ease: "power3.out" }
        )
          .fromTo(
            "[data-hero-line]",
            { yPercent: 115 },
            { yPercent: 0, duration: 1.3, stagger: 0.11 },
            "-=0.9"
          )
          .fromTo(
            "[data-hero-image]",
            { clipPath: "inset(0% 0% 100% 0%)", scale: 1.15 },
            { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.7, ease: "power3.inOut" },
            0.3
          )
          .fromTo(
            "[data-hero-fade]",
            { y: 22, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1, stagger: 0.1 },
            "-=1"
          );

        gsap.to("[data-hero-image] img", {
          yPercent: 10,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
        });
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
      className="on-fig relative min-h-[100dvh] overflow-hidden bg-ground text-ink"
    >
      {/* Quiet brand texture on the fig field. Decorative only. */}
      <Logomark
        aria-hidden
        className="pointer-events-none absolute -left-[14vw] top-1/2 hidden h-[86vh] w-auto -translate-y-1/2 text-ink opacity-[0.045] lg:block"
      />

      <div className="relative grid min-h-[100dvh] grid-cols-1 items-center lg:grid-cols-12">
        <div className="px-5 pb-14 pt-28 sm:px-8 lg:col-span-6 lg:py-24 lg:pl-12 lg:pr-8 xl:col-span-6">
          <div data-anim data-hero-crest className="invisible mb-9">
            <Logomark className="h-11 w-auto" />
          </div>

          <h1 className="font-display type-hero">
            <span className="line-mask">
              <span data-anim data-hero-line className="invisible block">
                {t.hero.line1}
              </span>
            </span>
            <span className="line-mask">
              <span data-anim data-hero-line className="invisible block">
                {t.hero.line2}
              </span>
            </span>
          </h1>

          <p
            data-anim
            data-hero-fade
            className="type-lead invisible mt-8 max-w-[44ch] text-ink-muted"
          >
            {t.hero.sub}
          </p>

          <div
            data-anim
            data-hero-fade
            className="invisible mt-10 flex flex-wrap items-center gap-3"
          >
            <ArrowLink href="/contact">{t.cta.book}</ArrowLink>
            <ArrowLink href="/story" variant="outline">
              {t.cta.work}
            </ArrowLink>
          </div>
        </div>

        {/* Full height, bleeding off the right edge. No gutter. */}
        <div className="lg:col-span-6 lg:col-start-7 lg:h-[100dvh] xl:col-span-6">
          <div
            data-anim
            data-hero-image
            className="invisible relative h-[52vh] w-full overflow-hidden sm:h-[62vh] lg:h-full"
          >
            <Image
              src={HERO.src}
              alt={HERO.alt}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="scale-110 object-cover"
            />

            {/* The photograph runs under the fixed header, so the top of it
                gets a fig scrim. Without this the nav sits on highlights and
                drops well below AA. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-fig/85 to-transparent"
            />
          </div>
        </div>
      </div>

      <div id="hero-sentinel" aria-hidden="true" className="absolute bottom-0 h-px w-full" />
    </section>
  );
}
