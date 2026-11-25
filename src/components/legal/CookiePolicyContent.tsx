"use client";

import { Fragment, type ReactNode } from "react";
import { useLang } from "@/lib/lang-context";
import { CONTACT_DETAILS } from "@/lib/i18n";
import { HAS_OPTIONAL_TRACKING, openPreferences } from "@/lib/consent";
import { COOKIE_POLICY, type Block, type Condition, type PolicyCopy } from "@/lib/cookie-policy";
import { getLenis } from "@/lib/lenis-store";
import PageHero from "@/components/layout/PageHero";
import Reveal from "@/components/ui/Reveal";
import { PillButton } from "@/components/ui/ArrowLink";

/**
 * Cookie policy body.
 *
 * Laid out like the rest of the site rather than as a wall of legal text: a
 * fig hero, then creme, with the summary and the contents held in a sticky
 * column on the left and the sections reading down the right, each opened by a
 * hairline and a number. The measure is kept to a comfortable line length and
 * the type stays at body size.
 */

const LINK =
  "text-ink underline decoration-rule underline-offset-4 transition-[text-decoration-color] duration-300 hover:decoration-current";

/** True when a passage matches what this build actually runs. */
function applies(when?: Condition): boolean {
  if (!when) return true;
  return (when === "analytics") === HAS_OPTIONAL_TRACKING;
}

/** Splits on {token} and swaps each token for its node. */
function rich(text: string, tokens: Record<string, ReactNode>): ReactNode[] {
  return text.split(/\{(\w+)\}/g).map((part, i) =>
    i % 2 === 1 ? <Fragment key={i}>{tokens[part] ?? `{${part}}`}</Fragment> : part
  );
}

/**
 * In-page contents. Buttons rather than #anchors: the site keeps in-page
 * targets out of the URL so the browser never jumps ahead of Lenis (see
 * requestLanding in lenis-store). Focus moves to the heading so the keyboard
 * arrives with the viewport.
 */
function goTo(id: string) {
  const section = document.getElementById(id);
  if (!section) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(section, { offset: -112 });
  else section.scrollIntoView({ block: "start" });
  section.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
}

export default function CookiePolicyContent() {
  const { lang } = useLang();
  const copy = COOKIE_POLICY[lang];

  const tokens: Record<string, ReactNode> = {
    email: (
      <a href={`mailto:${CONTACT_DETAILS.email}`} className={LINK}>
        {CONTACT_DETAILS.email}
      </a>
    ),
  };

  // Filtered before numbering, so the numbers never skip a section this build
  // leaves out.
  const sections = copy.sections.filter((section) => applies(section.when));
  const summary = copy.summary[HAS_OPTIONAL_TRACKING ? "analytics" : "no-analytics"];

  return (
    <>
      <PageHero eyebrow={copy.eyebrow} line1={copy.heroLine1} line2={copy.heroLine2} />

      <section className="mx-auto max-w-[1500px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
            <Reveal>
              <p className="type-label text-ink-muted">{copy.updatedLabel}</p>
              <p className="mt-2 text-[0.95rem]">{copy.updated}</p>

              <p className="type-lead mt-10 max-w-[34ch] text-balance">{summary}</p>

              <nav aria-label={copy.contentsLabel} className="mt-14 hidden lg:block">
                <p className="type-label text-ink-muted">{copy.contentsLabel}</p>
                <ol className="mt-5 flex flex-col gap-2.5">
                  {sections.map((section, i) => (
                    <li key={section.id}>
                      <button
                        type="button"
                        onClick={() => goTo(section.id)}
                        className="group flex items-baseline gap-4 text-left text-[0.92rem] text-ink-muted transition-colors hover:text-ink"
                      >
                        <span className="type-label w-5 shrink-0 tabular-nums opacity-60">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {section.title}
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>
            </Reveal>
          </aside>

          <div className="lg:col-span-7 lg:col-start-6">
            {sections.map((section, i) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="scroll-mt-28 border-t border-rule py-12 first:border-t-0 first:pt-0 sm:py-14"
              >
                <Reveal distance={20}>
                  <div className="flex items-baseline gap-5 sm:gap-7">
                    <span className="type-label w-6 shrink-0 tabular-nums text-ink-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2
                      id={`${section.id}-title`}
                      tabIndex={-1}
                      className="font-display text-[1.6rem] leading-[1.1] outline-none sm:text-[1.95rem]"
                    >
                      {section.title}
                    </h2>
                  </div>

                  <div className="mt-6 flex flex-col gap-5 sm:pl-[3.25rem]">
                    {section.blocks.map((block, j) => (
                      <PolicyBlock key={j} block={block} copy={copy} tokens={tokens} />
                    ))}
                  </div>
                </Reveal>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function PolicyBlock({
  block,
  copy,
  tokens,
}: {
  block: Block;
  copy: PolicyCopy;
  tokens: Record<string, ReactNode>;
}) {
  switch (block.kind) {
    case "p":
      if (!applies(block.when)) return null;
      return (
        <p className="max-w-[62ch] text-[1rem] leading-[1.75] text-ink-muted">
          {rich(block.text, tokens)}
        </p>
      );

    case "storage":
      return <StorageList copy={copy} />;

    case "cookie-settings":
      if (!applies(block.when)) return null;
      return (
        <div className="pt-2">
          <PillButton type="button" onClick={openPreferences}>
            {copy.cookieSettings}
          </PillButton>
        </div>
      );
  }
}

/**
 * What the site keeps in the browser. A list of rows rather than a <table>, so
 * on a phone each entry stacks into a readable block instead of a three
 * column grid squeezed into 340px. The column headings come back from sm up.
 */
function StorageList({ copy }: { copy: PolicyCopy }) {
  const rows = copy.storage.filter((row) => applies(row.when));
  const columns = "sm:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)_minmax(0,0.95fr)]";

  return (
    <div className="mt-3 border-y border-rule">
      <div
        aria-hidden="true"
        className={`type-label hidden gap-6 border-b border-rule py-4 text-ink-muted sm:grid ${columns}`}
      >
        <span>{copy.storageHeaders.name}</span>
        <span>{copy.storageHeaders.purpose}</span>
        <span>{copy.storageHeaders.duration}</span>
      </div>

      <ul className="divide-y divide-rule">
        {rows.map((row) => (
          <li key={row.name} className={`grid gap-2 py-5 sm:gap-6 ${columns}`}>
            <div>
              <p className="font-display text-[1.02rem] [overflow-wrap:anywhere]">{row.name}</p>
              <p className="mt-1.5 text-[0.78rem] leading-snug text-ink-muted">
                {row.where} · {row.kind}
              </p>
            </div>
            <p className="text-[0.95rem] leading-[1.65] text-ink-muted">{row.purpose}</p>
            <p className="text-[0.95rem] leading-[1.65] text-ink-muted">
              <span className="sm:sr-only">{copy.storageHeaders.duration}: </span>
              {row.duration}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
