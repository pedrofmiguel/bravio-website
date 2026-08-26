"use client";

import Image from "next/image";
import { useLang } from "@/lib/lang-context";
import { CHEF_PORTRAIT } from "@/lib/media";
import Reveal, { RevealLines } from "@/components/ui/Reveal";
import Gallery from "./Gallery";
import PageHero from "@/components/layout/PageHero";

/**
 * Story page body.
 *
 * Reads as one continuous piece: the hero states the idea, the intro sets it
 * out at reading size, the portrait block gives it a person, then the gallery
 * takes over and lets the work speak without further commentary.
 */
export default function StoryContent() {
  const { t, lang } = useLang();

  return (
    <>
      <PageHero line1={t.story.heroLine1} line2={t.story.heroLine2} />

      <section className="mx-auto max-w-[1500px] px-5 py-28 sm:px-8 sm:py-36 lg:px-12">
        <Reveal>
          <p className="type-display font-display max-w-[24ch] text-balance">
            {t.story.intro}
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 pb-28 sm:px-8 sm:pb-36 lg:px-12">
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal distance={40}>
              <div className="relative aspect-4/5 w-full overflow-hidden">
                <Image
                  src={CHEF_PORTRAIT.src}
                  alt={CHEF_PORTRAIT.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:pb-6">
            <RevealLines
              as="h2"
              resetKey={lang}
              text={t.story.chefHeading}
              className="font-display type-title max-w-[14ch]"
            />
            <Reveal delay={0.12}>
              <p className="type-lead mt-7 max-w-[46ch] text-ink-muted">
                {t.story.chefBody}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="pb-28 sm:pb-36 lg:pb-44">
        <div className="mx-auto mb-16 max-w-[1500px] px-5 sm:px-8 lg:mb-24 lg:px-12">
          <Reveal>
            <h2 className="font-display type-title max-w-[16ch]">
              {t.story.galleryHeading}
            </h2>
            <p className="mt-4 max-w-[44ch] text-[0.98rem] text-ink-muted">
              {t.story.galleryBody}
            </p>
          </Reveal>
        </div>

        <Gallery />
      </section>
    </>
  );
}
