/**
 * The True Lab Results mark, redrawn from the client's logo: a heart with an
 * offset outline behind it and a white cross over its right lobe. Colours come
 * from CSS (--mark-fill, --mark-line, --mark-cross), so one drawing serves the
 * nav, the statement ring, the loader and the seal. Decorative by default.
 */
export const HEART = "M32 57C14.5 45.2 4 34.2 4 21.6 4 12.6 10.8 6 19.2 6c5.6 0 10.2 3.1 12.8 7.9C34.6 9.1 39.2 6 44.8 6 53.2 6 60 12.6 60 21.6 60 34.2 49.5 45.2 32 57Z";
export const CROSS = "M41.5 9.5h7v6.8h6.8v7h-6.8v6.8h-7v-6.8h-6.8v-7h6.8z";

export default function Mark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      className={className ? `mark ${className}` : "mark"}
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path className="mark-echo" d={HEART} transform="translate(-3.2 2.4)" />
      <path className="mark-heart" d={HEART} />
      <path className="mark-cross" d={CROSS} />
    </svg>
  );
}
