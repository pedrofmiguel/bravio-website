/**
 * Builds the browser and home-screen icons from the vector logomark.
 *
 * The mark ships with fill="currentColor", which is right inside the page and
 * wrong as a favicon: a tab has no text colour to inherit, so it draws black
 * and disappears on a dark tab bar. Here it is set in creme on a fig square,
 * the site's own negative lockup, which reads on light and dark chrome alike.
 *
 * Output goes to the Next.js file conventions in src/app, which emit the
 * <link> tags themselves:
 *   favicon.ico     16, 32 and 48px. Also what crawlers fetch at /favicon.ico.
 *   icon.png        512px, for high density tabs, bookmarks and Android.
 *   apple-icon.png  180px and opaque. iOS ignores SVG and fills transparency black.
 *
 *   node scripts/make-icons.mjs
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const FIG = "#341114";
const CREME = "#f7f0e4";
/** Share of the square the mark spans. Tighter than the brand tiles, because
    at 16px every pixel of padding is a pixel the mark does not get. */
const MARK_SCALE = 0.8;

const svg = readFileSync("public/brand/logomark.svg", "utf8").replaceAll(
  "currentColor",
  CREME
);

async function square(size) {
  const inner = Math.round(size * MARK_SCALE);
  const mark = await sharp(Buffer.from(svg), { density: 300 })
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: FIG } })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toBuffer();
}

/** An .ico is a directory of images; modern ones may simply embed PNGs. */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);

  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const icoImages = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, data: await square(size) }))
);
writeFileSync("src/app/favicon.ico", ico(icoImages));
writeFileSync("src/app/icon.png", await square(512));
writeFileSync("src/app/apple-icon.png", await square(180));

console.log("wrote src/app/favicon.ico, icon.png, apple-icon.png");
