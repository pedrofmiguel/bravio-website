"use client";

import { useRef } from "react";
import { useLang } from "@/lib/lang-context";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { Logomark } from "@/components/brand/Marks";

/**
 * Hero: the mark at full scale, with the line written across it.
 *
 * No buttons, no photograph, no stack of supporting copy. The mark fills the
 * viewport and bleeds off the top and bottom, and the headline is set straight
 * over the middle of it.
 *
 * A note on what was tried and rejected: setting the type to
 * `mix-blend-mode: difference` makes it invert as it crosses the mark, which
 * is a lovely effect and completely wrong here. difference(creme, fig) lands
 * on mint green, so the one section that is supposed to be strictly fig and
 * creme was the only one introducing a new hue. Restraint instead: the mark is
 * a field at partial strength and the type sits on it in full creme.
 *
 * The composition is deliberately off centre. A mark centred behind centred
 * type reads as a blob with a caption; pushed right and cropped by the edge,
 * with the line set left across its arms, it reads as a composition.
 *
 * No buttons. The mark and the sentence are the whole idea, and booking lives
 * in the nav, the enquiry section and the footer.
 */
export default function Hero() {
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
          "[data-mark]",
          { autoAlpha: 0, scale: 1.18, rotate: -24 },
          { autoAlpha: 1, scale: 1, rotate: 0, duration: 2.1, ease: "power3.out" }
        )
          .fromTo(
            "[data-line]",
            { yPercent: 118 },
            { yPercent: 0, duration: 1.4, stagger: 0.12 },
            "-=1.55"
          )
          .fromTo(
            "[data-sub]",
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 1.1 },
            "-=0.9"
          );

        // The mark drifts and turns a little as the hero leaves, so the brand
        // field feels like a plane behind the type rather than a flat backdrop.
        gsap.to("[data-mark]", {
          yPercent: 9,
          rotate: 7,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
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
      className="on-fig relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-ground text-ink [isolation:isolate]"
    >
      {/* The mark: large, pushed right, cropped by the edge. Held at partial
          strength so the display type stays comfortably above AA on top of it
          and the nav never has to fight it. */}
      <div
        data-anim
        data-mark
        aria-hidden="true"
        // `left` is the mark's left edge, not its centre, so these values are
        // set so the headline's second line actually crosses its inner arms
        // while the far side stays cropped by the viewport.
        className="invisible pointer-events-none absolute top-1/2 left-[26%] -translate-y-1/2 sm:left-[34%] lg:left-[38%]"
      >
        <Logomark className="h-[min(92vh,880px)] w-auto text-creme opacity-[0.28]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <h1 className="font-display type-hero max-w-[11ch] text-creme">
          <span className="line-mask">
            <span data-anim data-line className="invisible block">
              {t.hero.line1}
            </span>
          </span>
          <span className="line-mask">
            <span data-anim data-line className="invisible block">
              {t.hero.line2}
            </span>
          </span>
        </h1>

        <p
          data-anim
          data-sub
          className="invisible mt-9 max-w-[38ch] text-[0.95rem] leading-relaxed text-creme/55"
        >
          {t.hero.sub}
        </p>
      </div>

      <div id="hero-sentinel" aria-hidden="true" className="absolute bottom-0 h-px w-full" />
    </section>
  );
}
