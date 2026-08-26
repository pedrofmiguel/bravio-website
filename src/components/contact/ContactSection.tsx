"use client";

import { InstagramLogo } from "@phosphor-icons/react";
import { useLang } from "@/lib/lang-context";
import { CONTACT_DETAILS } from "@/lib/i18n";
import Reveal, { RevealLines } from "@/components/ui/Reveal";
import ContactForm from "./ContactForm";

/**
 * Enquiry block. Used on the home page and again as the body of /contact, so
 * the two never drift apart. `showLabel` is off on the contact page, where the
 * page heading already says what this is.
 */
export default function ContactSection({
  showLabel = true,
  id,
}: {
  showLabel?: boolean;
  id?: string;
}) {
  const { t, lang } = useLang();

  return (
    <section
      id={id}
      className="mx-auto max-w-[1500px] px-5 py-28 sm:px-8 sm:py-36 lg:px-12 lg:py-44"
    >
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          {showLabel ? (
            <h2 className="type-label mb-7 text-ink-muted">{t.contact.label}</h2>
          ) : null}

          <RevealLines
            as="p"
            resetKey={lang}
            text={t.contact.heading}
            className="font-display type-display max-w-[13ch]"
          />

          <Reveal delay={0.12}>
            <p className="mt-7 max-w-[42ch] text-[1rem] leading-relaxed text-ink-muted">
              {t.contact.body}
            </p>

            <div className="mt-10 flex flex-col gap-2.5">
              <a
                href={`mailto:${CONTACT_DETAILS.email}`}
                className="w-fit text-[1.05rem] underline-offset-4 transition-opacity hover:opacity-60 hover:underline"
              >
                {CONTACT_DETAILS.email}
              </a>
              <a
                href={`tel:${CONTACT_DETAILS.phone.replace(/\s/g, "")}`}
                className="w-fit text-[1.05rem] underline-offset-4 transition-opacity hover:opacity-60 hover:underline"
              >
                {CONTACT_DETAILS.phone}
              </a>
              <a
                href={CONTACT_DETAILS.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex w-fit items-center gap-2 text-[1.05rem] underline-offset-4 transition-opacity hover:opacity-60 hover:underline"
              >
                <InstagramLogo size={18} weight="light" />
                {CONTACT_DETAILS.instagram}
              </a>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal delay={0.08} distance={20}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
