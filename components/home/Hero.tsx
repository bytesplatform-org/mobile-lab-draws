import { Fragment, type CSSProperties } from "react";
import Image from "next/image";
import { brand, business, CAP_ORDER, hero } from "@/lib/content/site";
import { Arrow, Phone, Pin } from "@/components/site/Icons";
import HeroStage from "./HeroStage";
import Tube from "./Tube";
import { LEVELS } from "./heroTubes";

const ledeWords = hero.lede.split(" ");

/**
 * The hero.
 * - Phase A: the tube photograph, darkened, behind a lockup set left that
 *   rises in like liquid, over the tagline behind a stripe of the six cap
 *   colours. To its right four specimen tubes stand in a slim rack, each
 *   labelled (a vertical sticker) with a term from the copy; on load they
 *   rise into the rack, fill in their cap colours and their caps click on.
 *   A graduated scale runs down the left edge, its liquid level rising.
 * - Phase B (Blueprint's GL type): scrolling (pinned) swaps all that for the
 *   H1, drawn in GL through a fluid the pointer stirs, each line rising in
 *   like liquid; then the lede.
 * Without motion everything simply stacks, the tubes already full.
 */
export default function Hero() {
  return (
    <HeroStage
      media={
        <Image src={hero.image.src} alt={hero.image.alt} fill loading="eager" fetchPriority="high" sizes="100vw" className="hero-img" />
      }
    >
      <div className="hero-top mono" data-hero-fade>
        <span>{brand.kicker}</span>
        <ol className="hero-seq">
          {brand.sequence.map(s => <li key={s}>{s}</li>)}
        </ol>
      </div>

      <div className="hero-ruler" data-hero-ruler aria-hidden="true">
        <i className="hr-level" data-hero-level />
      </div>

      <div className="hero-center" data-hero-text>
        <div className="hero-a" data-hero-lockup>
          <p className="lockup">
            <span className="lk-mask"><span className="lk-line" data-lk-line>{hero.lockup[0]}</span></span>{" "}
            <span className="lk-mask"><span className="lk-line lk-2" data-lk-line>{hero.lockup[1]}</span></span>
          </p>
          <p className="lk-tag" data-lk-tag>
            <span className="lk-caps" aria-hidden="true">
              {CAP_ORDER.map((cap, i) => <i key={cap} data-cap={cap} style={{ "--i": i } as CSSProperties} />)}
            </span>
            <span className="mono">{business.tagline}</span>
          </p>
        </div>

        <div className="hero-tubes" data-hero-readout aria-hidden="true">
          {hero.readout.map((r, i) => (
            <div className="ht" key={r.label} data-ht style={{ "--i": i } as CSSProperties}>
              <Tube cap={r.cap} id={`hero-${i}`} className="ht-tube" style={{ "--lv": LEVELS[i] } as CSSProperties} />
              <span className="ht-label mono">{r.label}</span>
            </div>
          ))}
          <span className="ht-rack" data-ht />
        </div>

        <div className="hero-head" data-hero-head>
          <h1 className="hero-title" id="hero-title" aria-label={hero.title}>
            {hero.lines.map((line, l) => (
              <Fragment key={l}>
                {l > 0 && " "}
                <span className="hl" data-line data-dir={line.dir}>
                  {line.words.map((w, i) => (
                    <Fragment key={w.text}>
                      {i > 0 && " "}
                      <span className="hw" data-atlas-word data-hollow={w.hollow ? "" : undefined}>{w.text}</span>
                      <span className="bl" data-baseline />
                    </Fragment>
                  ))}
                </span>
              </Fragment>
            ))}
          </h1>
          <p className="hero-lede">
            {ledeWords.map((w, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span className="lede-w" data-lede-word>{w}</span>
              </Fragment>
            ))}
          </p>
        </div>
      </div>

      <div className="hero-bar">
        <div className="hero-ctas">
          <span data-hero-cta data-magnet>
            <a className="btn" href={hero.ctas.call.href}>
              <Phone />
              {hero.ctas.call.label}
            </a>
          </span>
          <span data-hero-cta>
            <a className="btn ghost" href={hero.ctas.services.href}>
              {hero.ctas.services.label}
              <Arrow />
            </a>
          </span>
        </div>
        <span data-hero-cta>
          <a className="btn ghost" href={hero.ctas.directions.href} target="_blank" rel="noopener">
            <Pin />
            {hero.ctas.directions.label}
          </a>
        </span>
      </div>
    </HeroStage>
  );
}
