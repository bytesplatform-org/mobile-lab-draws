import { business, contact, footer, nav } from "@/lib/content/site";
import ArcBg from "./ArcBg";
import EyesWordmark from "./EyesWordmark";
import FooterFill from "./FooterFill";
import { UpRight } from "./Icons";

/**
 * The footer (FernGrid's): exactly one screen tall below its arc, so all of it
 * shows at the end of the page. A teal liquid fills it as you arrive
 * (FooterFill); over it the details, the page and account links, and
 * Blueprint's wordmark with eyes, set huge and cropped at the bottom.
 */
export default function SiteFooter() {
  return (
    <footer className="site-footer arc" id="footer" data-tone="night">
      <ArcBg tone="night" />
      <FooterFill />
      <div className="ftr-in wrap">
        <div className="ftr-cols">
          <div>
            <h2 className="ftr-h mono">{footer.visitTitle}</h2>
            <p className="ftr-strong">{business.legalName}</p>
            <p>{business.address}</p>
            <p>{contact.sub}</p>
            <a className="ftr-link" href={business.directions.href} target="_blank" rel="noopener">
              {business.directions.label}
              <UpRight />
            </a>
          </div>
          <div>
            <h2 className="ftr-h mono">{footer.callTitle}</h2>
            <p>
              <span>{contact.labels.phone}</span> <a href={business.phoneHref}>{business.phone}</a>
            </p>
            <p>
              <span>{contact.labels.fax}</span> <a href={business.faxHref}>{business.fax}</a>
            </p>
            <p>
              <a href={`mailto:${business.email}`}>{business.email}</a>
            </p>
          </div>
          <nav aria-label={footer.navTitle}>
            <h2 className="ftr-h mono">{footer.navTitle}</h2>
            <ul className="ftr-list">
              {nav.links.map(link => (
                <li key={link.href}>
                  <a href={link.href} {...(link.external ? { target: "_blank", rel: "noopener" } : {})}>{link.label}</a>
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
          </nav>
          <div>
            <h2 className="ftr-h mono">{footer.socialTitle}</h2>
            <ul className="ftr-list">
              {business.social.map(s => (
                <li key={s.href}>
                  <a className="ftr-link" href={s.href} target="_blank" rel="noopener">
                    {s.label}
                    <UpRight />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="ftr-legal mono">
          <p>{footer.copyright}</p>
          <a href={footer.back.href}>{footer.back.label}</a>
        </div>
      </div>
      <EyesWordmark lines={footer.wordmark} label={footer.label} />
    </footer>
  );
}
