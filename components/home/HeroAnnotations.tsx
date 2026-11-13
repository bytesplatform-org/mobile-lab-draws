/**
 * Engineering-drawing callouts around the hero lockup (FernGrid): a mono
 * label and a curved teal arrow ending in a ring on the type. Labels are
 * terms from the copy. Decorative (aria-hidden), desktop only; HeroStage draws
 * them in and gives them the strongest pointer parallax.
 */
const LAYOUT = [
  { box: "a1", w: 230, h: 130, d: "M 124 26 C 176 26, 206 48, 212 104", ring: [214, 116], at: "lt" },
  { box: "a2", w: 230, h: 130, d: "M 106 24 C 52 22, 22 52, 18 104", ring: [16, 116], at: "rt" },
  { box: "a3", w: 240, h: 120, d: "M 132 98 C 192 100, 222 70, 226 22", ring: [227, 12], at: "lb" },
  { box: "a4", w: 230, h: 120, d: "M 120 98 C 66 100, 20 76, 14 24", ring: [12, 13], at: "rb" },
] as const;

export default function HeroAnnotations({ labels }: { labels: string[] }) {
  return (
    <div className="annos" aria-hidden="true" data-hero-annos>
      {LAYOUT.map((a, i) => (
        <div key={a.box} className={`anno ${a.box}`} data-anno style={{ width: a.w, height: a.h }}>
          <svg viewBox={`0 0 ${a.w} ${a.h}`} width={a.w} height={a.h}>
            <path data-anno-path d={a.d} pathLength={1} />
            <circle cx={a.ring[0]} cy={a.ring[1]} r={6} className="anno-ring" />
            <circle cx={a.ring[0]} cy={a.ring[1]} r={2} className="anno-dot" />
          </svg>
          <span className={`anno-label mono ${a.at}`}>
            <i />
            {labels[i]}
          </span>
        </div>
      ))}
    </div>
  );
}
