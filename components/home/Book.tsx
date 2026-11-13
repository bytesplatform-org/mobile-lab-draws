import Image from "next/image";
import type { CSSProperties } from "react";
import { book } from "@/lib/content/site";
import { Phone } from "@/components/site/Icons";
import BookMenu from "./BookMenu";

const RINGS = [27, 22.5, 18, 13.5];

/**
 * A duration as a small clock dial: one ring per hour begun, each swept as
 * far as the time reaches (25 mins: part of one ring; 1 hr: one full ring;
 * 4 hrs: four). The rings sweep in with the row's reveal (--rv). Without a
 * duration (Fax/Scan/Copy/Notary) only the clock face shows.
 */
function Dial({ minutes }: { minutes: number | null }) {
  const sweeps = minutes ? Array.from({ length: Math.ceil(minutes / 60) }, (_, h) => Math.min(1, (minutes - h * 60) / 60)) : [];
  return (
    <svg className="mn-dial" viewBox="0 0 64 64" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} className="mn-tick" d="M32 1.5v3" transform={`rotate(${i * 30} 32 32)`} />
      ))}
      {sweeps.map((f, i) => (
        <g key={i} transform="rotate(-90 32 32)">
          <circle className="mn-track" cx="32" cy="32" r={RINGS[i]} />
          <circle className="mn-sweep" cx="32" cy="32" r={RINGS[i]} pathLength={1} style={{ "--f": f, "--d": i } as CSSProperties} />
        </g>
      ))}
      {!minutes && <circle className="mn-track" cx="32" cy="32" r={RINGS[0]} />}
    </svg>
  );
}

/**
 * The service menu (night): the client's six services, plus Fax/Scan/Copy/
 * Notary, as a clinic appointment list. Each row: a duration dial in the
 * service's cap colour, the name, its length, the price note and its own call
 * button. BookMenu adds the filter tabs (a FLIP between them) and, on fine
 * pointers, a photo that peeks out beside the pointer over each row.
 */
export default function Book() {
  return (
    <section className="sheet night book" id={book.id} data-sheet={book.id} data-tone="night" aria-labelledby="book-title">
      <div className="wrap" data-parallax>
        <BookMenu head={<h2 className="h-xl mn-title" id="book-title" data-reveal="lines">{book.label}</h2>}>
          {book.items.map((item, i) => (
            <li className="mn-row" key={item.id} data-row data-tabs={item.tabs.join(" ")} data-cap={item.cap} data-peek={item.image ? i : undefined} data-reveal="settle">
              <span className="mn-rule" data-reveal="rule" aria-hidden="true" />
              <Dial minutes={item.minutes} />
              <div className="mn-name">
                <h3>{item.name}</h3>
                {item.duration && <span className="mono">{item.duration}</span>}
              </div>
              {item.image && (
                <span className="mn-thumb" aria-hidden="true">
                  <Image src={item.image.src} alt="" fill sizes="72px" />
                </span>
              )}
              <p className="mn-price">{item.price}</p>
              <a className="btn ghost mn-call" href={item.cta.href}>
                <Phone />
                {item.cta.label}
              </a>
            </li>
          ))}
        </BookMenu>
      </div>
    </section>
  );
}
