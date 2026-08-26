"use client";

import { useRef } from "react";
import Image from "next/image";
import { GALLERY, type Media } from "@/lib/media";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * The archive gallery.
 *
 * Not masonry. Masonry packs whatever it is given into the shortest column,
 * which produces a tidy wall with no emphasis. Every frame here is placed by
 * hand on a twelve column grid with its own span, offset and drift rate, so
 * the eye is led down the page rather than left to graze.
 *
 * PLACEMENT is the layout. Reorder or re-span entries to recompose the page.
 * Anything beyond its length falls back to a sensible half width frame.
 *
 * Video works exactly like photography here: give the manifest entry
 * kind: "video" with a poster, and the same frame plays it inline, muted and
 * looping, pausing whenever it is off screen.
 */

type Placement = { span: string; ratio: string; drift: number };

const PLACEMENT: Placement[] = [
  { span: "col-span-12 lg:col-span-7", ratio: "aspect-4/5", drift: 40 },
  { span: "col-span-12 lg:col-span-4 lg:col-start-9 lg:mt-28", ratio: "aspect-3/2", drift: -26 },
  { span: "col-span-7 lg:col-span-5 lg:mt-20", ratio: "aspect-2/3", drift: 32 },
  { span: "col-span-12 lg:col-span-6 lg:col-start-7 lg:mt-40", ratio: "aspect-3/2", drift: -38 },
  { span: "col-span-5 lg:col-span-4 lg:mt-16", ratio: "aspect-square", drift: 22 },
  { span: "col-span-7 lg:col-span-3 lg:col-start-6 lg:mt-48", ratio: "aspect-4/5", drift: -30 },
  { span: "col-span-12 lg:col-span-8 lg:col-start-3 lg:mt-24", ratio: "aspect-16/9", drift: 18 },
  { span: "col-span-5 lg:col-span-4 lg:mt-12", ratio: "aspect-square", drift: -24 },
  { span: "col-span-7 lg:col-span-5 lg:col-start-7 lg:mt-32", ratio: "aspect-2/3", drift: 34 },
  { span: "col-span-12 lg:col-span-6 lg:mt-16", ratio: "aspect-4/5", drift: -20 },
  { span: "col-span-7 lg:col-span-5 lg:col-start-8 lg:mt-36", ratio: "aspect-3/2", drift: 28 },
  { span: "col-span-5 lg:col-span-7 lg:col-start-2 lg:mt-20", ratio: "aspect-square", drift: -16 },
];

const FALLBACK: Placement = {
  span: "col-span-12 lg:col-span-6",
  ratio: "aspect-4/5",
  drift: 20,
};

export default function Gallery({ items = GALLERY }: { items?: Media[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observers: IntersectionObserver[] = [];

    // Clips only play while they are on screen. A dozen looping videos
    // decoding at once is the fastest way to make a gallery feel cheap.
    root.querySelectorAll("video").forEach((video) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) void video.play().catch(() => {});
          else video.pause();
        },
        { threshold: 0.2 }
      );
      observer.observe(video);
      observers.push(observer);
    });

    let ctx: gsap.Context | null = null;

    if (!prefersReducedMotion()) {
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-frame]").forEach((frame) => {
          const drift = Number(frame.dataset.drift ?? 0);
          const inner = frame.querySelector("[data-frame-inner]");

          gsap.fromTo(
            frame,
            { autoAlpha: 0, y: 34 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: { trigger: frame, start: "top 88%", once: true },
            }
          );

          gsap.fromTo(
            inner,
            { yPercent: -drift / 8 },
            {
              yPercent: drift / 8,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        });
      }, root);
    }

    return () => {
      observers.forEach((observer) => observer.disconnect());
      ctx?.revert();
    };
  }, [items]);

  return (
    <div
      ref={rootRef}
      className="mx-auto grid max-w-[1500px] grid-cols-12 gap-4 px-5 sm:gap-6 sm:px-8 lg:px-12"
    >
      {items.map((media, i) => {
        const place = PLACEMENT[i] ?? FALLBACK;
        return (
          <figure key={`${media.src}-${i}`} className={place.span}>
            <div
              data-frame
              data-drift={place.drift}
              className={`group relative w-full overflow-hidden bg-ink/5 ${place.ratio}`}
            >
              <div
                data-frame-inner
                className="absolute inset-x-0 -inset-y-[8%]"
              >
                {media.kind === "video" ? (
                  <video
                    src={media.src}
                    poster={media.poster}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={media.alt}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={media.src}
                    alt={media.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-brand)] group-hover:scale-[1.04]"
                  />
                )}
              </div>
            </div>
          </figure>
        );
      })}
    </div>
  );
}
