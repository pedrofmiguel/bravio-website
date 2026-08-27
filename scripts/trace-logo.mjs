/**
 * One-off asset pipeline: converts the supplied brand artwork into clean SVG
 * outlines so the marks stay crisp at page-transition scale (~60vw).
 * Run with: node scripts/trace-logo.mjs
 *
 * Both marks are cut out of `logo-dark-transparent.png`, the full lockup. That
 * file is the highest resolution artwork in the kit by a wide margin - the mark
 * is 349px tall in it against 252px in logomark-*.png, and the wordmark is
 * 240px against 78px in name-*.png. Tracing the standalone files meant
 * upscaling a 78px tall bitmap 5x before potrace ever saw it, which is what
 * softened the letterforms.
 *
 * Cutting both from one file also means the lockup's own proportions are
 * measurable rather than guessed, so LOCKUP_* ratios are emitted alongside the
 * paths and the header no longer hand-picks mark and wordmark heights.
 */
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const potrace = require("potrace");

const BRAND = path.resolve("public/brand");
const OUT = path.resolve("public/brand");
const SOURCE = "logo-dark-transparent.png";
mkdirSync(OUT, { recursive: true });

/** Raw pixel reader with an ink test, so bounds ignore alpha and near-white. */
async function readInk(file) {
  const { data, info } = await sharp(path.join(BRAND, file))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const on = (x, y) => {
    const i = (y * width + x) * channels;
    if (data[i + 3] < 24) return false;
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    return lum <= 200;
  };
  return { width, height, on };
}

/**
 * Splits the lockup into its two blocks by column occupancy.
 *
 * Columns with no ink separate the mark from the wordmark. Runs closer than
 * GUTTER are merged first, otherwise the mark's stray tendrils and the gaps
 * between letters would each read as a block of their own.
 */
function splitBlocks({ width, height, on }) {
  const GUTTER = 20;

  const filled = [];
  for (let x = 0; x < width; x++) {
    let any = false;
    for (let y = 0; y < height && !any; y++) if (on(x, y)) any = true;
    filled.push(any);
  }

  const runs = [];
  let start = null;
  for (let x = 0; x < width; x++) {
    if (filled[x] && start === null) start = x;
    if (!filled[x] && start !== null) runs.push([start, x - 1]), (start = null);
  }
  if (start !== null) runs.push([start, width - 1]);

  const merged = [];
  for (const run of runs) {
    const last = merged[merged.length - 1];
    if (last && run[0] - last[1] < GUTTER) last[1] = run[1];
    else merged.push([...run]);
  }

  if (merged.length !== 2) {
    throw new Error(
      `expected mark + wordmark in ${SOURCE}, found ${merged.length} blocks`
    );
  }

  return merged.map(([x0, x1]) => {
    let y0 = height;
    let y1 = -1;
    for (let x = x0; x <= x1; x++)
      for (let y = 0; y < height; y++)
        if (on(x, y)) {
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
    return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  });
}

/**
 * Crops one block out of the lockup and prepares it for potrace.
 *
 * The margin keeps the outermost tendrils away from the canvas edge so potrace
 * closes them instead of running them into the border. Lanczos resampling on
 * the way up matters more than the target width: the sources are small, so the
 * quality of the interpolation is what the traced curve actually follows.
 */
async function prepare(file, box, width) {
  const margin = Math.round(Math.max(box.w, box.h) * 0.04);
  return sharp(path.join(BRAND, file))
    .extract({
      left: box.x - margin,
      top: box.y - margin,
      width: box.w + margin * 2,
      height: box.h + margin * 2,
    })
    .flatten({ background: "#ffffff" })
    .resize({ width, kernel: "lanczos3" })
    .greyscale()
    .png()
    .toBuffer();
}

function trace(buffer, options) {
  return new Promise((resolve, reject) => {
    potrace.trace(buffer, options, (err, svg) => (err ? reject(err) : resolve(svg)));
  });
}

/** Strip potrace's fixed fill so the mark can inherit brand color from CSS. */
function toCurrentColor(svg) {
  return svg
    .replace(/ fill="[^"]*"/g, "")
    .replace(/<path /g, '<path fill="currentColor" ')
    .replace(/<svg /, '<svg fill="currentColor" ');
}

const source = await readInk(SOURCE);
const [markBox, wordBox] = splitBlocks(source);

console.log("lockup source:", `${source.width}x${source.height}`);
console.log("  mark    ", JSON.stringify(markBox));
console.log("  wordmark", JSON.stringify(wordBox));

const jobs = [
  { box: markBox, out: "logomark.svg", width: 1600, turdSize: 2 },
  { box: wordBox, out: "wordmark.svg", width: 2400, turdSize: 2 },
];

for (const job of jobs) {
  const img = await prepare(SOURCE, job.box, job.width);
  const svg = await trace(img, {
    // The midpoint between the ink (#341114, luma ~30) and the white it is
    // flattened onto. The old 150 sat well above it, so every antialiased edge
    // pixel counted as ink and the mark traced ~1px fat all the way round -
    // which is what closed up the fine gaps between the tendrils.
    threshold: 142,
    turdSize: job.turdSize,
    optCurve: true,
    // Tight, because the curve is following real artwork rather than smoothing
    // over upscaling artefacts now.
    optTolerance: 0.2,
    alphaMax: 1,
    blackOnWhite: true,
    background: "transparent",
  });
  const cleaned = toCurrentColor(svg);
  writeFileSync(path.join(OUT, job.out), cleaned);
  const paths = (cleaned.match(/<path/g) || []).length;
  console.log(`${job.out}  ${(cleaned.length / 1024).toFixed(1)}kb  paths=${paths}`);
}

/* The lockup's own proportions, so the header does not have to guess them.
   Both are expressed against the mark's height, which is the one size a
   caller picks. */
writeFileSync(
  path.join(path.resolve("scripts"), "lockup.json"),
  JSON.stringify(
    {
      wordRatio: wordBox.h / markBox.h,
      gapRatio: (wordBox.x - (markBox.x + markBox.w)) / markBox.h,
    },
    null,
    2
  )
);
console.log(
  "lockup ratios: word",
  (wordBox.h / markBox.h).toFixed(4),
  "gap",
  ((wordBox.x - (markBox.x + markBox.w)) / markBox.h).toFixed(4)
);
