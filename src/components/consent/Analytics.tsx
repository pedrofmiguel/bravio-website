"use client";

import Script from "next/script";
import { useEffect } from "react";
import { GA_MEASUREMENT_ID, getChoice, useConsent } from "@/lib/consent";

/**
 * Google Analytics, loaded only after the visitor accepts.
 *
 * Nothing from Google is requested before that - not gtag.js, not a cookieless
 * "consent mode" ping. Advanced consent mode would send those pings to Google
 * on every visit and model the rest, which EU regulators do not accept as
 * consent-free. Not loading at all is the only version that needs no argument.
 *
 * Consent mode signals are still sent once it has loaded, defaulting to denied
 * and lifting analytics only, so ad storage and ad personalisation stay off
 * even though the account could enable them.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * 13 months, in seconds. GA's own default is two years; European guidance caps
 * an analytics cookie at 13 months, and the cookie policy says 13.
 */
const COOKIE_EXPIRES = 60 * 60 * 24 * 395;

/** gtag.js reads the queue once, so the config commands go in only once. */
let configured = false;

/** Google's documented kill switch: while true, gtag sends nothing. */
function setDisabled(disabled: boolean) {
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] =
    disabled;
}

function grant() {
  setDisabled(false);
  window.dataLayer = window.dataLayer ?? [];
  if (!window.gtag) {
    // gtag.js tells commands apart by receiving the arguments object itself,
    // not an array copy of it, so this has to stay a plain function.
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }

  if (!configured) {
    configured = true;
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
    window.gtag("consent", "update", { analytics_storage: "granted" });
    window.gtag("js", new Date());
    // Page views on client side navigation come from GA4's enhanced
    // measurement (history changes), which is on by default.
    window.gtag("config", GA_MEASUREMENT_ID, { cookie_expires: COOKIE_EXPIRES });
  } else {
    // Accepted again after declining in the same visit.
    window.gtag("consent", "update", { analytics_storage: "granted" });
  }
}

function revoke() {
  setDisabled(true);
  window.gtag?.("consent", "update", { analytics_storage: "denied" });
  clearAnalyticsCookies();
}

/**
 * Withdrawing consent has to stop the tracking, not just the next upload, so
 * the identifiers go too. GA writes them on the widest domain it can, so each
 * parent domain is tried: a cookie only clears with the domain it was set on.
 */
function clearAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((pair) => pair.split("=")[0]?.trim() ?? "")
    .filter((name) => name === "_ga" || name.startsWith("_ga_") || name === "_gid");
  if (names.length === 0) return;

  const parts = window.location.hostname.split(".");
  const domains = [""];
  for (let i = 0; i < parts.length - 1; i++) {
    domains.push(`; domain=.${parts.slice(i).join(".")}`);
  }

  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
    }
  }
}

export default function Analytics() {
  const { choice } = useConsent();
  const granted = choice === "granted";

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    // Read the store, not the hook value. The first effect runs on the
    // hydration render, which still holds the server snapshot ("unset"), and
    // acting on that would clear a returning visitor's analytics cookies on
    // every page load, making each visit look like a new person.
    if (getChoice() === "granted") grant();
    else revoke();
  }, [granted]);

  if (!GA_MEASUREMENT_ID || !granted) return null;

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
    />
  );
}
