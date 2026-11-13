import type { CSSProperties, ReactNode } from "react";

/** A heading revealed line by line through a mask, over explicit lines. */
export function MaskLines({ lines }: { lines: ReactNode[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span className="line" key={i} style={i ? ({ "--i": i } as CSSProperties) : undefined}>
          <span>{line}</span>
        </span>
      ))}
    </>
  );
}
