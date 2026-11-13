import { Fragment } from "react";
import Image from "next/image";
import { brand, business, hero } from "@/lib/content/site";
import { Arrow, Phone, Pin } from "@/components/site/Icons";
import HeroStage from "./HeroStage";
import HeroGrid from "./HeroGrid";
import HeroAnnotations from "./HeroAnnotations";

const ledeWords = hero.lede.split(" ");

/**
 * The hero, a combination of both references:
 * - Phase A (FernGrid): the TRUE LAB / RESULTS lockup stands centre-screen
 *   over the darkened tube photograph, with drawing callouts and a
 *   specimen-route network around it; the photo drifts against the pointer.
 * - Phase B (Blueprint): scrolling (pinned) swaps the lockup for the H1, drawn
 *   in GL through a fluid the pointer stirs, each line rising in like liquid;
 *   then the lede.
 * Without motion the lockup, H1 and lede simply stack, in plain DOM type.
 */
export default function Hero() {
  return (
    <HeroStage
      media={
        <Image
          src={hero.image.src}
          alt={hero.image.alt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="hero-img"
        />
      }
      grid={<HeroGrid />}
    >
      <div className="hero-top mono" data-hero-fade>
        <span>{brand.kicker}</span>
        <ol className="hero-seq">
          {brand.sequence.map(s => <li key={s}>{s}</li>)}
        </ol>
      </div>

      <div className="hero-center" data-hero-text>
        <div className="hero-lockup" data-hero-lockup>
          <HeroAnnotations labels={hero.annotations} />
          <p className="lockup">
            <span className="lk-line" data-lk-line>{hero.lockup[0]}</span>{" "}
            <span className="lk-line lk-2" data-lk-line>{hero.lockup[1]}</span>{" "}
            <span className="lk-tag" data-lk-tag>
              <span className="lk-rule" aria-hidden="true" />
              <span className="lk-pill">
                <svg className="lk-ring" viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true" data-lk-ring>
                  <ellipse data-anno-path cx="100" cy="40" rx="97" ry="34" transform="rotate(-3 100 40)" pathLength={1} />
                </svg>
                <span className="mono">{business.tagline}</span>
              </span>
              <span className="lk-rule r" aria-hidden="true" />
            </span>
          </p>
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
