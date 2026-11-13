/**
 * Curved section top (Blueprint's ArcBg, in either tone). Paints the
 * section's own background with a shallow arc on top, --arc-depth tall. Its
 * section (class "arc") overlaps the one before it by that depth, so the
 * previous sheet shows beside the curve. First child of the section; the
 * section reserves the space with .arc padding.
 */
export default function ArcBg({ tone = "paper" }: { tone?: "paper" | "night" }) {
  return (
    <div className={`arc-bg arc-${tone}`} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 100 Q50 -100 100 100 Z" />
      </svg>
    </div>
  );
}
