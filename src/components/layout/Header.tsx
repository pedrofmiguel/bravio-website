"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react";
import { Lockup } from "@/components/brand/Marks";
import TransitionLink from "./TransitionLink";
import { useLang } from "@/lib/lang-context";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { startScroll, stopScroll } from "@/lib/lenis-store";

/**
 * Fixed header.
 *
 * Every page opens on a fig coloured hero, so the header starts as creme on
 * transparent and only picks up a ground plate once the hero has passed. The
 * swap is driven by an IntersectionObserver on a sentinel rather than a scroll
 * listener, which keeps it off the scroll thread.
 */
export default function Header() {
  const { t, lang, toggle } = useLang();
  const pathname = usePathname();

  const [onHero, setOnHero] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const panelItemsRef = useRef<HTMLUListElement>(null);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/story", label: t.nav.story },
    { href: "/contact", label: t.nav.contact },
  ];

  // A zero height sentinel sits at the bottom of the hero. The header stays
  // transparent while that line is still below the header, and picks up a
  // ground plate once it has passed above it. Reading boundingClientRect in
  // the callback gives the direction of the crossing, which isIntersecting
  // alone does not: the sentinel is outside the root on both sides.
  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) {
      // Defensive: every route renders a fig hero with a sentinel. If one ever
      // does not, the header needs its ground plate or it would be creme text
      // on a creme page. The value cannot be known until the DOM exists, which
      // is why it is set here rather than derived during render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOnHero(false);
      return;
    }

    const HEADER = 72;
    const observer = new IntersectionObserver(
      ([entry]) => setOnHero(entry.boundingClientRect.top > HEADER),
      { rootMargin: `-${HEADER}px 0px 0px 0px`, threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [pathname]);

  // Panel open and close, plus scroll lock while it is up.
  useEffect(() => {
    const panel = menuRef.current;
    if (!panel) return;

    if (menuOpen) {
      stopScroll();
      if (prefersReducedMotion()) {
        gsap.set(panel, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }
      const tl = gsap.timeline();
      tl.set(panel, { autoAlpha: 1 })
        .fromTo(
          panel,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power4.inOut" }
        )
        .fromTo(
          panelItemsRef.current?.children ?? [],
          { yPercent: 120, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.6,
            stagger: 0.06,
            ease: "power3.out",
          },
          "-=0.35"
        );
      return () => {
        tl.kill();
      };
    }

    startScroll();
    if (prefersReducedMotion()) {
      gsap.set(panel, { autoAlpha: 0 });
      return;
    }
    const tl = gsap.to(panel, {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: 0.5,
      ease: "power4.inOut",
      onComplete: () => gsap.set(panel, { autoAlpha: 0 }),
    });
    return () => {
      tl.kill();
    };
  }, [menuOpen]);

  // Escape closes the panel.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => () => startScroll(), []);

  const tone = onHero || menuOpen ? "text-creme" : "text-ink";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[80] h-16 transition-colors duration-500 sm:h-[72px] ${tone} ${
          onHero || menuOpen
            ? "bg-transparent"
            : "bg-ground/80 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1500px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <TransitionLink
            href="/"
            aria-label={t.a11y.home}
            className="shrink-0 transition-opacity hover:opacity-70"
          >
            <Lockup markClassName="h-[26px] w-auto" wordClassName="h-[15px] w-auto" />
          </TransitionLink>

          <nav className="hidden items-center gap-9 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <TransitionLink
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`type-label relative py-1 transition-opacity hover:opacity-60 ${
                    active ? "opacity-100" : "opacity-70"
                  }`}
                >
                  {link.label}
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-0.5 h-px bg-current"
                    />
                  ) : null}
                </TransitionLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={toggle}
              aria-label={`${t.nav.langLabel}: ${lang === "en" ? "English" : "Português"}`}
              className="type-label flex items-center gap-1.5 py-1 transition-opacity hover:opacity-60"
            >
              <span className={lang === "en" ? "opacity-100" : "opacity-40"}>
                EN
              </span>
              <span aria-hidden="true" className="opacity-30">
                /
              </span>
              <span className={lang === "pt" ? "opacity-100" : "opacity-40"}>
                PT
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t.nav.menuClose : t.nav.menuOpen}
              className="-mr-1 grid h-10 w-10 place-items-center md:hidden"
            >
              {menuOpen ? (
                <X size={22} weight="light" />
              ) : (
                <List size={22} weight="light" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        ref={menuRef}
        id="mobile-menu"
        className="invisible fixed inset-0 z-[75] bg-fig text-creme opacity-0 md:hidden"
      >
        <div className="flex h-full flex-col justify-between px-5 pb-10 pt-24">
          <ul ref={panelItemsRef} className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href} className="overflow-hidden">
                <TransitionLink
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-display type-display block py-1.5"
                >
                  {link.label}
                </TransitionLink>
              </li>
            ))}
          </ul>

          <p className="type-label text-creme/50">{t.footer.based}</p>
        </div>
      </div>
    </>
  );
}
