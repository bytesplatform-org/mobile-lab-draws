import { Fragment } from "react";
import { drugScreens } from "@/lib/content/site";
import ArcBg from "@/components/site/ArcBg";
import { SheetLabel } from "@/components/site/SheetHead";
import DrugStage from "./drug/DrugStage";
import Callouts from "./drug/Callouts";
import FlowCloud from "./drug/FlowCloud";
import MorphCloud from "./drug/MorphCloud";
import { SHAPES } from "./drug/shapes";

const tests = drugScreens.tests;

function Soon() {
  return <span className="soon mono">{drugScreens.soon}</span>;
}

/** The clock ring beside "24-hour service available by appointment": its hand sweeps slowly. */
function Hours() {
  return (
    <p className="ds-hours mono" data-ds-hours>
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="17" className="clk-ring" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M20 4.5V7.5" transform={`rotate(${i * 30} 20 20)`} className="clk-tick" />
        ))}
        <path d="M20 20V8" className="clk-hand" />
        <circle cx="20" cy="20" r="2" className="clk-pin" />
      </svg>
      <span>{drugScreens.hours}</span>
    </p>
  );
}

/**
 * DOT & NON DOT Drug Screen, as a point-cloud morph story (FernGrid's
 * era-scene + point-cloud); DrugStage owns the pinned timeline. Story at
 * desktop widths with motion; elsewhere a plain list, each test beside its own
 * small still cloud.
 */
export default function DrugScreens() {
  return (
    <section className="sheet night arc drugs" id={drugScreens.id} data-sheet={drugScreens.id} data-tone="night" aria-labelledby="drugs-title">
      <ArcBg tone="night" />
      <DrugStage>
        <div className="wrap ds-wrap">
          <SheetLabel index={drugScreens.index}>{drugScreens.label}</SheetLabel>
          <h2 className="ds-title" id="drugs-title">
            {drugScreens.title.split(" ").map((w, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span className="ds-tw-mask"><span className="ds-tw" data-ds-tw>{w}</span></span>
              </Fragment>
            ))}
          </h2>
          <div className="ds-kicker" aria-hidden="true" data-ds-kicker>
            <p>{drugScreens.title}</p>
            <i />
          </div>
          <Hours />

          {/* Story */}
          <div className="ds-story" data-ds-story>
            <div className="ds-bigs" aria-hidden="true" data-ds-bigs>
              {tests.map(t => (
                <p className="ds-big" data-ds-big key={t.text}>
                  {t.text}
                  {t.soon && <Soon />}
                </p>
              ))}
            </div>
            <ol className="ds-rail" data-ds-rail>
              {tests.map((t, i) => (
                <li key={t.text}>
                  <button type="button" data-ds-step={i}>
                    <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                    <span>{t.text}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="ds-visual" data-ds-visual>
              <MorphCloud />
              {tests.map(t => (
                <div className="ds-co" data-ds-co key={t.text}>
                  <Callouts anchors={SHAPES[t.shape].anchors} labels={t.callouts} />
                </div>
              ))}
            </div>
          </div>

          {/* Flow */}
          <ol className="ds-flow">
            {tests.map((t, i) => (
              <li key={t.text} data-reveal="settle">
                <div className="ds-flow-fig">
                  <FlowCloud index={i} />
                  <Callouts anchors={SHAPES[t.shape].anchors} labels={t.callouts} />
                </div>
                <div className="ds-flow-text">
                  <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{t.text}</h3>
                  {t.soon && <Soon />}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </DrugStage>
    </section>
  );
}
