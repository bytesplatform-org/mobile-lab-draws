import type { CSSProperties } from "react";
import { business, statement } from "@/lib/content/site";
import ArcBg from "@/components/site/ArcBg";
import Mark from "@/components/site/Mark";
import StatementRing from "./StatementRing";
import NeedleDrop from "./NeedleDrop";

/**
 * The paper sheet that rises over the hero: the name and tagline turning on a
 * ring around the heart-cross mark, a needle dropping from it into a small
 * red drop, and the practice's four credentials, all from the copy.
 */
export default function Statement() {
  return (
    <section className="sheet paper arc statement" data-tone="paper" aria-labelledby="statement-title">
      <ArcBg />
      <div className="wrap">
        <h2 id="statement-title" className="sr-only">
          {business.name}: {business.tagline}
        </h2>

        <StatementRing text={statement.ring}>
          <Mark className="mark-xl" />
        </StatementRing>

        <NeedleDrop />

        <dl className="creds">
          {statement.credentials.map((c, i) => (
            <div key={c.k} data-reveal="settle" style={i ? ({ "--i": i } as CSSProperties) : undefined}>
              <dt className="mono">{c.k}</dt>
              <dd>{c.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
