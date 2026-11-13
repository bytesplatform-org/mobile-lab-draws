"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/animation/gsap";
import { motionAllowed } from "@/lib/animation/motion";

/**
 * Below the statement ring: a teal line drops from the mark like a needle,
 * and at its tip a small drop of venous red forms, falls and lands with a
 * ripple. Scrubbed to the scroll, so it plays back the other way too.
 * Without motion: the line, the drop resting on its rings.
 */
export default function NeedleDrop() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg || !motionAllowed()) return;
    const q = gsap.utils.selector(svg);
    const ctx = gsap.context(() => {
      gsap.set(q("[data-needle]"), { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(q("[data-drop]"), { scale: 0, y: 0, transformOrigin: "50% 0%" });
      gsap.set(q("[data-ripple]"), { scale: 0.1, autoAlpha: 0, transformOrigin: "50% 50%" });
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: svg, start: "top 82%", end: "bottom 50%", scrub: 0.6 },
        })
        .to(q("[data-needle]"), { scaleY: 1, duration: 0.45, ease: "power2.inOut" })
        .to(q("[data-drop]"), { scale: 1, duration: 0.14, ease: "back.out(2)" }, 0.4)
        .to(q("[data-drop]"), { y: 64, duration: 0.18, ease: "power2.in" }, 0.56)
        .to(q("[data-drop]"), { scaleY: 0.55, scaleX: 1.4, autoAlpha: 0, duration: 0.06 }, 0.74)
        .to(q("[data-ripple]"), { scale: 1, autoAlpha: 1, duration: 0.1, stagger: 0.05, ease: "power2.out" }, 0.74)
        .to(q("[data-ripple]"), { scale: 1.6, autoAlpha: 0, duration: 0.16, stagger: 0.05, ease: "power1.out" }, 0.86);
    }, svg);
    return () => ctx.revert();
  }, []);

  return (
    <svg className="needle" ref={ref} viewBox="0 0 120 220" aria-hidden="true">
      <path className="needle-line" data-needle d="M60 0V120" />
      <path className="needle-tip" data-needle d="M57 120L60 128L63 120" />
      <g data-drop>
        <path className="needle-drop" d="M60 128c-4.6 7-7.4 11.4-7.4 15a7.4 7.4 0 0 0 14.8 0c0-3.6-2.8-8-7.4-15Z" />
      </g>
      <ellipse className="ripple" data-ripple cx="60" cy="204" rx="40" ry="7" />
      <ellipse className="ripple" data-ripple cx="60" cy="204" rx="24" ry="4.4" />
      <ellipse className="ripple-dot" data-ripple cx="60" cy="204" rx="8" ry="1.8" />
    </svg>
  );
}
