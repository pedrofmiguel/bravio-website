import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "screenshots";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const problems = [];

// ---------- 1. First paint: intro must already cover the hero ------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "commit" });
  await page.waitForTimeout(120);
  await page.screenshot({ path: OUT + "/01-first-paint.png" });
  const covered = await page.evaluate(() => {
    const el = document.getElementById("intro");
    if (!el) return "no intro element";
    return getComputedStyle(el).display !== "none" ? "covered" : "hidden";
  });
  console.log("first paint intro:", covered);
  if (covered !== "covered") problems.push("intro did not cover first paint");
  await ctx.close();
}

// ---------- 2. Second visit in same tab: intro must be skipped -----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);
  await page.goto(BASE, { waitUntil: "commit" });
  await page.waitForTimeout(120);
  const skipped = await page.evaluate(
    () => document.documentElement.dataset.intro === "skip"
  );
  console.log("second visit skips intro:", skipped);
  if (!skipped) problems.push("intro replayed on second visit");
  await page.screenshot({ path: OUT + "/02-second-visit.png" });
  await ctx.close();
}

// ---------- 3. Reduced motion: intro skipped, content visible -----------
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const hidden = await page.evaluate(() => {
    const els = [...document.querySelectorAll("[data-anim]")];
    return els.filter((e) => getComputedStyle(e).visibility === "hidden").length;
  });
  console.log("reduced-motion hidden [data-anim] count:", hidden, "(want 0)");
  if (hidden > 0) problems.push(hidden + " elements stayed hidden under reduced motion");
  await page.screenshot({ path: OUT + "/03-reduced.png" });
  await ctx.close();
}

// ---------- 4. Language toggle actually swaps copy ----------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(4200);
  const before = await page.locator("h1").innerText();
  await page.getByRole("button", { name: /language|idioma/i }).click();
  await page.waitForTimeout(700);
  const after = await page.locator("h1").innerText();
  const htmlLang = await page.evaluate(() => document.documentElement.lang);
  console.log("h1 before:", JSON.stringify(before), "-> after:", JSON.stringify(after), "| html lang:", htmlLang);
  if (before === after) problems.push("language toggle did not change the headline");
  await page.screenshot({ path: OUT + "/04-lang.png" });
  await ctx.close();
}

// ---------- 5. Horizontal overflow at three widths ----------------------
for (const w of [390, 768, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  for (const route of ["/", "/story", "/contact"]) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    if (over > 1) problems.push(`horizontal overflow ${over}px at ${w}px on ${route}`);
  }
  await ctx.close();
}
console.log("overflow check done");

await browser.close();
console.log(problems.length ? "PROBLEMS:\n - " + problems.join("\n - ") : "ALL CHECKS PASSED");
