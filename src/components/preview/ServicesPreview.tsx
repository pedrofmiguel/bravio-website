"use client";

import Services from "@/components/home/Services";
import ServicesMedia from "@/components/home/ServicesMedia";
import ServicesPanels from "@/components/home/ServicesPanels";

/**
 * The three services layouts, one after another, so they can be compared in a
 * real browser rather than from screenshots. Option C in particular only makes
 * sense with a pointer on it.
 *
 * Each variant keeps its own root, and both stacking variants scope their GSAP
 * selectors to that root, so putting them on one page does not cross-wire the
 * ScrollTriggers.
 */

function Marker({ letter, title, note }: { letter: string; title: string; note: string }) {
  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-4 pt-24 sm:px-8 lg:px-12">
      <div className="flex flex-col gap-2 border-t border-rule pt-6 sm:flex-row sm:items-baseline sm:gap-5">
        <span className="font-display text-2xl">{letter}</span>
        <div>
          <p className="font-display text-lg">{title}</p>
          <p className="mt-1 max-w-[60ch] text-[0.9rem] text-ink-muted">{note}</p>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPreview() {
  return (
    <div className="pb-32 pt-20">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <h1 className="font-display type-title">Services, three ways</h1>
        <p className="mt-4 max-w-[60ch] text-[0.98rem] text-ink-muted">
          Scroll through all three. Option C wants a mouse on it: point at each
          panel. This page is not linked from anywhere and is not indexed.
        </p>
      </div>

      <Marker
        letter="A"
        title="Current: split card in a sticky stack"
        note="What is live today. Image on one side, copy on a fig panel on the other. The complaint was dead space: half a large slab holding four lines."
      />
      <Services />

      <Marker
        letter="B"
        title="Media card, stack kept"
        note="Same stacking behaviour, but the photograph fills the whole card and the copy sits on it over a scrim. Fixes the dead space without changing how the section works."
      />
      <ServicesMedia />

      <Marker
        letter="C"
        title="Three panels, no stack"
        note="No pinning and no scroll trickery. All three are visible at once and the one you point at widens and brings its copy up. Recommended: choosing between three services is a comparison, which a stack prevents."
      />
      <ServicesPanels />
    </div>
  );
}
