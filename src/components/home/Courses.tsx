"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLang } from "@/lib/lang-context";
import { COURSES } from "@/lib/media";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * A sample menu, shown as plates.
 *
 * This replaced a scroll-scrubbed wheel that showed one dish at a time. The
 * wheel looked good and read badly: the food was the point, and five of the six
 * plates were always greyed out, small and rotating away from you.
 *
 * So: every plate visible at once, at a size worth looking at, in service
 * order, with its name under it. No hover state to discover, no scrubbing to
 * hold, nothing that only exists while the section is moving. The only motion
 * is a staggered entry, which reveals the menu in the order it would be served.
 *
 * The column offset is what keeps it from reading as a stock four-up grid: even
 * columns hang lower, so the eye moves through the menu instead of scanning it
 * as rows.
 */
export default function Courses() {
  const { t } = useLang();
  const rootRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      root.querySelectorAll("[data-course]").forEach((el) => {
        (el as HTMLElement).style.visibility = "visible";
      });
      return;
    }

    const ctx = gsap.context(() => {
      const plates = gsap.utils.toArray<HTMLElement>("[data-course]");
      gsap.set(plates, { visibility: "visible" });

      // Batched so plates entering together animate together, rather than
      // each firing its own trigger and arriving in a ragged clump.
      gsap.fromTo(
        plates,
        { y: 46, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1.15,
          ease: "power3.out",
          stagger: { each: 0.08, from: "start" },
          scrollTrigger: { trigger: root, start: "top 72%", once: true },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="mx-auto max-w-[1500px] px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-36 lg:px-12 lg:pb-24 lg:pt-44"
    >
      <div className="max-w-[52ch]">
        <h2 className="font-display type-title max-w-[16ch]">
          {t.table.heading}
        </h2>
        <p className="type-lead mt-5 text-ink-muted">{t.table.body}</p>
      </div>

      <ol className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:mt-24 lg:grid-cols-4 lg:gap-x-7 lg:gap-y-16">
        {COURSES.map((media, i) => {
          const course = t.table.courses[i];
          if (!course) return null;
          return (
            <li
              key={media.src}
              data-course
              // Even columns hang lower on wide screens. Reset at lg-1 so the
              // two-column phone layout stays level.
              className={`invisible ${i % 2 === 1 ? "lg:mt-14" : ""}`}
            >
              <figure className="group">
                <div className="relative aspect-4/5 w-full overflow-hidden bg-ink/5">
                  <Image
                    src={media.src}
                    alt={media.alt}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 45vw, 22vw"
                    className="object-cover transition-transform duration-[1.3s] ease-[var(--ease-brand)] group-hover:scale-[1.05]"
                  />
                </div>
                <figcaption className="mt-5">
                  <p className="font-display text-[1.15rem] leading-tight">
                    {course.name}
                  </p>
                  <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-muted">
                    {course.note}
                  </p>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
