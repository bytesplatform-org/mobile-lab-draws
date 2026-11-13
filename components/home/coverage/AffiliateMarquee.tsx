"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import { motionAllowed } from "@/lib/animation/motion";
import { coverage } from "@/lib/content/site";

/** Drift speed in px per second, and how hard a scroll flick pushes it. */
const DRIFT = 46;
const KICK = 0.22;
const KICK_MAX = 900;

/**
 * Logos sit in optically even boxes: a wide wordmark gets a wider, shorter box
 * than a square seal, so every mark reads at a similar weight.
 */
function boxVars(w: number, h: number): CSSProperties {
  const r = w / h;
  return { "--lw": (r ** 0.6).toFixed(3), "--lh": (r ** -0.4).toFixed(3) } as CSSProperties;
}

function Chips({ hidden }: { hidden?: boolean }) {
  return (
    <ul className={hidden ? "aff-set aff-dupe" : "aff-set"} aria-hidden={hidden || undefined}>
      {coverage.affiliates.map(a => (
        <li className="aff-chip" key={a.logo.src}>
          <span className="aff-logo" style={boxVars(a.logo.w, a.logo.h)}>
            <Image src={a.logo.src} alt={hidden ? "" : a.alt} width={a.logo.w} height={a.logo.h} sizes="240px" />
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The affiliates as a sliding band of their logos, full bleed.
 * - With motion: the band never stops while any of it is on screen; scrolling
 *   kicks it faster and turns it with the scroll's direction. It only idles
 *   once it is fully offscreen (an IntersectionObserver, which sees the band
 *   where the sheet's parallax actually draws it).
 * - Reduced motion / no JS: the same logos as a still, wrapped row.
 */
export default function AffiliateMarquee() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const rail = root?.querySelector<HTMLElement>("[data-rail]");
    const first = rail?.querySelector<HTMLElement>(".aff-set");
    if (!root || !rail || !first || !motionAllowed()) return;

    let span = 0;
    const measure = () => {
      span = first.offsetWidth + parseFloat(getComputedStyle(rail).columnGap || "0");
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(first);

    const setX = gsap.quickSetter(rail, "x", "px");
    let x = 0;
    let dir = 1;
    let kick = 0;
    let visible = true;

    const tick = (_t: number, dtMs: number) => {
      if (!visible || !span) return;
      const dt = Math.min(dtMs, 64) / 1000;
      kick *= Math.pow(0.04, dt);
      x = gsap.utils.wrap(-span, 0, x - (DRIFT + kick) * dir * dt);
      setX(x);
    };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "120px 0px" });
    io.observe(root);

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onUpdate: self => {
        const v = self.getVelocity();
        if (Math.abs(v) < 20) return;
        dir = v > 0 ? 1 : -1;
        kick = Math.min(KICK_MAX, Math.max(kick, Math.abs(v) * KICK));
      },
    });
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      io.disconnect();
      ro.disconnect();
      gsap.set(rail, { clearProps: "transform" });
    };
  }, []);

  return (
    <div className="aff" ref={ref} data-reveal="settle">
      <div className="aff-view">
        <div className="aff-rail" data-rail>
          <Chips />
          <Chips hidden />
        </div>
      </div>
    </div>
  );
}
