import { useSyncExternalStore } from "react";

/**
 * Consent for optional tracking.
 *
 * There is exactly one optional thing the site can run: Google Analytics, and
 * only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set. Everything else it stores -
 * the language, the intro flag, this choice itself, the BotID check on the
 * form - is strictly necessary and needs no consent. So with no measurement ID
 * there is nothing to ask, and the banner never appears. A banner asking for
 * consent to nothing is noise, and it tells visitors something untrue about
 * the site.
 *
 * Same external store shape as lang-context: localStorage does not exist on
 * the server, so the server snapshot is "unset" and the stored answer arrives
 * after hydration without a mismatch.
 */

const RAW_ID = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();

/** Validated because it is interpolated into a script URL. */
export const GA_MEASUREMENT_ID = /^G-[A-Z0-9]{4,20}$/i.test(RAW_ID)
  ? RAW_ID.toUpperCase()
  : "";

export const HAS_OPTIONAL_TRACKING = GA_MEASUREMENT_ID !== "";

export type Choice = "granted" | "denied";

type Stored = { v: 1; analytics: Choice; at: number };

const STORAGE_KEY = "bravio.consent";

/**
 * Both answers are asked again after six months, the period European
 * regulators recommend. A refusal that never expires is fine for the visitor
 * but the law treats both directions the same, and so does this.
 */
const MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000;

/** undefined until first read, null when there is no valid answer. */
let choice: Choice | null | undefined;
/** The visitor asked to see the panel again, from the footer or the policy. */
let open = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function read(): Choice | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<Stored>;
    if (stored.v !== 1 || typeof stored.at !== "number") return null;
    if (stored.analytics !== "granted" && stored.analytics !== "denied") return null;
    if (Date.now() - stored.at > MAX_AGE_MS) return null;
    return stored.analytics;
  } catch {
    // Blocked storage or a mangled value: treat it as never answered.
    return null;
  }
}

/** The stored answer, read straight from the store rather than from React. */
export function getChoice(): Choice | null {
  if (choice === undefined) choice = read();
  return choice;
}

export function setChoice(next: Choice) {
  choice = next;
  open = false;
  try {
    const stored: Stored = { v: 1, analytics: next, at: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Not persisted, so the question comes back next visit. Nothing loads
    // without an answer, so that failure is the safe direction.
  }
  emit();
}

export function openPreferences() {
  open = true;
  emit();
}

export function closePreferences() {
  if (!open) return;
  open = false;
  emit();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

type Snapshot = Choice | "unset";

const getSnapshot = (): Snapshot => getChoice() ?? "unset";
const getServerSnapshot = (): Snapshot => "unset";
const getOpen = () => open;
const getServerOpen = () => false;

export function useConsent(): { choice: Choice | null; open: boolean } {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isOpen = useSyncExternalStore(subscribe, getOpen, getServerOpen);
  return { choice: snapshot === "unset" ? null : snapshot, open: isOpen };
}
