import type { CSSProperties } from "react";
import { business, coverage } from "@/lib/content/site";
import ArcBg from "@/components/site/ArcBg";
import CopyButton from "@/components/site/CopyButton";
import { SheetLabel } from "@/components/site/SheetHead";
import RadiusMap from "./coverage/RadiusMap";
import CredentialSeal from "./coverage/CredentialSeal";

/**
 * Coverage and affiliates (paper): the radius map beside the coverage line,
 * the 30-mile radius and the affiliates as text wordmarks (no third-party
 * logos); then the credential seal beside the practice's details, with copy
 * buttons where they help.
 */
export default function Coverage() {
  const d = coverage.details;
  return (
    <section className="sheet paper arc coverage" id={coverage.id} data-tone="paper" aria-labelledby="coverage-title">
      <ArcBg />
      <div className="wrap" data-parallax>
        <div className="cv-top">
          <figure className="cv-map" data-reveal="settle">
            <RadiusMap pin={coverage.pin} ring={coverage.ring} />
          </figure>
          <div className="cv-copy">
            <SheetLabel index={coverage.index}>{coverage.ring}</SheetLabel>
            <h2 className="h-xl" id="coverage-title" data-reveal="lines">{coverage.headline}</h2>
            <p className="cv-radius" data-reveal="settle" style={{ "--i": 1 } as CSSProperties}>
              <span className="cap-dot" data-cap="grey" aria-hidden="true" />
              {coverage.radius}
            </p>
            <div className="cv-aff" data-reveal="settle" style={{ "--i": 2 } as CSSProperties}>
              <h3 className="mono">{coverage.affiliatesLabel}</h3>
              {/* TODO(client): confirm affiliate wording. */}
              <ul>
                {coverage.affiliates.map(a => <li key={a}>{a}</li>)}
              </ul>
              <p>{coverage.affiliateNote}</p>
            </div>
          </div>
        </div>

        <div className="cv-seal">
          <CredentialSeal ring={coverage.seal.ring} tags={coverage.seal.tags} />
          <dl className="spec" data-reveal="settle">
            <div className="spec-row"><dt>{d.legal}</dt><dd>{business.legalName}</dd></div>
            <div className="spec-row">
              <dt>{d.address}</dt>
              <dd className="spec-copy"><span>{business.address}</span><CopyButton value={business.address} /></dd>
            </div>
            <div className="spec-row">
              <dt>{d.phone}</dt>
              <dd className="spec-copy"><a href={business.phoneHref}>{business.phone}</a><CopyButton value={business.phone} /></dd>
            </div>
            <div className="spec-row">
              <dt>{d.fax}</dt>
              <dd className="spec-copy"><a href={business.faxHref}>{business.fax}</a><CopyButton value={business.fax} /></dd>
            </div>
            <div className="spec-row"><dt>{d.affiliates}</dt><dd>{coverage.affiliates.join(" · ")}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}
