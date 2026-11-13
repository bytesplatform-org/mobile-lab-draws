import type { CSSProperties } from "react";
import { brand, business, callCta, contact, footer, nav } from "@/lib/content/site";
import ArcBg from "./ArcBg";
import Mark from "./Mark";
import { UpRight } from "./Icons";

/**
 * The footer (night, on its arc): a quiet close.
 * - Top: the mark and name on the left; the phone number, large, on the
 *   right, with the email and fax under it.
 * - Then the details in three even columns under a hairline: visit; the
 *   pages (two short columns); connect, with the account links under it.
 * - The legal line.
 */
export default function SiteFooter() {
  return (
    <footer className="site-footer arc" id="footer" data-tone="night">
      <ArcBg tone="night" />
      <div className="wrap ftr">
        <div className="ftr-top">
          <a className="ftr-brand" href="#top" aria-label={brand.ariaHome} data-reveal="settle">
            <Mark className="ftr-logo" />
            <span>
              <span className="ftr-name">{brand.name}</span>
              <span className="ftr-sub mono">{brand.sub}</span>
            </span>
          </a>
          <div className="ftr-call" data-reveal="settle" style={{ "--i": 1 } as CSSProperties}>
            <h2 className="ftr-h mono">{footer.callTitle}</h2>
            <a className="ftr-phone" href={business.phoneHref} aria-label={`${callCta.label}: ${business.phone}`}>
              {business.phone}
            </a>
            <p className="ftr-reach">
              <a href={`mailto:${business.email}`}>{business.email}</a>
              <span>
                {contact.labels.fax} <a href={business.faxHref}>{business.fax}</a>
              </span>
            </p>
          </div>
        </div>

        <div className="ftr-cols">
          <div data-reveal="settle">
            <h2 className="ftr-h mono">{footer.visitTitle}</h2>
            <p className="ftr-strong">{business.legalName}</p>
            <p>{business.address}</p>
            <p>{contact.sub}</p>
            <a className="ftr-out" href={business.directions.href} target="_blank" rel="noopener">
              {business.directions.label}
              <UpRight />
            </a>
          </div>
          <nav aria-label={footer.navTitle} data-reveal="settle" style={{ "--i": 1 } as CSSProperties}>
            <h2 className="ftr-h mono">{footer.navTitle}</h2>
            <ul className="ftr-list ftr-pages">
              {nav.links.map(link => (
                <li key={link.href}>
                  <a href={link.href} {...(link.external ? { target: "_blank", rel: "noopener" } : {})}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div data-reveal="settle" style={{ "--i": 2 } as CSSProperties}>
            <h2 className="ftr-h mono">{footer.socialTitle}</h2>
            <ul className="ftr-list">
              {business.social.map(s => (
                <li key={s.href}>
                  <a className="ftr-out" href={s.href} target="_blank" rel="noopener">
                    {s.label}
                    <UpRight />
                  </a>
                </li>
              ))}
            </ul>
            <ul className="ftr-list ftr-account">
              {nav.account.map(link => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ftr-legal mono">
          <p>{footer.copyright}</p>
          <a href={footer.back.href} className="ftr-top-link">
            {footer.back.label}
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
