# bravio

Site for bravio, private chef and catering. Next.js 16 (App Router), Tailwind v4,
GSAP + Lenis, deployed on Vercel.

```bash
npm install
npm run dev
```

---

## What is where

```
src/
  app/
    page.tsx              home
    story/page.tsx        about + the archive gallery
    contact/page.tsx      enquiry form
    api/contact/route.ts  form delivery (Gmail SMTP) + spam checks
    robots.ts             GENERATED robots.txt
    sitemap.ts            GENERATED sitemap.xml
    opengraph-image.tsx   GENERATED 1200x630 share card
    globals.css           design tokens, section tones, type scale
  components/
    brand/Marks.tsx       logomark + wordmark as inline vectors
    layout/               header, footer, preloader, route transition, scroll
    home/                 hero, statement, services, scroll gallery
    story/Gallery.tsx     the hand-placed archive grid
    contact/              form + the shared enquiry section
  instrumentation-client.ts  BotID challenge, lists protected routes
  lib/
    i18n.ts               every visible string, EN and PT
    media.ts              every photograph and clip
    site.ts               canonical URL, route list, structured data
    brand-paths.ts        GENERATED, see "Brand marks" below
```

Two files carry most of the content: **`lib/i18n.ts`** for words and
**`lib/media.ts`** for pictures. Neither requires touching a component.

---

## The three things you will most likely want to change

### 1. Real photography

Everything currently points at open-licence Unsplash placeholders, chosen to
match the low-key register of the brand board. They are stand-ins, not art
direction.

Drop the real files into `public/media/` and edit `src/lib/media.ts`:

```ts
const SHOT = {
  tableCourse: "1414235077428-338989a2e8c0",   // before
};
// after: replace the img() call with a direct path
img("/media/hero-table.jpg", "portrait", "A course set down at the table")
```

Every layout reads `aspect` from the manifest, so the compositions keep their
rhythm regardless of what you point them at. Once nothing references Unsplash,
delete the `remotePatterns` block in `next.config.ts`.

**Video** works in the story gallery already. Add an entry with
`kind: "video"`, a `src` and a `poster`, and the same frame plays it inline,
muted and looping, pausing whenever it scrolls off screen. No clips ship today
because none were supplied.

### 2. Contact details and the inbox

Placeholder address, phone and handle live in `CONTACT_DETAILS` at the bottom
of `src/lib/i18n.ts`. Delivery is configured with environment variables, see
`.env.example`. Copy it to `.env.local` for development.

