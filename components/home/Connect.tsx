import type { CSSProperties } from "react";
import { business, connect } from "@/lib/content/site";
import { UpRight } from "@/components/site/Icons";
import SubscribeForm from "./SubscribeForm";

/**
 * Connect + sign-up, the close of the Contact section (rendered inside it, so
 * the two scroll and drift as one): the social links as large underlined
 * links with arrows, then the sign-up on a dark panel, wired to the
 * subscribe action.
 */
export default function Connect() {
  return (
    <div className="connect" role="region" aria-labelledby="connect-title">
      <div className="cn-social">
        <h2 className="h-lg" id="connect-title" data-reveal="lines">{connect.heading}</h2>
        <ul>
          {business.social.map((s, i) => (
            <li key={s.href} data-reveal="settle" style={{ "--i": i } as CSSProperties}>
              <a href={s.href} target="_blank" rel="noopener">
                {s.label}
                <UpRight />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="insider" data-reveal="settle">
        <h2 className="h-lg">{connect.signup.heading}</h2>
        <SubscribeForm />
      </div>
    </div>
  );
}
