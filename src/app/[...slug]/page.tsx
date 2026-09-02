import { redirect } from "next/navigation";

/**
 * Every URL that is not a real page goes home instead of showing a 404.
 *
 * A root catch-all sits at the end of the routing order - after static files,
 * metadata routes and the three real pages - so it only ever sees a path that
 * nothing else claimed. Doing it here rather than in `proxy.ts` matters: proxy
 * runs *before* the rewrites `withBotId` injects, so a proxy-level catch-all
 * would swallow the BotID challenge script and quietly disable the form's bot
 * protection.
 *
 * It has to be a rendered route rather than `not-found.tsx`, too. That file is
 * prerendered, so a redirect from it is served as a 404 carrying a client-side
 * meta refresh - the visitor lands home, but only after a blank error shell,
 * and every crawler still reads a 404.
 *
 * 307, not 308: nothing here is permanent. Add a page tomorrow and it resolves
 * immediately, with no stale redirect cached in anyone's browser.
 */
export default function CatchAll() {
  redirect("/");
}
