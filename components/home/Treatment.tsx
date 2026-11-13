import type { CSSProperties, ReactNode } from "react";
import { treatment, type IconName } from "@/lib/content/site";
import ArcBg from "@/components/site/ArcBg";
import ScrubText from "@/components/site/ScrubText";
import { Arrow } from "@/components/site/Icons";
import TreatmentFlow from "./TreatmentFlow";

/** Eight line icons in one style (pathLength 1, so each draws itself in). */
const ICONS: Record<IconName, ReactNode> = {
  // toxicology: a flask
  flask: (<><path pathLength={1} d="M9 3h6M10 3v6l-5.2 9.1A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-2.9L14 9V3" /><path pathLength={1} d="M7.3 15h9.4" /></>),
  // DOT and non-DOT: a split shield
  shield: (<><path pathLength={1} d="M12 3c2.5 1.6 5 2.2 8 2.3V11c0 4.6-3.2 8.2-8 10-4.8-1.8-8-5.4-8-10V5.3c3-.1 5.5-.7 8-2.3Z" /><path pathLength={1} d="M12 3v18" /></>),
  // oral fluid: a swab
  swab: (<><path pathLength={1} d="M5 19 14.5 9.5" /><path pathLength={1} d="M14.2 4.6c1.6-1.6 4-1.7 5.3-.4 1.3 1.3 1.2 3.7-.4 5.3-1.6 1.6-3.6 1.4-4.6.4-1-1-1.9-3.7-.3-5.3Z" /></>),
  // PGx: a DNA helix
  helix: (<><path pathLength={1} d="M7 3c0 5 10 5 10 9s-10 4-10 9" /><path pathLength={1} d="M17 3c0 5-10 5-10 9s10 4 10 9" /><path pathLength={1} d="M8.5 6.5h7M9 17.5h6M10.5 12h3" /></>),
  // mobile collection: a van
  van: (<><path pathLength={1} d="M2.5 16.5V7.5a1 1 0 0 1 1-1H14v10H2.5Z" /><path pathLength={1} d="M14 9.5h3.6l3.4 3.6v3.4H14" /><circle pathLength={1} cx="6.5" cy="17.5" r="1.8" /><circle pathLength={1} cx="17" cy="17.5" r="1.8" /><path pathLength={1} d="M7 9.2v3.6M5.2 11h3.6" /></>),
  // rapid screening: a test strip with a bolt
  strip: (<><rect pathLength={1} x="8" y="2.5" width="8" height="19" rx="2" /><path pathLength={1} d="M13 6l-2.4 4.2h2.8L11 15" /><path pathLength={1} d="M10.5 18h3" /></>),
  // compliance: a clipboard with a check
  clipboard: (<><path pathLength={1} d="M9 4.5H6.5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-15a1 1 0 0 0-1-1H15" /><rect pathLength={1} x="9" y="3" width="6" height="3" rx="1" /><path pathLength={1} d="m8.8 13.4 2.3 2.3 4.4-4.6" /></>),
  // RPM and CCM: a pulse monitor
  pulse: (<><rect pathLength={1} x="2.5" y="4.5" width="19" height="13" rx="2" /><path pathLength={1} d="M5 11h3l1.6-3.2L12.4 14l1.8-3H19" /><path pathLength={1} d="M9 21h6M12 17.5V21" /></>),
};

/**
 * Treatment-center support (paper): the paragraph reads in as you scroll,
 * the seven facility types lighting teal as the reading head passes them;
 * beside it the same seven set large, each drawing its teal rule in
 * (Blueprint's Impact). Then "Our services include:" and the eight items as
 * a thread (TreatmentFlow).
 */
export default function Treatment() {
  return (
    <section className="sheet paper arc treatment" id={treatment.id} data-sheet={treatment.id} data-tone="paper" aria-labelledby="treatment-title">
      <ArcBg />
      <div className="wrap" data-parallax>
        <div className="tr-top">
          <div className="tr-copy">
            <h2 className="sr-only" id="treatment-title">{treatment.label}</h2>
            <ScrubText className="tr-body" text={treatment.body} lit={treatment.facilities} />
          </div>
          <ul className="tr-fac" aria-hidden="true">
            {treatment.facilities.map((f, i) => (
              <li key={f} data-reveal="settle" style={i ? ({ "--i": i % 3 } as CSSProperties) : undefined}>
                <span className="g-rule" data-reveal="rule" />
                <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="g-name">{f}</span>
                <Arrow />
              </li>
            ))}
          </ul>
        </div>

        <div className="tr-caps">
          <h3 className="h-lg tr-includes" data-reveal="lines">{treatment.includes}</h3>
          <TreatmentFlow>
            {treatment.items.map((item, i) => (
              <li className="cap" key={item.text} data-reveal="settle" style={i % 4 ? ({ "--i": i % 4 } as CSSProperties) : undefined}>
                <span className="ic">
                  <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[item.icon]}</svg>
                </span>
                <span className="cap-t">{item.text}</span>
              </li>
            ))}
          </TreatmentFlow>
        </div>
      </div>
    </section>
  );
}
