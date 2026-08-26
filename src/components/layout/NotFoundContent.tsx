"use client";

import { useLang } from "@/lib/lang-context";
import PageHero from "./PageHero";
import { ArrowLink } from "@/components/ui/ArrowLink";

/**
 * 404. Uses the same fig hero as the real pages so the header's tone logic and
 * the route transition behave identically here.
 */
export default function NotFoundContent() {
  const { t, lang } = useLang();

  const copy =
    lang === "pt"
      ? { line1: "Esta página", line2: "não existe.", body: "O link pode estar errado, ou a página pode ter mudado de sítio." }
      : { line1: "This page", line2: "does not exist.", body: "The link may be wrong, or the page may have moved." };

  return (
    <>
      <PageHero line1={copy.line1} line2={copy.line2} />
      <section className="mx-auto max-w-[1500px] px-5 py-28 sm:px-8 lg:px-12">
        <p className="type-lead max-w-[44ch] text-ink-muted">{copy.body}</p>
        <div className="mt-10">
          <ArrowLink href="/">{t.nav.home}</ArrowLink>
        </div>
      </section>
    </>
  );
}
