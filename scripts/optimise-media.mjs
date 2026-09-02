/**
 * Turns a folder of camera originals into the web assets in /public/media.
 *
 * The shoot arrives as phone files: 6000px on the long edge, up to 10MB each,
 * and carrying whatever orientation flag the camera felt like writing. None of
 * that belongs in a git repository or on a wire.
 *
 * What this does to each file:
 *   - bakes in the EXIF orientation, so the pixels are the right way up before
 *     the metadata that said so is thrown away
 *   - drops every other tag with it. Phone photos taken inside a client's house
 *     can carry the coordinates of that house; none of these did, but the next
 *     drop is one setting away from doing so
 *   - caps the long edge at MAX_EDGE and never enlarges a smaller original
 *   - re-encodes through mozjpeg
 *
 * MAX_EDGE is deliberately not "as big as possible". The widest any frame is
 * drawn is roughly 45vw of a 1500px measure, so about 700 CSS px, and next/image
 * serves an AVIF or WebP derivative from this file anyway - it is a master for
 * the optimiser, not the thing a visitor downloads.
 *
 *   node scripts/optimise-media.mjs "C:/path/to/originals"
 *
 * Names come from MANIFEST below rather than the camera: media.ts reads far
 * better with `garden-buffet-overhead.jpg` in it than `8cbdd429-075f-46a5.jpg`,
 * and a stable name survives the next re-export of the same frame.
 */
import sharp from "sharp";
import { mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const MAX_EDGE = 2000;
const QUALITY = 80;
const OUT_DIR = "public/media";

/** original file -> published name. The only place the two are tied together. */
const MANIFEST = {
  "1be18ed0-2b4e-4bd4-a012-b100390dce40.jpg": "place-setting.jpg",
  "IMG_4113.jpeg": "long-table-trees.jpg",
  "IMG_3574.jpeg": "plate-over-the-valley.jpg",
  "IMG_4714.jpeg": "bowl-and-rosemary.jpg",
  "e80a8fce-29f7-4c3f-9bca-0da7c24b278a.jpg": "table-blue-runner.jpg",
  "9a52e211-dfd0-4dba-9029-cbeb24e34df7.jpg": "table-spread-overhead.jpg",
  "IMG_0053.jpeg": "fried-fish-platter.jpg",
  "IMG_3400.jpeg": "garden-buffet-tartlets.jpg",
  "IMG_4574.jpeg": "tomato-salad.jpg",
  "IMG_9752.jpeg": "flatbreads-tray.jpg",
  "8cbdd429-075f-46a5-b76e-af1132b70b9f.jpg": "garden-buffet-overhead.jpg",
  "IMG_4287.jpeg": "pea-shoot-canapes.jpg",
  "e25fe547-8843-4d1a-8f35-8924c0d19804.jpg": "toasted-sandwiches.jpg",
  "IMG_4268.jpeg": "raspberry-desserts.jpg",
  "IMG_5210.jpeg": "strawberry-coupes.jpg",
  "IMG_4565.jpeg": "empanadas-box.jpg",
  "861af686-fe91-46b8-bdcc-604108cdfc4b.jpg": "chicken-and-peas.jpg",
  "IMG_4563.jpeg": "cured-meats-and-cherries.jpg",
  "IMG_0038.jpeg": "beef-rolls-platter.jpg",
  "IMG_4285.jpeg": "meringues-and-pearls.jpg",
  "IMG_4291.jpeg": "salmon-tartlets.jpg",
  "97205649-fe66-4227-9427-2feca5f2914d.jpg": "beef-carpaccio.jpg",
};

const src = process.argv[2];
if (!src) {
  console.error('usage: node scripts/optimise-media.mjs "<originals dir>"');
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const kb = (n) => `${Math.round(n / 1024)}kB`;
let before = 0;
let after = 0;

for (const [from, to] of Object.entries(MANIFEST)) {
  const input = join(src, from);
  if (!existsSync(input)) {
    console.error(`MISSING  ${from}`);
    process.exitCode = 1;
    continue;
  }

  const output = join(OUT_DIR, to);
  await sharp(input)
    // .rotate() with no argument applies the EXIF orientation. It has to come
    // first: everything after it works on upright pixels.
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
    .toFile(output);

  const inSize = statSync(input).size;
  const outSize = statSync(output).size;
  before += inSize;
  after += outSize;

  const { width, height } = await sharp(output).metadata();
  console.log(
    `${to.padEnd(30)} ${String(width).padStart(4)}x${String(height).padEnd(4)}  ${kb(inSize).padStart(7)} -> ${kb(outSize)}`
  );
}

console.log(`\ntotal ${kb(before)} -> ${kb(after)}`);
