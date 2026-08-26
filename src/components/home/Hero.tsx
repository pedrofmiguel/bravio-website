"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLang } from "@/lib/lang-context";
import { HERO } from "@/lib/media";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * Opening moment.
 *
 * Asymmetric split rather than a centred hero: the headline holds the left
 * seven columns and the photograph runs off the right edge, which gives the
 * type somewhere to sit without competing with the image.
 *
 * The entry timeline waits for the preloader to finish so the two never play
 * over each other. On a repeat visit within the same tab there is no preloader,
 * so it starts immediately.
 */
export default function Hero() {
  const { t, lang } = useLang();
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      root.querySelectorAll("[data-anim]").forEach((el) => {
        el.classList.add("is-ready");
      });
      return;
    }

    let ctx: gsap.Context | null = null;

    const play = () => {
      ctx = gsap.context(() => {
        gsap.set("[data-anim]", { visibility: "visible" });

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.fromTo(
          "[data-hero-line]",
          { yPercent: 115 },
          { yPercent: 0, duration: 1.3, stagger: 0.11 }
        )
          .fromTo(
            "[data-hero-image]",
            { clipPath: "inset(100% 0% 0% 0%)", scale: 1.18 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              duration: 1.6,
              ease: "power3.inOut",
            },
            0.25
          )
          .fromTo(
            "[data-hero-fade]",
            { y: 22, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1, stagger: 0.1 },
            "-=0.95"
          );

        // Slow drift on the photograph as the section leaves. Motivated: it
        // separates the image plane from the type plane, so the hero feels
        // like a composition with depth rather than a flat banner.
        gsap.to("[data-hero-image] img", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }, root);
    };

    // The preloader only exists on a first visit, so race a short timeout
    // against its completion event rather than waiting on it unconditionally.
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
      className="on-fig relative min-h-[100dvh] bg-ground text-ink"
    >
      <div className="mx-auto grid min-h-[100dvh] max-w-[1500px] grid-cols-1 items-center gap-10 px-5 pb-16 pt-24 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-12 lg:pb-20">
        <div className="lg:col-span-7 xl:col-span-6">
          <h1 className="font-display type-hero">
            <span className="line-mask">
              <span data-anim data-hero-line className="block">
                {t.hero.line1}
              </span>
            </span>
            <span className="line-mask">
              <span data-anim data-hero-line className="block">
                {t.hero.line2}
              </span>
            </span>
          </h1>

          <p
            data-anim
            data-hero-fade
            className="type-lead mt-8 max-w-[46ch] text-ink-muted"
          >
            {t.hero.sub}
          </p>

          <div
            data-anim
            data-hero-fade
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <ArrowLink href="/contact">{t.cta.book}</ArrowLink>
            <ArrowLink href="/story" variant="outline">
              {t.cta.work}
            </ArrowLink>
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8 xl:col-span-6 xl:col-start-7">
          <div
            data-anim
            data-hero-image
            className="relative aspect-4/5 w-full overflow-hidden sm:aspect-3/2 lg:aspect-auto lg:h-[min(74vh,760px)]"
          >
            <Image
              src={HERO.src}
              alt={HERO.alt}
              fill
              // Largest contentful paint on every page load, so it is fetched
              // eagerly and sized honestly per breakpoint.
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="scale-110 object-cover"
            />
          </div>
        </div>
      </div>

      {/* Header watches this to decide when to pick up a background plate. */}
      <div id="hero-sentinel" aria-hidden="true" className="absolute bottom-0 h-px w-full" />
    </section>
  );
}
