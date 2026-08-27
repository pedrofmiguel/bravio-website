import type { CSSProperties } from "react";
import {
  LOCKUP_GAP_RATIO,
  LOCKUP_WORD_RATIO,
  LOGOMARK_PATH,
  LOGOMARK_VIEWBOX,
  WORDMARK_PATH,
  WORDMARK_VIEWBOX,
} from "@/lib/brand-paths";

/**
 * The brand marks, inlined as vectors.
 *
 * The supplied assets were PNG only, so scripts/trace-logo.mjs outlines them
 * once at build time. Inlining keeps them crisp at page-transition scale and
 * lets them inherit colour, which is what makes the positive and negative
 * lockups work without shipping two files.
 *
 * fillRule is not optional here. potrace emits one path per mark whose holes -
 * the counters of b, a and o, and the gaps between the anemone's tendrils -
 * are subpaths wound the same way as the outline, so they only read as holes
 * under even-odd. Under SVG's default nonzero they fill in solid, which turns
 * the wordmark into four blobs and the mark's centre into a smudge.
 */

type MarkProps = {
  className?: string;
  style?: CSSProperties;
  /** Set on the decorative copy inside larger lockups. */
  "aria-hidden"?: boolean;
  title?: string;
};

export function Logomark({ className, style, title, ...rest }: MarkProps) {
  return (
    <svg
      viewBox={LOGOMARK_VIEWBOX}
      className={className}
      style={style}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={LOGOMARK_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

export function Wordmark({ className, style, title, ...rest }: MarkProps) {
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      className={className}
      style={style}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={WORDMARK_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/**
 * Mark plus wordmark on one baseline, as used in the header.
 *
 * Only the mark's height is chosen. The wordmark's height and the space
 * between them are fixed ratios of it, measured off the supplied lockup by
 * scripts/trace-logo.mjs, so the two marks keep the relationship the brand
 * draws them in at every size. Picking the two heights independently is how
 * the header ended up with a wordmark about a sixth too small for its mark.
 */
export function Lockup({
  className,
  size = 26,
}: {
  className?: string;
  /** Height of the logomark in px. Everything else follows from it. */
  size?: number;
}) {
  return (
    <span
      className={`inline-flex items-center ${className ?? ""}`}
      style={{ gap: `${size * LOCKUP_GAP_RATIO}px` }}
    >
      <Logomark style={{ height: `${size}px`, width: "auto" }} />
      <Wordmark
        style={{ height: `${size * LOCKUP_WORD_RATIO}px`, width: "auto" }}
      />
    </span>
  );
}
