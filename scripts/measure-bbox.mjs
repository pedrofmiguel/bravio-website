/** Reports the true bounding box of each traced path so the generated
 *  viewBox can be tightened to the artwork instead of the source PNG's
 *  padding. Run after trace-logo.mjs, before emit-brand-paths.mjs. */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";

const browser = await chromium.launch();
const page = await browser.newPage();
const out = {};

for (const name of ["logomark", "wordmark"]) {
  const svg = readFileSync(`public/brand/${name}.svg`, "utf8");
  await page.setContent(svg);
  const box = await page.evaluate(() => {
    const path = document.querySelector("path");
    const { x, y, width, height } = path.getBBox();
    return { x, y, width, height };
  });
  out[name] = box;
  console.log(name, JSON.stringify(box));
}

writeFileSync("scripts/bbox.json", JSON.stringify(out, null, 2));
await browser.close();
