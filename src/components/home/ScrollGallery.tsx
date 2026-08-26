"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLang } from "@/lib/lang-context";
import { ASPECT_RATIO, GALLERY } from "@/lib/media";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { UnderlineLink } from "@/components/ui/ArrowLink";

/**
 * The archive, panned sideways by vertical scroll.
 *
 * The section pins and the track slides horizontally as the page is scrubbed,
 * so the whole archive passes the eye without the reader leaving the flow.
 * Motivated: it is a lot of images that want to be seen in sequence, and a
 * vertical grid of twelve would eat four screens of page.
 *
 * Frames keep a common height and take their width from the photograph's own
 * ratio, so the rhythm of the row comes from the pictures rather than from a
 * uniform card size.
 *
 * They also float: each card sits at its own resting height and drifts
 * vertically at its own rate as the track pans, so the row reads as pictures
 * suspended in the space rather than as carriages bolted to a rail. The
 * offsets are a fixed pattern, not random, so the composition is the same on
 * every visit and can be tuned by hand.
 *
 * Desktop only, via gsap.matchMedia. On touch, and under reduced motion, the
 * same markup is simply a native horizontally scrollable rail with snap
 * points, which is better on a phone than any hijack would be.
 *
 * Note on pinning: this reintroduces ScrollTrigger's pin-spacer, which is the
 * thing that used to crash route changes. It is safe now only because setup
 * runs in useLayoutEffect (see lib/use-isomorphic-layout-effect.ts), so the
 * revert lands before React removes the node. `npm run verify:nav` covers it.
 */

/** Frame height. Capped in px as well as vh: on a tall monitor a plain 48vh
 *  card grows past 600px, which is what made the row crowd the heading. */
const FRAME_H = "min(46vh, 520px)";

/** Resting height and drift per card, as a FRACTION of the frame height
 *  rather than viewport units. Expressed this way the float scales with the
 *  card, so the clearance under the heading holds at any window size.
 *
 *  Hand set, not generated: no two tall neighbours share a height, and the
 *  pattern settles near zero at both ends of the track. */
const FLOAT = [
  { rest: 0, drift: -0.07 },
  { rest: -0.1, drift: 0.05 },
  { rest: 0.07, drift: -0.04 },
  { rest: -0.04, drift: 0.06 },
  { rest: 0.1, drift: -0.06 },
  { rest: -0.08, drift: 0.04 },
  { rest: 0.03, drift: -0.05 },
  { rest: -0.11, drift: 0.07 },
  { rest: 0.06, drift: -0.03 },
  { rest: -0.06, drift: 0.05 },
  { rest: 0.09, drift: -0.06 },
  { rest: -0.03, drift: 0.04 },
];

const floatFor = (i: number) => FLOAT[i % FLOAT.length];

export default function ScrollGallery() {
  const { t } = useLang();
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track || prefersReducedMotion()) return;

    const mm = gsap.matchMedia(root);

    mm.add("(min-width: 1024px) and (pointer: fine)", () => {
      const distance = () => track.scrollWidth - window.innerWidth;

      // One quickSetter per card. Driven from the pan's own onUpdate rather
      // than a trigger each, so the whole row is written in a single frame.
      const cards = gsap.utils.toArray<HTMLElement>("[data-float]", track);
      const setY = cards.map((card) => gsap.quickSetter(card, "y", "px"));
      // Float is a fraction of the rendered frame, measured rather than
      // assumed, so it stays correct when the px cap on FRAME_H kicks in.
      const frameH = () => cards[0]?.getBoundingClientRect().height ?? 0;

      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          // Scroll length equals the horizontal travel, so the pan tracks the
          // wheel one to one rather than racing or lagging it.
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
            const unit = frameH();
            setY.forEach((set, i) => {
              const { rest, drift } = floatFor(i);
              set((rest + drift * self.progress) * unit);
            });
          },
        },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative overflow-hidden">
      <div className="flex min-h-[100dvh] flex-col justify-center py-24 lg:py-0">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display type-title max-w-[16ch]">
                {t.galleryTeaser.heading}
              </h2>
              <p className="mt-4 max-w-[42ch] text-[0.98rem] text-ink-muted">
                {t.galleryTeaser.body}
              </p>
            </div>
            <UnderlineLink href="/story">{t.cta.work}</UnderlineLink>
          </div>
        </div>

        {/* On desktop GSAP translates this track. Everywhere else it is a
            plain scroll rail, which is why the overflow and snap live here. */}
        <div
          className="mt-14 w-full overflow-x-auto lg:mt-[max(7vh,5rem)] lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div
            ref={trackRef}
            className="flex w-max items-center gap-4 px-5 sm:gap-6 sm:px-8 lg:gap-8 lg:px-12"
            style={{ "--frame-h": FRAME_H } as React.CSSProperties}
          >
            {GALLERY.map((media, i) => (
              <figure
                key={media.src}
                data-float
                className="group relative shrink-0 snap-center overflow-hidden bg-ink/5 shadow-[0_28px_60px_-30px_var(--color-fig)]"
                style={{
                  height: "var(--frame-h)",
                  // Width follows the photograph's own ratio, so the row is
                  // paced by the pictures instead of by a uniform card.
                  width: `calc(var(--frame-h) * ${ASPECT_RATIO[media.aspect]})`,
                  // Resting height, so the row is already staggered before any
                  // scrolling happens and on touch, where GSAP never runs.
                  transform: `translateY(calc(var(--frame-h) * ${floatFor(i).rest}))`,
                }}
              >
                <Image
                  src={media.src}
                  alt={media.alt}
                  fill
                  sizes="(max-width: 1024px) 70vw, 40vw"
                  className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-brand)] group-hover:scale-[1.04]"
                />
              </figure>
            ))}
          </div>
        </div>

        {/* Position along the track. A line rather than a counter: it says
            where you are without pretending to be a control. */}
        <div className="mx-auto mt-[max(6vh,3.5rem)] hidden w-full max-w-[1500px] px-5 sm:px-8 lg:block lg:px-12">
          <span className="block h-px w-full bg-rule">
            <span
              ref={progressRef}
              className="block h-px w-full origin-left scale-x-0 bg-ink"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
