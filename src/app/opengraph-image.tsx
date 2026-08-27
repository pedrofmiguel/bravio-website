/* eslint-disable @next/next/no-img-element --
   Satori renders this tree, not a browser. It understands <img> and nothing
   else: next/image would emit markup it cannot parse, and there is no LCP or
   bandwidth to optimise in a 1200x630 PNG generated once at build time. */
import { ImageResponse } from "next/og";
import {
  LOCKUP_GAP_RATIO,
  LOCKUP_WORD_RATIO,
  LOGOMARK_PATH,
  LOGOMARK_VIEWBOX,
  WORDMARK_PATH,
  WORDMARK_VIEWBOX,
} from "@/lib/brand-paths";

/**
 * The card that shows up when the site is shared.
 *
 * Drawn from the same vectors the header uses, at the lockup's own
 * proportions, so the shared card and the site agree. It is deliberately the
 * negative lockup on a fig field and nothing else: no text is rendered, which
 * besides being the brand's own composition means the image needs no font
 * loaded into Satori and cannot break on a build machine without network.
 *
 * The marks go in as data-URI SVGs rather than JSX <svg> because that is the
 * path through Satori with the fewest surprises around fill-rule, which these
 * paths depend on completely - see Marks.tsx.
 */

export const alt = "bravio - private chef and catering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FIG = "#341114";
const CREME = "#f7f0e4";

/** One mark as a standalone SVG document, base64'd for use as an <img src>. */
function markSrc(viewBox: string, d: string) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">` +
    `<path d="${d}" fill="${CREME}" fill-rule="evenodd"/>` +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export default function Image() {
  // Sized off the mark, exactly as <Lockup> does.
  const mark = 190;
  const word = mark * LOCKUP_WORD_RATIO;
  const gap = mark * LOCKUP_GAP_RATIO;

  // The marks' own aspect ratios, so neither is stretched.
  const [, , markVbW, markVbH] = LOGOMARK_VIEWBOX.split(" ").map(Number);
  const [, , wordVbW, wordVbH] = WORDMARK_VIEWBOX.split(" ").map(Number);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: FIG,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <img
            src={markSrc(LOGOMARK_VIEWBOX, LOGOMARK_PATH)}
            width={(mark * markVbW) / markVbH}
            height={mark}
            alt=""
          />
          <img
            src={markSrc(WORDMARK_VIEWBOX, WORDMARK_PATH)}
            width={(word * wordVbW) / wordVbH}
            height={word}
            alt=""
          />
        </div>
      </div>
    ),
    size
  );
}
