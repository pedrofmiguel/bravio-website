"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

/**
 * The site's one reveal-on-scroll behaviour.
 *
 * Everything that enters does the same thing: a short rise with a long fade,
 * on the same curve. Consistency is what stops a page with this much motion
 * reading as busy. `stagger` is for wrapping a list whose children should
 * arrive in sequence.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  distance = 28,
  stagger,
  start = "top 85%",
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  distance?: number;
  /** Seconds between children. Omit to animate the wrapper as one block. */
  stagger?: number;
  start?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.classList.add("is-ready");
      return;
    }

    const targets = stagger ? Array.from(el.children) : [el];

    const ctx = gsap.context(() => {
      gsap.set(el, { visibility: "visible" });
      gsap.fromTo(
        targets,
        { y: distance, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1.1,
          delay,
          ease: "power3.out",
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: el, start, once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay, distance, stagger, start]);

  return (
    <Tag ref={ref} data-anim className={className}>
      {children}
    </Tag>
  );
}

/**
 * Masked line-by-line reveal for display type.
 *
 * Lines are measured from the rendered text rather than passed in, so a
 * headline reflows correctly between languages and breakpoints. The measure
 * re-runs on resize and on language change via the `resetKey` prop.
 */
export function RevealLines({
  text,
  as: Tag = "p",
  className,
  start = "top 82%",
  stagger = 0.09,
  delay = 0,
  resetKey,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  start?: string;
  stagger?: number;
  delay?: number;
  /** Change this to force a re-measure, e.g. on language switch. */
  resetKey?: string | number;
}) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = text;
      el.classList.add("is-ready");
      return;
    }

    let ctx: gsap.Context | null = null;

    const build = () => {
      ctx?.revert();
      el.textContent = text;

      // Deferred so fonts have settled: measuring mid-swap groups the wrong
      // words onto the wrong lines.
      const lines = splitIntoLines(el);

      ctx = gsap.context(() => {
        gsap.set(el, { visibility: "visible" });
        gsap.fromTo(
          lines,
          { yPercent: 112 },
          {
            yPercent: 0,
            duration: 1.15,
            delay,
            ease: "power4.out",
            stagger,
            scrollTrigger: { trigger: el, start, once: true },
          }
        );
      }, el);
    };

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(build);
    };

    if (document.fonts?.status === "loaded") {
      schedule();
    } else {
      document.fonts?.ready.then(schedule).catch(schedule);
    }

    let lastWidth = window.innerWidth;
    const onResize = () => {
      // Ignore the vertical-only resize that mobile URL bars produce.
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      schedule();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ctx?.revert();
      ScrollTrigger.refresh();
    };
  }, [text, start, stagger, delay, resetKey]);

  return <Tag ref={ref} data-anim className={className} />;
}

/** Wraps each rendered line in a clipping mask and returns the inner spans. */
function splitIntoLines(el: HTMLElement): HTMLElement[] {
  const raw = el.textContent ?? "";
  const words = raw.split(/\s+/).filter(Boolean);
  el.textContent = "";

  const probes = words.map((word, i) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.style.display = "inline-block";
    el.append(span);
    if (i < words.length - 1) el.append(document.createTextNode(" "));
    return span;
  });

  const grouped: string[][] = [];
  let lastTop: number | null = null;
  probes.forEach((span) => {
    const top = span.offsetTop;
    if (lastTop === null || Math.abs(top - lastTop) > 2) {
      grouped.push([]);
      lastTop = top;
    }
    grouped[grouped.length - 1].push(span.textContent ?? "");
  });

  el.textContent = "";
  return grouped.map((line) => {
    const mask = document.createElement("span");
    mask.className = "line-mask";
    const inner = document.createElement("span");
    inner.style.display = "block";
    inner.textContent = line.join(" ");
    mask.append(inner);
    el.append(mask);
    return inner;
  });
}
