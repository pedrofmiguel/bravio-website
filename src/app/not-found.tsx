import { redirect } from "next/navigation";

/**
 * Backstop for an explicit `notFound()` call inside a segment.
 *
 * Unmatched URLs never reach this file - the root catch-all in `[...slug]`
 * takes them first and issues a clean 307 - but anything that does land here
 * should follow the same rule and go home rather than sit on a dead end.
 */
export default function NotFound() {
  redirect("/");
}
