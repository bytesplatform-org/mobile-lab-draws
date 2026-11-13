"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import { motionAllowed } from "@/lib/animation/motion";

/**
 * FernGrid's footer fill wash, re-imagined as a tube filling: a teal liquid
 * rises from the bottom of the footer as you reach the end of the page,
 * scrubbed both ways. Its surface is a travelling wave that climbs at the
 * edges like a meniscus, and it sloshes (tilts) with how fast you scroll.
 * Static and part-filled without motion.
 */
export default function FooterFill() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const footer = el?.closest("footer");
    if (!el || !footer || !motionAllowed()) return;
    const surface = el.querySelector<HTMLElement>("[data-surface]");
    const ctx = gsap.context(() => {
      const tilt = surface ? gsap.quickTo(surface, "rotation", { duration: 0.9, ease: "elastic.out(1, 0.4)" }) : null;
      gsap.fromTo(
        el,
        { yPercent: 100 },
        {
          yPercent: 34,
          ease: "none",
          scrollTrigger: {
            trigger: footer,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.6,
            onUpdate: self => tilt?.(gsap.utils.clamp(-2.4, 2.4, self.getVelocity() / -900)),
          },
        },
      );
    }, el);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <div className="ffill" ref={ref} aria-hidden="true">
      <div className="ffill-surface" data-surface>
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d="M0 30 C 100 14, 200 14, 300 30 S 500 46, 600 30 S 800 14, 900 30 S 1100 46, 1200 30 V60 H0 Z" />
        </svg>
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d="M0 30 C 100 14, 200 14, 300 30 S 500 46, 600 30 S 800 14, 900 30 S 1100 46, 1200 30 V60 H0 Z" />
        </svg>
      </div>
      <div className="ffill-body" />
    </div>
  );
}
