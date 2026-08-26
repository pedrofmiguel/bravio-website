/**
 * Film grain.
 *
 * Fixed and pointer-events-none so it never sits inside a scrolling container:
 * a noise layer that repaints with the page is one of the fastest ways to lose
 * frames on mobile. Static SVG turbulence, no animation, very low opacity.
 */
const NOISE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
       <filter id="n">
         <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/>
         <feColorMatrix type="saturate" values="0"/>
       </filter>
       <rect width="100%" height="100%" filter="url(#n)"/>
     </svg>`
  );

export default function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] opacity-[0.035] mix-blend-multiply dark:opacity-[0.05] dark:mix-blend-screen"
      style={{ backgroundImage: `url("${NOISE}")`, backgroundRepeat: "repeat" }}
    />
  );
}
