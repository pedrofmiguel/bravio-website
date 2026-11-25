"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLang } from "@/lib/lang-context";
import {
  HAS_OPTIONAL_TRACKING,
  closePreferences,
  setChoice,
  useConsent,
} from "@/lib/consent";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { PillButton } from "@/components/ui/ArrowLink";
import TransitionLink from "@/components/layout/TransitionLink";

/**
 * Cookie banner.
 *
 * Only exists when there is something to consent to: see lib/consent.ts. With
 * no measurement ID it renders nothing, on purpose.
 *
 * Built to the rules the EU regulators actually enforce, which are mostly about
 * what the banner must not do:
 *   - Nothing optional loads until Accept. Analytics.tsx waits on the choice.
 *   - Decline sits beside Accept, the same shape and the same weight. Neither
 *     is the "primary" button, and refusing takes one click, like agreeing.
 *   - It does not block the page. Ignoring it is a valid answer: nothing loads.
 *   - The choice can be changed later from the footer, as easily as it was
 *     given.
 *
 * Design: a small creme card in the bottom left corner, square like every
 * non-interactive surface on the site, with the pills as the only rounded
 * shapes. It waits for the opening panel to finish, so it never competes with
 * the brand moment, and rises in on the site's one easing curve.
 */
export default function CookieBanner() {
  return HAS_OPTIONAL_TRACKING ? <Banner /> : null;
}

/** After the page hero lines have landed, on a visit with no intro. */
const SETTLE_NO_INTRO_MS = 1400;
/** After the intro panel lifts. */
const SETTLE_AFTER_INTRO_MS = 500;
/** If the intro never reports in, ask anyway rather than never asking. */
const SETTLE_FALLBACK_MS = 8000;

function Banner() {
  const { t } = useLang();
  const copy = t.legal.banner;
  const { choice, open } = useConsent();

  const titleId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const [settled, setSettled] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Asked for again from the footer, or never answered and the page is ready.
  const wanted = open || (settled && choice === null);
  const shown = wanted || leaving;

  useEffect(() => {
    const timers: number[] = [];
    const settleIn = (ms: number) =>
      timers.push(window.setTimeout(() => setSettled(true), ms));

    const onIntroDone = () => settleIn(SETTLE_AFTER_INTRO_MS);

    if (document.documentElement.dataset.intro === "skip") {
      settleIn(SETTLE_NO_INTRO_MS);
    } else {
      window.addEventListener("bravio:intro-done", onIntroDone, { once: true });
      settleIn(SETTLE_FALLBACK_MS);
    }

    return () => {
      window.removeEventListener("bravio:intro-done", onIntroDone);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  // Entry. The exit is driven from the click instead, because it has to keep
  // the card mounted after the choice that hides it has already been stored.
  useIsomorphicLayoutEffect(() => {
    const el = rootRef.current;
    if (!wanted || !el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, y: 0 });
      return;
    }
    const tween = gsap.fromTo(
      el,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }
    );
    return () => {
      tween.kill();
    };
  }, [wanted]);

  // Opened on request: take the keyboard to it, and remember where from so it
  // can go back. An unrequested first showing never steals focus - someone
  // halfway through reading the page did not ask to be moved.
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = requestAnimationFrame(() =>
      rootRef.current?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true })
    );
    return () => cancelAnimationFrame(frame);
  }, [open]);

  /** Stores the answer immediately, then lets the card leave. */
  function settle(apply: () => void) {
    if (leaving) return;
    apply();

    const done = () => {
      setLeaving(false);
      const back = returnFocusRef.current;
      returnFocusRef.current = null;
      if (back?.isConnected) back.focus({ preventScroll: true });
    };

    const el = rootRef.current;
    if (!el || prefersReducedMotion()) {
      done();
      return;
    }
    setLeaving(true);
    gsap.to(el, {
      autoAlpha: 0,
      y: 16,
      duration: 0.45,
      ease: "power2.in",
      // A click during the entry would otherwise have both tweens pulling on
      // the same properties for a frame.
      overwrite: true,
      onComplete: done,
    });
  }

  if (!shown) return null;

  return (
    <section
      ref={rootRef}
      aria-labelledby={titleId}
      // Reopened with an answer already on file, Escape just closes it. A
      // first-time visitor has to choose, so there it does nothing.
      onKeyDown={(event) => {
        if (event.key === "Escape" && open && choice !== null) {
          settle(closePreferences);
        }
      }}
      data-anim
      // Creme, the positive lockup, rather than fig. Every page opens on a fig
      // hero, which is exactly when this appears, and a fig card there was a
      // hairline away from invisible. The hairline and the fig-tinted shadow
      // are for later, when it floats over the creme body instead.
      className="fixed inset-x-4 bottom-4 z-[72] border border-rule bg-ground text-ink shadow-[0_22px_60px_-28px_rgba(52,17,20,0.55)] sm:inset-x-auto sm:bottom-8 sm:left-8 sm:w-[25rem] lg:bottom-10 lg:left-12"
    >
      <div className="p-5 sm:p-7">
        <h2 id={titleId} className="type-label text-ink-muted">
          {copy.label}
        </h2>

        <p className="mt-3 text-[0.9rem] leading-[1.6] text-ink/85 sm:mt-4 sm:text-[0.95rem]">
          {copy.body}{" "}
          <TransitionLink
            href="/cookies"
            className="text-ink underline decoration-rule underline-offset-4 transition-[text-decoration-color] duration-300 hover:decoration-current"
          >
            {t.legal.cookiePolicy}
          </TransitionLink>
        </p>

        {choice !== null ? (
          <p className="mt-3 text-[0.82rem] text-ink-muted">
            {choice === "granted" ? copy.currentOn : copy.currentOff}
          </p>
        ) : null}

        {/* Not disabled while leaving: the pill dims when disabled, which
            would flash mid exit. A second click is ignored in settle(). */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6">
          <PillButton
            type="button"
            onClick={() => settle(() => setChoice("denied"))}
            className="w-full"
          >
            {copy.decline}
          </PillButton>
          <PillButton
            type="button"
            onClick={() => settle(() => setChoice("granted"))}
            className="w-full"
          >
            {copy.accept}
          </PillButton>
        </div>
      </div>
    </section>
  );
}
