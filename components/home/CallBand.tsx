import { Fragment } from "react";
import { callBand } from "@/lib/content/site";
import ArcBg from "@/components/site/ArcBg";
import CopyButton from "@/components/site/CopyButton";
import { Phone } from "@/components/site/Icons";
import CallBandStage from "./CallBandStage";

const chars = (s: string, attr: string) =>
  [...s].map((ch, i) => (
    <span key={i} {...{ [attr]: "" }}>
      {ch}
    </span>
  ));

/**
 * "Call for an appointment 470-302-7769", the booking widget's own title, as
 * a full-bleed punctuation beat (FernGrid's closing CTA mechanics). See
 * CallBandStage for the motion.
 */
export default function CallBand() {
  return (
    <section className="sheet night arc callband" data-tone="night" aria-labelledby="call-title">
      <ArcBg tone="night" />
      <CallBandStage>
        <div className="wrap cb">
          <h2 className="cb-title" id="call-title" data-headline>
            <span className="cb-lead">
              {callBand.lead.split(" ").map((w, i) => (
                <Fragment key={i}>
                  {i > 0 && " "}
                  <span className="cb-word" data-cword>{chars(w, "data-ch")}</span>
                </Fragment>
              ))}
            </span>{" "}
            <span className="cb-num-wrap">
              <span className="cb-num" data-num>{chars(callBand.number, "data-ch")}</span>
              <span className="cb-num cb-fill" data-num-fill aria-hidden="true">{chars(callBand.number, "data-fch")}</span>
            </span>
          </h2>
          <div className="cb-actions" data-cb-rise>
            <span data-magnet>
              <a className="btn lg" href={callBand.button.href}>
                <Phone />
                {callBand.button.label}
              </a>
            </span>
            <span className="cb-copy">
              <span className="mono">{callBand.number}</span>
              <CopyButton value={callBand.number} label={callBand.copyLabel} />
            </span>
          </div>
        </div>
      </CallBandStage>
    </section>
  );
}
