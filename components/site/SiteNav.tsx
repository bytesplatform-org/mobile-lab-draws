"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/animation/gsap";
import { onIntro } from "@/lib/animation/intro";
import { lockScroll } from "@/lib/animation/scroll";
import { motionAllowed } from "@/lib/animation/motion";
import { brand, business, nav } from "@/lib/content/site";
import Mark from "./Mark";

const UpRight = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

/** Every link's attributes (the About page opens on the live site, in a new tab). */
const linkProps = (link: { href: string; external?: boolean }) =>
  link.external ? { href: link.href, target: "_blank", rel: "noopener" } : { href: link.href };

/**
 * The header: three floating glass pieces rather than one bar: the mark and
 * name on the left, the page links in a centred pill, the call button on the
 * right. The current section (whichever [data-sheet] crosses the middle of
 * the viewport) is shown by a teal pill that slides behind its link; on hover
 * it slides to the link under the pointer and back again on leave. Below 1060 px the links fold into FernGrid's
 * full-screen menu of big numbered rows, with the account links, phone and
 * email; it traps focus, closes on Escape and freezes the page behind it.
 */
export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Scroll-spy.
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("[data-sheet]")];
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.sheet ?? null);
      }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach(s => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Drops in as the loader lifts.
  useEffect(() => {
    const header = headerRef.current;
    if (!header || !motionAllowed()) return;
    return onIntro(tl => {
      tl.fromTo(header, { yPercent: -140 }, { yPercent: 0, duration: 1.1, ease: "expo.out", clearProps: "transform" }, 1.05);
    });
  }, []);

  // The menu: freeze the page, trap focus, Escape closes, focus returns to the toggle.
  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    if (!menu) return;
    const release = lockScroll({ allowWithin: menu });
    menu.querySelector<HTMLElement>("a,button")?.focus();
    const rows = menu.querySelectorAll<HTMLElement>("[data-menu-row]");
    if (motionAllowed()) {
      gsap.fromTo(rows, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.04, ease: "expo.out" });
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab") return;
      const focusables = [...menu.querySelectorAll<HTMLElement>("a[href],button")];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const toggle = toggleRef.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      release();
      toggle?.focus();
    };
  }, [open]);

  // Close the menu if the window grows past the breakpoint.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1061px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // A menu left open shouldn't greet the reader when this page is shown again.
  useLayoutEffect(() => () => setOpen(false), []);

  const close = () => setOpen(false);
  const isOn = (href: string) => !!active && href === `#${active}`;
  const activeIndex = nav.links.findIndex(l => isOn(l.href));
  const lit = hover ?? (activeIndex >= 0 ? activeIndex : null);

  // The sliding pill: sits behind the lit link (measured, so it follows the
  // links' real widths, and again whenever the pill resizes).
  useLayoutEffect(() => {
    const pill = pillRef.current;
    const ind = indRef.current;
    if (!pill || !ind) return;
    const place = () => {
      const link = lit === null ? null : pill.querySelectorAll<HTMLElement>("[data-link]")[lit];
      if (!link) {
        ind.style.opacity = "0";
        return;
      }
      const p = pill.getBoundingClientRect();
      const r = link.getBoundingClientRect();
      const first = ind.style.opacity !== "1";
      // the first placement jumps there; later ones glide
      if (first) ind.style.transition = "none";
      ind.style.setProperty("--x", `${r.left - p.left}px`);
      ind.style.setProperty("--w", `${r.width}px`);
      ind.style.opacity = "1";
      if (first) {
        void ind.offsetWidth;
        ind.style.transition = "";
      }
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(pill);
    return () => ro.disconnect();
  }, [lit]);

  return (
    <>
      <header className="nav" id="nav" ref={headerRef}>
        <div className="nav-row">
          <a className="brand nav-glass" href="#top" aria-label={brand.ariaHome}>
            <Mark className="brand-mark" />
            <span className="brand-name" aria-hidden="true">{brand.name}</span>
          </a>
          <div className="nav-pill nav-glass" ref={pillRef} onPointerLeave={() => setHover(null)}>
            <span className="nav-ind" ref={indRef} aria-hidden="true" />
            <ul className="nav-links">
              {nav.links.map((link, i) => (
                <li key={link.href}>
                  <a
                    {...linkProps(link)}
                    data-link
                    className={lit === i ? "lit" : undefined}
                    aria-current={isOn(link.href) ? "location" : undefined}
                    onPointerEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                  >
                    {link.label}
                    {link.external && <UpRight className="ext" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <a className="btn nav-cta" href={nav.cta.href}>{nav.cta.label}</a>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen(true)}
            ref={toggleRef}
          >
            <span className="menu-ic" aria-hidden="true" />
            {nav.menu.open}
          </button>
        </div>
      </header>

      <div className="menu" id={menuId} role="dialog" aria-modal="true" aria-label={nav.menu.open} hidden={!open} ref={menuRef} data-lenis-prevent>
        <div className="menu-top">
          <a className="brand" href="#top" onClick={close} aria-label={brand.ariaHome}>
            <Mark className="brand-mark" />
            <span className="brand-name" aria-hidden="true">
              {brand.name}
              <small>{brand.sub}</small>
            </span>
          </a>
          <button type="button" className="menu-btn is-close" onClick={close}>
            <span className="menu-ic" aria-hidden="true" />
            {nav.menu.close}
          </button>
        </div>
        <ul className="big-menu">
          {nav.links.map((link, i) => (
            <li key={link.href} data-menu-row>
              <a {...linkProps(link)} onClick={close} aria-current={isOn(link.href) ? "location" : undefined}>
                <span className="bm-i mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="bm-label">{link.label}</span>
                <UpRight className="bm-arrow" />
              </a>
            </li>
          ))}
        </ul>
        <div className="menu-foot" data-menu-row>
          <div>
            <p className="mono menu-h">{nav.accountLabel}</p>
            <ul className="menu-account">
              {nav.account.map(link => (
                <li key={link.label}>
                  <a href={link.href} target="_blank" rel="noopener">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="menu-contact mono">
            <a href={business.phoneHref}>{business.phone}</a>
            <a href={`mailto:${business.email}`}>{business.email}</a>
          </div>
          <a className="btn" href={nav.cta.href}>{nav.cta.label}</a>
        </div>
      </div>
    </>
  );
}
