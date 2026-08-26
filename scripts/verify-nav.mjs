/**
 * Navigation regression check.
 *
 * Guards a crash that took the whole site down: ScrollTrigger's `pin: true`
 * reparents the pinned node into a pin-spacer, and a GSAP teardown running in
 * useEffect (rather than useLayoutEffect) fires after React has already tried
 * to remove that node, throwing "removeChild: The node to be removed is not a
 * child of this node" and dropping the route to the error boundary.
 *
 * It hammers the nav from four different scroll depths, because the bug only
 * appeared when a live ScrollTrigger existed at the moment of unmount.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "screenshots";
mkdirSync(OUT, { recursive: true });

const BASE = process.env.BASE || "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("CONSOLE: " + m.text().slice(0, 300));
});

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(4500);

// Hammer the nav from varied scroll depths, including deep inside the sticky
// stack, which is where a stale ScrollTrigger would bite.
const hops = ["/story", "/contact", "/", "/contact", "/story", "/", "/story", "/"];
let hop = 0;
for (const href of hops) {
  const depth = [0, 3, 8, 14][hop % 4];
  for (let i = 0; i < depth; i++) { await page.mouse.wheel(0, 800); await page.waitForTimeout(120); }
  await page.waitForTimeout(400);

  const link = page.locator(`header a[href="${href}"]`);
  if ((await link.count()) === 0) {
    errors.push(`FATAL: header gone before hop ${hop} -> ${href} (page likely crashed)`);
    break;
  }
  await link.first().click();
  await page.waitForTimeout(2400);
  hop++;
}

const finalUrl = page.url();
const headerLinks = await page.locator("header a").count();
const crashed = (await page.locator("body").innerText().catch(() => "")).includes("couldn’t load");

console.log("hops completed:", hop, "/", hops.length);
console.log("final url:", finalUrl);
console.log("header links present:", headerLinks);
console.log("crash screen:", crashed);
await page.screenshot({ path: OUT + "/nav-stress.png" });

console.log("\n--- errors ---");
console.log(errors.length ? [...new Set(errors)].join("\n") : "none");
await browser.close();
process.exit(errors.length || crashed || headerLinks === 0 ? 1 : 0);
