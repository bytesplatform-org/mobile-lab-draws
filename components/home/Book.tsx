import Image from "next/image";
import type { CSSProperties } from "react";
import { book } from "@/lib/content/site";
import { SheetLabel } from "@/components/site/SheetHead";
import { Phone } from "@/components/site/Icons";
import BookRow from "./BookRow";
import BookStory from "./BookStory";

const pct = (minutes: number) => `${((minutes / book.axisMax) * 100).toFixed(3)}%`;

/**
 * The service menu (Blueprint's "Curricula built to a schedule", reborn as
 * appointment lengths drawn to scale): a 0 → 4 hr axis, each service a row
 * whose bar is its duration in its cap colour. BookStory owns the playhead,
 * the readout and the filter tabs; each row opens to its photo, price note
 * and call button.
 */
export default function Book() {
  return (
    <section className="sheet night book" id={book.id} data-sheet={book.id} data-tone="night" aria-labelledby="book-title">
      <BookStory
        head={
          <div className="bk-head">
            <SheetLabel index={book.index}>{book.kicker}</SheetLabel>
            <h2 className="h-lg" id="book-title" data-reveal="lines">{book.label}</h2>
          </div>
        }
      >
        <div className="schedule" data-schedule>
          <div className="bk-scale" aria-hidden="true">
            <div className="lab mono">{book.label}</div>
            <div className="bk-axis" data-axis>
              {book.ticks.map(t => (
                <span key={t.at} style={{ left: pct(t.at) }}>{t.label}</span>
              ))}
            </div>
          </div>
          {book.items.map(item => (
            <BookRow
              key={item.id}
              id={`bk-${item.id}`}
              tabs={item.tabs}
              minutes={item.minutes}
              cap={item.cap}
              head={
                <>
                  <div className="bk-name">
                    <span className="plus" aria-hidden="true">+</span>
                    <div>
                      <h3>{item.name}</h3>
                      {item.duration && <span className="mono">{item.duration}</span>}
                    </div>
                  </div>
                  <div className="bk-track">
                    {item.minutes ? (
                      <div className="bk-bar" data-bar style={{ width: pct(item.minutes) } as CSSProperties}>
                        <i />
                      </div>
                    ) : (
                      <span className="bk-none mono" aria-hidden="true">—</span>
                    )}
                  </div>
                </>
              }
            >
              <div className="bk-detail-in">
                {item.image && (
                  <figure className="bk-photo">
                    <Image src={item.image.src} alt={item.image.alt} fill sizes="(max-width: 760px) 90vw, 360px" />
                  </figure>
                )}
                <div className="bk-detail-copy">
                  {item.price && <p className="bk-price">{item.price}</p>}
                  <a className="btn" href={item.cta.href}>
                    <Phone />
                    {item.cta.label}
                  </a>
                </div>
              </div>
            </BookRow>
          ))}
        </div>
      </BookStory>
    </section>
  );
}
