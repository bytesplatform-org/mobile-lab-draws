import type { CSSProperties } from "react";
import { coverage } from "@/lib/content/site";
import ArcBg from "@/components/site/ArcBg";
import RadiusMap from "./coverage/RadiusMap";
import ScrubText from "@/components/site/ScrubText";
import AffiliateMarquee from "./coverage/AffiliateMarquee";

/**
 * Coverage (paper): the radius map beside the coverage line and the 30-mile
 * radius; then where specimens go: the client's line about it, read in as you
 * scroll, and the affiliates' logos as a sliding band.
 */
export default function Coverage() {
  return (
    <section className="sheet paper arc coverage" id={coverage.id} data-tone="paper" aria-labelledby="coverage-title">
      <ArcBg />
      <div className="wrap" data-parallax>
        <div className="cv-top">
          <figure className="cv-map" data-reveal="settle">
            <RadiusMap pin={coverage.pin} ring={coverage.ring} />
          </figure>
          <div className="cv-copy">
            <h2 className="h-xl" id="coverage-title" data-reveal="lines">{coverage.headline}</h2>
            <p className="cv-radius" data-reveal="settle" style={{ "--i": 1 } as CSSProperties}>
              <span className="cap-dot" data-cap="grey" aria-hidden="true" />
              {coverage.radius}
            </p>
          </div>
        </div>

        <div className="cv-aff">
          <h3 className="cv-aff-h" data-reveal="lines">{coverage.affiliatesLabel}</h3>
          <ScrubText className="cv-aff-note" text={coverage.affiliateNote} lit={["LabCorp", "Quest Diagnostic"]} />
        </div>
        <AffiliateMarquee />
      </div>
    </section>
  );
}
