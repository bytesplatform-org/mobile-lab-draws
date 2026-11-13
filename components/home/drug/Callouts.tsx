import type { Anchor } from "./shapes";

/**
 * Mono callout tags with leader lines over a square point-cloud box
 * (FernGrid's era/callouts). Anchors and labels are in 0–1 box coordinates;
 * the labels are terms from the test's own line.
 */
export default function Callouts({ anchors, labels }: { anchors: Anchor[]; labels: string[] }) {
  const items = labels.map((label, i) => ({ label, ...anchors[i % anchors.length] }));
  return (
    <div className="callouts" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {items.map((c, i) => {
          const elbow = c.ly * 100 + 2.2;
          return <polyline key={i} points={`${c.lx * 100},${elbow} ${c.ax * 100},${elbow} ${c.ax * 100},${c.ay * 100}`} vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
      {items.map((c, i) => (
        <span key={i}>
          <span className="co-dot" style={{ left: `${c.ax * 100}%`, top: `${c.ay * 100}%` }} />
          <span className={c.align === "right" ? "co-label mono r" : "co-label mono"} style={{ left: `${c.lx * 100}%`, top: `${c.ly * 100 + 2.2}%` }}>
            {c.label}
          </span>
        </span>
      ))}
    </div>
  );
}
