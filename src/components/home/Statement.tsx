"use client";

import { useLang } from "@/lib/lang-context";
import ScrollLit from "@/components/ui/ScrollLit";

/**
 * The brand statement, paced to the scroll.
 *
 * This is the one passage on the page that is asking to be read rather than
 * scanned, and slowing the reader down is exactly what the section is for.
 */
export default function Statement() {
  const { t, lang } = useLang();

  return (
    <section className="mx-auto max-w-[1500px] px-5 py-32 sm:px-8 sm:py-44 lg:px-12 lg:py-56">
      <ScrollLit
        lines={t.statement.lines}
        resetKey={lang}
        className="font-display type-display max-w-[19ch] text-balance sm:max-w-[22ch]"
      />
    </section>
  );
}
