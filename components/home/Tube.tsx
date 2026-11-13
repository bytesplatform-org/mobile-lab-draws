import type { CSSProperties } from "react";
import type { Cap } from "@/lib/content/site";

/**
 * A specimen tube in SVG (40 × 200): glass, a liquid in its cap colour whose
 * surface is a travelling wave (the meniscus wobble, CSS), and the cap.
 * The level is --lv (0–1, default full); the cap sits on with .capped (or
 * whenever the tube isn't [data-armed]). Decorative: the text beside it says
 * what it is.
 */
export default function Tube({ cap, id, className, style }: { cap: Cap; id: string; className?: string; style?: CSSProperties }) {
  const clip = `tube-in-${id}`;
  return (
    <svg className={className ? `tube ${className}` : "tube"} viewBox="0 0 40 200" data-cap={cap} style={style} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clip}>
          <path d="M10.4 24V174a9.6 9.6 0 0 0 19.2 0V24Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <g className="tube-liquid">
          <path className="tube-wave" d="M-40 34q10-5 20 0t20 0 20 0 20 0 20 0 20 0V200H-40Z" />
          <path className="tube-shine" d="M14 40V170" />
        </g>
      </g>
      <path className="tube-glass" d="M8 24V174a12 12 0 0 0 24 0V24" />
      <path className="tube-lip" d="M5 25H35" />
      <g className="tube-cap">
        <rect x="4" y="2" width="32" height="22" rx="4.5" />
        <path d="M11 6v14M17 6v14M23 6v14M29 6v14" />
      </g>
    </svg>
  );
}
