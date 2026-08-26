/**
 * One-off asset pipeline: converts the supplied brand PNGs into clean SVG
 * outlines so the logomark stays crisp at page-transition scale (~60vw).
 * Run with: node scripts/trace-logo.mjs
 */
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const potrace = require("potrace");
const Jimp = require("jimp");

const BRAND = path.resolve("public/brand");
const OUT = path.resolve("public/brand");
mkdirSync(OUT, { recursive: true });

/** Flatten alpha onto white and upscale so potrace has smooth edges to follow. */
async function prepare(file, width) {
  const img = await Jimp.read(path.join(BRAND, file));
  const canvas = await new Jimp(img.bitmap.width, img.bitmap.height, 0xffffffff);
  canvas.composite(img, 0, 0);
  canvas.resize(width, Jimp.AUTO).greyscale();
  return canvas;
}

function trace(jimpImage, options) {
  return new Promise((resolve, reject) => {
    potrace.trace(jimpImage, options, (err, svg) => (err ? reject(err) : resolve(svg)));
  });
}

/** Strip potrace's fixed fill so the mark can inherit brand color from CSS. */
function toCurrentColor(svg) {
  return svg
    .replace(/ fill="[^"]*"/g, "")
    .replace(/<path /g, '<path fill="currentColor" ')
    .replace(/<svg /, '<svg fill="currentColor" ');
}

const jobs = [
  { in: "logomark-pos-dark.png", out: "logomark.svg", width: 1000, turdSize: 2, optTolerance: 0.45 },
  { in: "name-transparent-dark.png", out: "wordmark.svg", width: 1400, turdSize: 3, optTolerance: 0.35 },
];

for (const job of jobs) {
  const img = await prepare(job.in, job.width);
  const svg = await trace(img, {
    threshold: 150,
    turdSize: job.turdSize,
    optCurve: true,
    optTolerance: job.optTolerance,
    alphaMax: 1,
    blackOnWhite: true,
    background: "transparent",
  });
  const cleaned = toCurrentColor(svg);
  writeFileSync(path.join(OUT, job.out), cleaned);
  const paths = (cleaned.match(/<path/g) || []).length;
  console.log(`${job.out}  ${(cleaned.length / 1024).toFixed(1)}kb  paths=${paths}`);
}