Until `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set, the route returns a 500
and the form shows its error state, which tells the visitor to email directly.
That is deliberate: a booking enquiry that silently vanishes is worse than a
form that visibly fails. Set `CONTACT_DRY_RUN=1` to exercise the form without
sending anything.

### 3. The display typeface

The brand guidelines specify **Gottora**, which is not a free or Google font
and was not supplied. **Outfit** stands in for it: the closest geometric sans
in proportion and weight. The real wordmark is used wherever the logo appears,
so the brand's own letterforms are still on the page.

To swap Gottora in, put the woff2 in `public/fonts/` and change one block in
`src/app/layout.tsx` from `next/font/google` to `next/font/local`. Keep the
`--font-outfit` variable name and nothing else has to move.

---

## Brand marks

The supplied assets were PNG only. `src/lib/brand-paths.ts` is **generated**:
the PNGs are traced to outlines so the mark stays crisp at page-transition
scale and can inherit colour, which is what makes the positive and negative
lockups work from one file.

```bash
npm run brand     # only needed if the logo artwork itself changes
```

That runs trace (potrace) then measure (the real bounding box, via a headless
browser) then emit. The measure step matters: without it the viewBox is the
source PNG's canvas and the mark only fills about 64% of its box, so every size
class in the app ends up compensating by guesswork.

Two things about that pipeline are load-bearing:

**Both marks are cut out of `logo-dark-transparent.png`**, the full lockup,
rather than the standalone `logomark-*.png` and `name-*.png` files. The lockup
is by far the highest resolution artwork in the kit - the wordmark is 240px
tall in it against 78px in `name-*.png` - and tracing the small files meant
upscaling 5x before potrace ever saw the edges.

**The marks must render with `fill-rule="evenodd"`.** potrace emits one path
per mark whose holes - the counters of b, a and o, the gaps between the
anemone's tendrils - are subpaths wound the same way as the outline. Under
SVG's default `nonzero` they fill in solid, which turns the wordmark into four
blobs. `Marks.tsx` sets it explicitly, because `emit-brand-paths.mjs` only
carries the `d` attribute across and the attribute would otherwise be lost.

The emit step also writes `LOCKUP_WORD_RATIO` and `LOCKUP_GAP_RATIO`, measured
off the lockup, so `<Lockup>` takes one size - the mark's height - and derives
the wordmark's height and the space between them instead of having each call
site guess two numbers that have to agree.

---

## Spam and bot protection

The enquiry route runs four checks, cheapest first. None is sufficient alone.

| # | Check | Stops |
| - | ----- | ----- |
| 1 | Origin | Anything not posted from this site's own pages |
| 2 | Rate limit | Bursts from one address |
| 3 | **BotID** | Scripts posting straight at the endpoint |
| 4 | Honeypot | Naive form fillers |

[Vercel BotID](https://vercel.com/docs/botid) is the one that does the real
work. It is an invisible challenge - no widget, nothing for a visitor to
solve - configured in two places that **have to stay in agreement**:
`src/instrumentation-client.ts` lists the protected paths, and the route calls
`checkBotId()`. A route checked on the server but missing from that list fails
every request, including real people. Basic detection is free on all plans;
Deep Analysis is a Pro dashboard toggle, billed per call, and unnecessary here.

Three things are deliberate:

**The bot check fails open.** `checkBotId()` *throws* when it cannot reach
Vercel - outside a deployment, or during an outage - and an unhandled throw
would 500 the form and lose the enquiry. A lost booking costs the client real
money; a spam message costs them a click. An endpoint holding money or
credentials should make the opposite call.

**The origin check compares against the request's own host**, not a list of
known domains, so it holds on the apex, on www, on every preview deployment
and on localhost with nothing to keep in sync. A missing `Origin` is allowed
through - some privacy tooling strips it, and rejecting those would turn a
spam control into a silently broken form.

**The rate limiter evicts, it does not clear.** An earlier version wiped the
whole map past a size threshold, which handed an attacker a reset: flood it
with distinct keys and everyone's window went back to zero. It also keys off
`x-real-ip` rather than the leftmost `x-forwarded-for`, which is the end a
client can write.

It is still per-instance, so it only slows one warm lambda. For a shared
counter, add a WAF rate-limit rule on `/api/contact` - it runs at the edge,
before the function is invoked, and Vercel does not bill blocked traffic.

**Worth enabling in the dashboard:** Firewall → Rules → the Bot Protection
managed ruleset, which challenges non-browser traffic site-wide and is free.

**Testing note:** BotID blocks direct requests in production by design, so
exercise the form through a browser, not curl. Local development always
returns `isBot: false`.

---

## SEO

`lib/site.ts` holds the canonical origin, the shared description and the route
list. `robots.ts`, `sitemap.ts`, the root metadata and the structured data all
read from it, so the domain is written once. `NEXT_PUBLIC_SITE_URL` overrides
it for a staging domain that should describe itself honestly.

| Route             | What it is                                    |
| ----------------- | --------------------------------------------- |
| `/robots.txt`     | generated; disallows `/api/`, names the sitemap |
| `/sitemap.xml`    | the three real routes                          |
| `/opengraph-image`| 1200x630 share card, drawn from the brand vectors |

Three things are worth knowing before editing any of it:

**Page metadata goes through `pageMetadata()`.** Next merges metadata between
segments *shallowly*: a page that sets its own `openGraph` replaces the
layout's entirely, share image and all. A page that set only a title and
description this way shipped with no card. The helper builds the whole nested
object so a page cannot drop one by accident.

**The share card renders no text.** It is the negative lockup on a fig field,
which is the brand's own composition and, usefully, means Satori needs no font
loaded and the image cannot fail to build on a machine without network.

**Structured data omits placeholder contact details.** `businessJsonLd()` runs
contact fields through `isPlaceholder()` first. A stand-in phone number is
harmless in the footer of an unlaunched site and actively bad in schema.org
markup, where Google may print it in a knowledge panel beside a call button.
Replace the number in `CONTACT_DETAILS` and it starts publishing itself.

**Known limit: both languages share one URL.** The EN/PT preference is client
side, so there is one indexable copy of each page and search engines will only
ever rank the English one. Fixing that properly means moving the routes to
`/[lang]/...` and reading the segment - `i18n.ts` is already the hard part of
that job, and `sitemap.ts` would grow `alternates.languages` entries.

---

## Design decisions worth knowing

**Palette is deliberately monochrome.** Smoked Fig grounds the hero, the route
transition and the footer. Crème Fraîche grounds the body. Braised Cherry is
the only accent and is used identically everywhere. The greens from the brand
board (Dried Thyme, Aged Pistou) stay defined in `globals.css` but are unused
on purpose: the layout is fig and creme, and the photography carries all the
colour.

**Dark mode uses the brand's own negative lockup.** Rather than inventing a
second palette, `prefers-color-scheme: dark` swaps ground and ink, so the site
becomes the negative version of itself. Section tone classes (`.on-fig`,
`.on-pistou` in `globals.css`) re-point the same tokens, so a button dropped
onto a colour block inverts itself without the caller knowing where it is.

**Motion is deliberately slow.** Lenis runs at `lerp: 0.075`, heavier than its
default. That single number does more for how expensive the site feels than
any individual animation, so treat it as a design value, not config.

**Every animation degrades.** `prefers-reduced-motion` is honoured throughout,
and no content is reachable only through motion. Reveals resolve to their
finished state and the services stack flows as plain cards.

**The archive pans sideways on scroll.** `ScrollGallery` pins and scrubs a
horizontal track on desktop with a fine pointer. On touch and under reduced
motion the identical markup is a native scroll rail with snap points, which
beats any hijack on a phone. Frames share a height and take their width from
each photograph's own ratio, so the row is paced by the pictures.

**GSAP always sets up in `useLayoutEffect`, never `useEffect`.** This is not
style. React runs `useEffect` cleanups *after* it removes DOM nodes, so any
GSAP feature that reparents a React-owned node (ScrollTrigger's `pin: true`
wraps the target in a pin-spacer) leaves React holding a stale parent and
crashes the route with "removeChild: The node to be removed is not a child of
this node". `lib/use-isomorphic-layout-effect.ts` exists for exactly this, and
`npm run verify:nav` guards against the regression. This is what makes the
pinned horizontal pan safe to ship at all.

**Language is a client preference, not a route.** Both languages live in
`i18n.ts` and the toggle persists to localStorage. Routes stay `/`, `/story`
and `/contact` in both. If PT ever needs to rank separately in search, the
dictionary is already the hard part done: move the routes under `/[lang]/` and
read the segment instead of the store.

---

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build

npm run verify        # intro gating, reduced motion, language toggle, overflow
npm run verify:form   # validation, focus management, submit, success state
npm run verify:nav    # route changes from four scroll depths, no console errors
```

The `verify` scripts drive a real browser and need the production server
running (`npm run build && npm run start`). They write screenshots to
`screenshots/`, which is gitignored.

`potrace`, `sharp` and `playwright` are devDependencies used only by the brand
pipeline and these checks. Nothing in the shipped bundle depends on them, and
they can be removed once the real logo vectors exist.

---

## Deploying

Import the repo on Vercel; the framework preset is detected. Add the contact
variables from `.env.example` to **both** Production and Preview, or previews
will 500 on submit.
