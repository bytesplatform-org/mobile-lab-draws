import { Fragment, type CSSProperties } from "react";
import { reviews } from "@/lib/content/site";
import ArcBg from "@/components/site/ArcBg";
import { Phone } from "@/components/site/Icons";
import Kinetic from "./Kinetic";

const STAR = "M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8Z";

/** The headline as words; the accent phrase's words are flagged. */
const words = (() => {
  const [before] = reviews.headline.split(reviews.accent);
  return [
    ...before.trim().split(" ").map(w => ({ w, accent: false })),
    ...reviews.accent.split(" ").map(w => ({ w, accent: true })),
  ];
})();

/**
 * The reviews prompt (night): the headline as a scrubbed kinetic line, each
 * word tilting up out of a blur; "make an appointment today!" sweeps from
 * paper to teal. "Reviews coming soon!" sits beside five outlined stars that
 * fill like liquid one by one, gently, on a loop. One magnetic call button.
 * TODO(client): room for real reviews here once there are some.
 */
export default function Reviews() {
  return (
    <section className="sheet night arc reviews" data-tone="night" aria-labelledby="reviews-title">
      <ArcBg tone="night" />
      <Kinetic>
        <div className="wrap rv">
          <h2 className="rv-title" id="reviews-title" data-kline>
            {words.map(({ w, accent }, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <span className="rv-word" data-kword>
                  <span className={accent ? "rv-accent" : undefined} data-accent={accent || undefined}>{w}</span>
                </span>
              </Fragment>
            ))}
          </h2>
          <div className="rv-foot">
            <p className="rv-soon mono">
              <span className="stars" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} viewBox="0 0 24 24" style={{ "--s": i } as CSSProperties}>
                    <defs>
                      <clipPath id={`star-${i}`}>
                        <path d={STAR} />
                      </clipPath>
                    </defs>
                    <g clipPath={`url(#star-${i})`}>
                      <rect className="star-liquid" x="-4" y="0" width="32" height="26" />
                    </g>
                    <path className="star-line" d={STAR} />
                  </svg>
                ))}
              </span>
              {reviews.soon}
            </p>
            <span data-magnet>
              <a className="btn lg" href={reviews.cta.href}>
                <Phone />
                {reviews.cta.label}
              </a>
            </span>
          </div>
        </div>
      </Kinetic>
    </section>
  );
}
