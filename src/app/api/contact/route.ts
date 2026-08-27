import { NextResponse } from "next/server";
import { checkBotId } from "botid/server";
import nodemailer from "nodemailer";

/**
 * Enquiry endpoint.
 *
 * Delivery goes through Gmail SMTP with an app password, which is the path
 * that works without a Workspace admin setting up OAuth. See .env.example.
 *
 * If the mail transport is not configured this route fails loudly with a 500
 * rather than pretending to succeed. A booking enquiry that silently vanishes
 * is worse than a form that visibly errors and tells the visitor to email.
 *
 * SPAM DEFENCE, cheapest check first
 * ----------------------------------
 *   1. Origin      - rejects anything not posted from this site's own pages.
 *   2. Rate limit  - a per instance speed bump, see the note on `hits`.
 *   3. BotID       - the actual gate. An invisible challenge runs in the
 *                    browser (see src/instrumentation-client.ts) and this
 *                    verifies the response server side.
 *   4. Honeypot    - catches naive form fillers that got past the rest.
 *
 * The ordering matters: 1 and 2 are free and need no body, so they run before
 * the network call in 3. None of these is sufficient alone. The honeypot only
 * defends the browser path, and the rate limit only slows one warm instance -
 * BotID is what stops a script posting straight at the endpoint.
 */

export const runtime = "nodejs";

type Payload = {
  name: string;
  email: string;
  message: string;
  phone?: string;
  date?: string;
  location?: string;
  guests?: string;
  occasion?: string;
  lang?: string;
  /** Honeypot. Real people never fill this in; bots usually do. */
  company?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX = { name: 120, email: 160, message: 4000, short: 120 };

/**
 * Very small in-process throttle. Serverless instances are not shared, so this
 * only slows a burst from one warm instance: under load Vercel runs several,
 * each with its own copy of `hits`, so the real ceiling is `max` times the
 * number of warm instances. It is a speed bump, not a wall. BotID is the wall.
 *
 * For a shared counter, either put a WAF rate limit rule on this path (it runs
 * at the edge, before the function is even invoked) or move `hits` to Redis.
 */
const RATE_LIMIT = { windowMs: 60_000, max: 5, maxKeys: 5_000 };
const hits = new Map<string, number[]>();

/** Drops keys whose whole window has expired. */
function evictExpired(now: number): void {
  for (const [key, times] of hits) {
    if (times[times.length - 1] < now - RATE_LIMIT.windowMs) hits.delete(key);
  }
}

function isThrottled(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter(
    (time) => now - time < RATE_LIMIT.windowMs
  );
  // Capped so a client hammering the endpoint cannot grow its own array without
  // bound. Anything past the limit is refused anyway, so the extra timestamps
  // carry no information.
  if (recent.length <= RATE_LIMIT.max + 1) recent.push(now);
  hits.set(key, recent);

  // Evict rather than clear. The previous version wiped the whole map once it
  // passed a size threshold, which handed an attacker a way to reset their own
  // counter: flood it with enough distinct keys and everyone's window, theirs
  // included, went back to zero.
  if (hits.size > RATE_LIMIT.maxKeys) evictExpired(now);

  return recent.length > RATE_LIMIT.max;
}

/**
 * The client's address, preferring the header the platform sets itself.
 *
 * x-forwarded-for is a chain and its leftmost entry is the end a client can
 * write, so keying a limiter off it lets one caller look like thousands by
 * rotating the header. x-real-ip is set by the proxy and is not client
 * writable; the forwarded chain is only a fallback for running behind
 * something that does not set it.
 */
function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const chain = request.headers.get("x-forwarded-for");
  return chain?.split(",").pop()?.trim() || "unknown";
}

/**
 * True when the request was posted from one of this site's own pages.
 *
 * The Origin is compared against the host the request actually arrived on,
 * rather than a list of known domains. That is what makes it self
 * configuring: it holds on bravio.pt, on www, on every preview deployment and
 * on localhost, with nothing to keep in sync. A hardcoded list is one domain
 * change away from rejecting every real enquiry.
 *
 * Browsers always send Origin on a cross-origin POST, so a mismatch is a
 * reliable reject. A *missing* Origin is not treated as hostile: some privacy
 * tooling strips it, and refusing those would turn a spam control into a
 * silently broken form for real people. BotID covers that case.
 */
function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    // An Origin that is not a URL was not written by a browser.
    return false;
  }
}

function clean(value: unknown, limit: number): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export async function POST(request: Request) {
  // 1. Posted from somewhere that is not this site.
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 2. Too many from one address.
  if (isThrottled(clientIp(request))) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // 3. The real gate. Returns isBot: false in local development regardless,
  // so the form stays workable without a deployment.
  //
  // This FAILS OPEN on purpose. checkBotId() throws when it cannot reach
  // Vercel to validate - outside a Vercel deployment, or during an outage -
  // and an unhandled throw here would 500 the form and lose the enquiry. For a
  // booking form that trade is the wrong way round: a lost booking costs the
  // client real money, a spam message costs them a click. The origin check,
  // the throttle and the honeypot all still apply. An endpoint holding money
  // or credentials should make the opposite choice and fail closed.
  let isBot = false;
  try {
    ({ isBot } = await checkBotId());
  } catch (error) {
    console.error("[contact] bot check unavailable, letting it through", error);
  }
  if (isBot) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 4. Honeypot: answer 200 so the bot believes it succeeded and moves on.
  if (clean(body.company, MAX.short)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const message = clean(body.message, MAX.message);

  if (!name || !email || !message || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Missing or invalid fields" },
      { status: 422 }
    );
  }

  const phone = clean(body.phone, MAX.short);
  const date = clean(body.date, MAX.short);
  const location = clean(body.location, MAX.short);
  const guests = clean(body.guests, MAX.short);
  const occasion = clean(body.occasion, MAX.short);

  const { GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_TO, CONTACT_DRY_RUN } =
    process.env;

  const lines = [
    `Name:     ${name}`,
    `Email:    ${email}`,
    phone && `Phone:    ${phone}`,
    date && `Date:     ${date}`,
    location && `Location: ${location}`,
    guests && `Guests:   ${guests}`,
    occasion && `Occasion: ${occasion}`,
    `Language: ${clean(body.lang, 8) || "en"}`,
    "",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  // Local and preview builds can exercise the whole form without credentials.
  if (CONTACT_DRY_RUN === "1") {
    console.info("[contact] dry run, not delivered:\n" + lines);
    return NextResponse.json({ ok: true, delivered: false });
  }

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error(
      "[contact] GMAIL_USER or GMAIL_APP_PASSWORD is not set. Enquiry not delivered."
    );
    return NextResponse.json({ error: "Mail not configured" }, { status: 500 });
  }

  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    await transport.sendMail({
      // Gmail rewrites From to the authenticated account, so the visitor's
      // address goes in Reply-To where hitting reply actually works.
      from: `bravio site <${GMAIL_USER}>`,
      to: CONTACT_TO || GMAIL_USER,
      replyTo: `${name} <${email}>`,
      subject: `Enquiry from ${name}${occasion ? ` (${occasion})` : ""}`,
      text: lines,
    });

    return NextResponse.json({ ok: true, delivered: true });
  } catch (error) {
    console.error("[contact] delivery failed", error);
    return NextResponse.json({ error: "Delivery failed" }, { status: 502 });
  }
}
