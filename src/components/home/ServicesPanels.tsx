"use client";

import { useState } from "react";
import Image from "next/image";
import { useLang } from "@/lib/lang-context";
import { SERVICE_MEDIA } from "@/lib/media";

/**
 * SERVICES, OPTION 2: three panels, no stack.
 *
 * A different answer to the same brief. The three offerings stand side by side
 * as full height photographs and the one you point at opens, widening and
 * bringing its copy up. Nothing scrolls sideways, nothing pins, nothing is
 * hidden: every panel always shows its name and its scale, so the section
 * still reads with no interaction at all.
 *
 * Widening is done with flex-grow on a CSS transition rather than by animating
 * width, so the browser can keep it on the compositor and there is no GSAP
 * here at all.
 *
 * On touch the whole idea collapses: hovering does not exist and full height
 * columns are unreadable at 390px, so below lg it becomes three stacked cards
 * with the copy always visible.
 */
export default function ServicesPanels() {
  const { t } = useLang();
  const [open, setOpen] = useState(0);

  return (
    <section className="mx-auto max-w-[1500px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
      <h2 className="type-label text-ink-muted">{t.services.label}</h2>

      <div className="mt-10 flex flex-col gap-4 lg:mt-14 lg:h-[76vh] lg:flex-row lg:gap-3">
        {t.services.items.map((item, i) => {
          const active = open === i;
          return (
            <article
              key={item.title}
              onMouseEnter={() => setOpen(i)}
              onFocusCapture={() => setOpen(i)}
              className={`on-fig group relative overflow-hidden text-ink transition-[flex-grow] duration-[900ms] ease-[var(--ease-brand)] ${
                active ? "lg:grow-[2.4]" : "lg:grow-[1]"
              }`}
            >
              <div className="relative aspect-4/5 w-full sm:aspect-16/10 lg:aspect-auto lg:h-full">
                <Image
                  src={SERVICE_MEDIA[i].src}
                  alt={SERVICE_MEDIA[i].alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className={`object-cover transition-transform duration-[1.4s] ease-[var(--ease-brand)] ${
                    active ? "lg:scale-100" : "lg:scale-105"
                  }`}
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-fig via-fig/55 to-transparent"
                />

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                  <h3 className="font-display text-[clamp(1.5rem,2.2vw,2.25rem)] leading-tight">
                    {item.title}
                  </h3>

                  {/* Always readable on small screens. On desktop the body is
                      what the opening reveals, but the name and the scale are
                      never hidden. */}
                  <p
                    className={`mt-4 max-w-[40ch] text-[0.98rem] leading-relaxed text-creme/75 transition-[opacity,transform] duration-700 ease-[var(--ease-brand)] lg:mt-5 ${
                      active
                        ? "lg:translate-y-0 lg:opacity-100"
                        : "lg:pointer-events-none lg:translate-y-3 lg:opacity-0"
                    }`}
                  >
                    {item.body}
                  </p>

                  <p className="type-label mt-5 text-creme/55">{item.meta}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
