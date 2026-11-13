import { Fragment, type CSSProperties } from "react";
import { services } from "@/lib/content/site";
import { SheetLabel } from "@/components/site/SheetHead";
import ServicesStage from "./ServicesStage";
import Tube from "./Tube";

const conciergeWords = services.concierge.split(" ");
/** Words of the concierge line that light in teal (whole runs from services.conciergeLit). */
const LIT = (() => {
  const hi = new Set<number>();
  services.conciergeLit.forEach(phrase => {
    const run = phrase.split(" ");
    conciergeWords.forEach((_, i) => {
      if (run.every((w, k) => conciergeWords[i + k] === w)) run.forEach((__, k) => hi.add(i + k));
    });
  });
  return hi;
})();

const idx = (i: number) => String(i + 1).padStart(2, "0");

/**
 * SERVICE, as a pinned, scroll-scrubbed tube rack (after Blueprint's
 * FoundationsStory and FernGrid's Our Software); see ServicesStage for the
 * choreography. One markup serves both layouts: the story (desktop, with
 * motion) and the flow (phones, reduced motion, no JS), where the rack is a
 * two-column list of tubes that fill as they enter.
 */
export default function Services() {
  return (
    <section className="sheet paper services" id={services.id} data-sheet={services.id} data-tone="paper" aria-labelledby="services-title">
      <ServicesStage>
        <div className="wrap sv-wrap">
          <div className="sv-kicker" data-sv-kicker>
            <SheetLabel as="h2" index={services.index} id="services-title">{services.label}</SheetLabel>
            <p className="sv-kicker-lead" aria-hidden="true">{services.lead}</p>
          </div>

          <p className="sv-lead" data-sv-lead>
            {services.lead.split(" ").map((w, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span className="sv-lw-mask"><span className="sv-lw" data-sv-lw>{w}</span></span>
              </Fragment>
            ))}
          </p>

          <p className="sv-concierge" data-sv-concierge>
            {conciergeWords.map((w, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span data-cw data-hi={LIT.has(i) ? "" : undefined}>{w}</span>
              </Fragment>
            ))}
          </p>

          <div className="sv-board" data-sv-board>
            <div className="rack" aria-hidden="true" data-rack>
              <div className="rack-tubes">
                {services.tubes.map((t, i) => (
                  <div className="rack-slot" key={t.text} data-slot={i} style={{ "--i": i } as CSSProperties}>
                    <Tube cap={t.cap} id={`r${i}`} className="rack-tube" />
                    <span className="rack-n mono">{idx(i)}</span>
                  </div>
                ))}
              </div>
              <div className="rack-bar front" />
              <div className="rack-bar back" />
              <div className="rack-feet" />
            </div>

            <ol className="sv-list">
              {services.tubes.map((t, i) => (
                <li key={t.text} className="sv-item" data-item={i} data-cap={t.cap}>
                  <Tube cap={t.cap} id={`l${i}`} className="sv-tube" />
                  <span className="sv-n mono">{idx(i)}</span>
                  <span className="cap-dot" aria-hidden="true" />
                  <span className="sv-text">{t.text}</span>
                </li>
              ))}
            </ol>

            <aside className="sv-note" data-sv-note>
              <svg className="sv-receipt" viewBox="0 0 220 24" aria-hidden="true">
                <text x="0" y="17">$</text>
                <path data-receipt d="M20 12H220" pathLength={1} />
              </svg>
              <p>{services.note}</p>
            </aside>
          </div>
        </div>
      </ServicesStage>
    </section>
  );
}
