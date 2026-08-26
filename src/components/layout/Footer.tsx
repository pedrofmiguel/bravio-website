"use client";

import { InstagramLogo } from "@phosphor-icons/react";
import { Logomark, Wordmark } from "@/components/brand/Marks";
import TransitionLink from "./TransitionLink";
import { useLang } from "@/lib/lang-context";
import { CONTACT_DETAILS } from "@/lib/i18n";

/**
 * Closing bookend. Fig ground, mirroring the hero, so each page opens and
 * shuts on the brand colour with the cream body held between them.
 */
export default function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-fig text-creme">
      <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-20 sm:px-8 sm:pt-28 lg:px-12">
        <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
          <div className="max-w-sm">
            <Logomark className="mb-7 h-14 w-auto" />
            <Wordmark className="h-[22px] w-auto" title="bravio" />
            <p className="type-label mt-5 text-creme/55">{t.footer.tagline}</p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:max-w-2xl">
            <nav aria-label={t.nav.langLabel} className="flex flex-col gap-3">
              {[
                { href: "/", label: t.nav.home },
                { href: "/story", label: t.nav.story },
                { href: "/contact", label: t.nav.contact },
              ].map((link) => (
                <TransitionLink
                  key={link.href}
                  href={link.href}
                  className="w-fit text-[0.95rem] text-creme/70 transition-colors hover:text-creme"
                >
                  {link.label}
                </TransitionLink>
              ))}
            </nav>

            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${CONTACT_DETAILS.email}`}
                className="w-fit text-[0.95rem] text-creme/70 transition-colors hover:text-creme"
              >
                {CONTACT_DETAILS.email}
              </a>
              <a
                href={`tel:${CONTACT_DETAILS.phone.replace(/\s/g, "")}`}
                className="w-fit text-[0.95rem] text-creme/70 transition-colors hover:text-creme"
              >
                {CONTACT_DETAILS.phone}
              </a>
              <a
                href={CONTACT_DETAILS.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex w-fit items-center gap-1.5 text-[0.95rem] text-creme/70 transition-colors hover:text-creme"
              >
                <InstagramLogo size={16} weight="light" />
                {CONTACT_DETAILS.instagram}
              </a>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <TransitionLink
                href="/contact"
                className="font-display inline-flex items-baseline gap-3 text-2xl transition-opacity hover:opacity-70 sm:text-[1.75rem]"
              >
                {t.cta.book}
                <span aria-hidden="true" className="text-lg">
                  &#8599;
                </span>
              </TransitionLink>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-creme/12 pt-6 text-[0.8rem] text-creme/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} bravio. {t.footer.rights}
          </p>
          <p>{t.footer.based}</p>
        </div>
      </div>
    </footer>
  );
}
