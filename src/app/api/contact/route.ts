import { NextResponse } from "next/server";
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
 */

export const runtime = "nodejs";

type Payload = {
  name: string;
  email: string;
  message: string;
  phone?: string;
  date?: string;
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
 * only slows a burst from one warm instance. It is a speed bump, not a wall:
 * put real rate limiting in front of the route if abuse becomes a problem.
 */
const RATE_LIMIT = { windowMs: 60_000, max: 5 };
const hits = new Map<string, number[]>();

function isThrottled(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter(
    (time) => now - time < RATE_LIMIT.windowMs
  );
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) hits.clear();
  return recent.length > RATE_LIMIT.max;
}

function clean(value: unknown, limit: number): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isThrottled(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot: answer 200 so the bot believes it succeeded and moves on.
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
  const guests = clean(body.guests, MAX.short);
  const occasion = clean(body.occasion, MAX.short);

  const { GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_TO, CONTACT_DRY_RUN } =
    process.env;

  const lines = [
    `Name:     ${name}`,
    `Email:    ${email}`,
    phone && `Phone:    ${phone}`,
    date && `Date:     ${date}`,
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
