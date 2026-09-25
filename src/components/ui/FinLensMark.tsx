/**
 * FinLens brand mark: a rising trend line that resolves into a small
 * loop/swoosh before pointing forward — recreated as SVG (not a raster
 * image) so it stays crisp at any size, from favicon to header to app icon.
 */
export function FinLensMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 38 L14 24 L9 28 L20 13 C 18 22 30 24 26 11 L36 4"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M36 4 L28 8 M36 4 L32 13"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
