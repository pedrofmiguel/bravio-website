"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { DEFAULT_LANG, DICT, LANGS, type Dict, type Lang } from "./i18n";

/**
 * Language preference.
 *
 * Backed by a tiny external store read through useSyncExternalStore rather
 * than a mount effect. The preference lives in localStorage, which does not
 * exist during SSR, so the server snapshot is always the default and React
 * swaps to the real value after hydration without a mismatch warning or a
 * cascading render.
 */

const STORAGE_KEY = "bravio.lang";

function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/** Resolved once per page load, then kept in sync by setLang. */
let cached: Lang | null = null;
const listeners = new Set<() => void>();

function resolve(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    // Private browsing or blocked storage: fall through to the browser locale.
  }
  return navigator.language?.toLowerCase().startsWith("pt") ? "pt" : DEFAULT_LANG;
}

function getSnapshot(): Lang {
  if (cached === null) cached = resolve();
  return cached;
}

function getServerSnapshot(): Lang {
  return DEFAULT_LANG;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function write(next: Lang) {
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // The preference simply will not persist. Not worth telling the user.
  }
  listeners.forEach((listener) => listener());
}

type LangValue = {
  lang: Lang;
  t: Dict;
  setLang: (next: Lang) => void;
  toggle: () => void;
};

const LangContext = createContext<LangValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Keep <html lang> honest for screen readers and search engines.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => write(next), []);
  const toggle = useCallback(
    () => write(lang === "en" ? "pt" : "en"),
    [lang]
  );

  const value = useMemo<LangValue>(
    () => ({ lang, t: DICT[lang], setLang, toggle }),
    [lang, setLang, toggle]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
