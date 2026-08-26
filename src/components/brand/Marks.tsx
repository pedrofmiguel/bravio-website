import {
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
 */

type MarkProps = {
  className?: string;
  /** Set on the decorative copy inside larger lockups. */
  "aria-hidden"?: boolean;
  title?: string;
};

export function Logomark({ className, title, ...rest }: MarkProps) {
  return (
    <svg
      viewBox={LOGOMARK_VIEWBOX}
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={LOGOMARK_PATH} fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className, title, ...rest }: MarkProps) {
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={WORDMARK_PATH} fill="currentColor" />
    </svg>
  );
}

/** Mark plus wordmark on one baseline, as used in the header and footer. */
export function Lockup({
  className,
  markClassName,
  wordClassName,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <Logomark className={markClassName ?? "h-[26px] w-auto"} />
      <Wordmark className={wordClassName ?? "h-[15px] w-auto"} />
    </span>
  );
}
