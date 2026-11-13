import type { CSSProperties } from "react";
import { business, CAP_ORDER, statement } from "@/lib/content/site";
import ArcBg from "@/components/site/ArcBg";
import Mark from "@/components/site/Mark";
import StatementLabel from "./StatementLabel";

/**
 * A barcode drawn from a string (FNV-1a over its characters), so it's the same
 * on the server and the client. Guard bars at both ends and the middle run long.
 */
function barcode(seed: string, n: number) {
  let h = 2166136261;
  let x = 0;
  const bars: { x: number; w: number; guard: boolean }[] = [];
  for (let i = 0; i < n; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i;
    h = Math.imul(h, 16777619) >>> 0;
    const w = 1 + (h % 4);
    const guard = i < 2 || i >= n - 2 || i === n >> 1 || i === (n >> 1) + 1;
    bars.push({ x, w: guard ? 1.5 : w, guard });
    x += (guard ? 1.5 : w) + 1 + ((h >>> 5) % 3);
  }
  return { bars, width: x };
}

function Barcode({ seed, n, className }: { seed: string; n: number; className?: string }) {
  const { bars, width } = barcode(seed, n);
  return (
    <svg className={className} viewBox={`0 0 ${width} 70`} preserveAspectRatio="none" aria-hidden="true">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={b.guard ? 70 : 60} />
      ))}
    </svg>
  );
}

/**
 * The paper sheet that rises over the hero: the practice set as a specimen
 * label (StatementLabel scrubs it in). Its header carries the mark, name and
 * tagline; a stripe of the six tube-cap colours runs down its edge; a barcode
 * prints in over the phone number; the four credentials are its fields; a
 * perforated stub carries the legal name; and a stamp lands in the header last.
 */
export default function Statement() {
  return (
    <section className="sheet paper arc statement" data-tone="paper" aria-labelledby="statement-title">
      <ArcBg />
      <div className="wrap">
        <StatementLabel>
          <article className="slab" data-slab>
            <div className="slab-caps" aria-hidden="true">
              {CAP_ORDER.map((cap, i) => (
                <i key={cap} data-cap={cap} data-slab-cap style={{ "--i": i } as CSSProperties} />
              ))}
            </div>

            <div className="slab-body">
              <header className="slab-head">
                <Mark className="slab-mark" />
                <div className="slab-id">
                  <h2 className="slab-name" id="statement-title" data-slab-in>{business.name}</h2>
                  <p className="slab-tag mono" data-slab-in>{business.tagline}</p>
                </div>
                <div className="slab-stamp" data-slab-stamp aria-hidden="true">
                  <span className="mono">{statement.stamp}</span>
                </div>
                <div className="slab-code" data-slab-in>
                  <Barcode seed={business.name} n={46} className="slab-bars" />
                  <p className="mono">{business.phone}</p>
                </div>
              </header>

              <dl className="slab-fields">
                {statement.credentials.map((c, i) => (
                  <div key={c.k} data-slab-field style={{ "--i": i } as CSSProperties}>
                    <dt className="mono">
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      {c.k}
                    </dt>
                    <dd>{c.v}</dd>
                  </div>
                ))}
              </dl>

              <footer className="slab-stub" data-slab-in>
                <span className="mono">{statement.stub}</span>
                <span className="mono slab-legal">{business.legalName}</span>
                <Barcode seed={business.legalName} n={22} className="slab-bars small" />
              </footer>
            </div>

          </article>
        </StatementLabel>
      </div>
    </section>
  );
}
