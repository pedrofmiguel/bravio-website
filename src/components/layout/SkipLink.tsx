"use client";

import { useLang } from "@/lib/lang-context";

/** Keyboard escape hatch past the fixed header. Visible only on focus. */
export default function SkipLink() {
  const { t } = useLang();
  return (
    <a
      href="#content"
      className="sr-only z-[99] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-sm focus:bg-fig focus:px-4 focus:py-2.5 focus:text-sm focus:text-creme"
    >
      {t.a11y.skip}
    </a>
  );
}
