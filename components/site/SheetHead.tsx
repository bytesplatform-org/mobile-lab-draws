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

/**
 * A section's index label, small above its heading: `01 / SERVICE`. The
 * number is structural; the words are the copy's own. Renders as `as`
 * (an h2 where the section has no client heading of its own).
 */
export function SheetLabel({ index, children, as: Tag = "div", id }: { index?: string; children: ReactNode; as?: "div" | "h2" | "p"; id?: string }) {
  return (
    <Tag className="sheet-label" data-reveal="settle" id={id}>
      {index && <span className="sl-i">{index}</span>}
      {index && <span className="sl-rule" aria-hidden="true">/</span>}
      <span>{children}</span>
    </Tag>
  );
}
