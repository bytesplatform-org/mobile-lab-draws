import type { CSSProperties } from "react";
import { business, contact } from "@/lib/content/site";
import ArcBg from "@/components/site/ArcBg";
import CopyButton from "@/components/site/CopyButton";
import { SheetLabel } from "@/components/site/SheetHead";
import { Pin } from "@/components/site/Icons";
import AppointmentForm from "./AppointmentForm";

/**
 * Contact (paper; Blueprint's Contact layout in the client's own words): the
 * heading, the paragraph and the details with copy buttons on the left; the
 * appointment request on the right, and under it a dark map card.
 */
export default function Contact() {
  return (
    <section className="sheet paper arc contact-sec" id={contact.id} data-sheet={contact.id} data-tone="paper" aria-labelledby="contact-title">
      <ArcBg />
      <div className="wrap">
        <div className="contact">
          <div>
            <SheetLabel index={contact.index}>{contact.sub}</SheetLabel>
            <h2 className="h-xl" id="contact-title" data-reveal="lines">{contact.heading}</h2>
            <p className="ct-body" data-reveal="settle">{contact.body}</p>
            <div className="lines" data-reveal="settle" style={{ "--i": 1 } as CSSProperties}>
              <div className="cline">
                <span className="v strong">{business.legalName}</span>
              </div>
              <div className="cline">
                <span className="v">{business.address}</span>
                <CopyButton value={business.address} />
              </div>
              <div className="cline">
                <span className="v">
                  <span className="k">{contact.labels.phone}</span> <a href={business.phoneHref}>{business.phone}</a>
                </span>
                <CopyButton value={business.phone} />
              </div>
              <div className="cline">
                <span className="v">
                  <span className="k">{contact.labels.fax}</span> <a href={business.faxHref}>{business.fax}</a>
                </span>
                <CopyButton value={business.fax} />
              </div>
              <div className="cline">
                <a className="v" href={`mailto:${business.email}`}>{business.email}</a>
                <CopyButton value={business.email} />
              </div>
            </div>
            <ul className="ct-hours" data-reveal="settle" style={{ "--i": 2 } as CSSProperties}>
              {contact.hours.map(h => <li key={h}>{h}</li>)}
            </ul>
          </div>

          <div className="ct-side">
            <AppointmentForm />
            <div className="map-card" data-reveal="settle">
              {/* The map is a picture here (no pointer events), so it never swallows the page's scroll. */}
              <div className="map-frame">
                <iframe src={contact.map.src} title={contact.map.title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" tabIndex={-1} />
              </div>
              <div className="map-copy">
                <p>{business.address}</p>
                <a className="btn" href={business.directions.href} target="_blank" rel="noopener">
                  <Pin />
                  {business.directions.label}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
