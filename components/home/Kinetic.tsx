"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/animation/gsap";
import { bindMagnets } from "@/lib/animation/magnet";
import { motionAllowed } from "@/lib/animation/motion";

/**
 * A kinetic line (FernGrid's closing headline): the [data-kword] words of
 * [data-kline] tilt up out of a blur one by one, scrubbed to the scroll, then
 * the [data-accent] words sweep from paper to teal. Buttons inside are
 * magnetic. Static and legible without motion (the accent already teal).
 */
export default function Kinetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !motionAllowed()) return;
    const q = gsap.utils.selector(root);
    root.classList.add("is-kinetic");
    const ctx = gsap.context(() => {
      const words = q("[data-kword]");
      gsap.set(words, { yPercent: 70, rotateX: -70, opacity: 0, filter: "blur(14px)" });
      gsap.set(q("[data-accent]"), { backgroundPosition: "100% 0%" });
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: q("[data-kline]")[0], start: "top 88%", end: "top 30%", scrub: 0.6 },
        })
        .to(words, { yPercent: 0, rotateX: 0, opacity: 1, filter: "blur(0px)", duration: 0.5, stagger: 0.06, ease: "power2.out" })
        .to(q("[data-accent]"), { backgroundPosition: "0% 0%", duration: 0.35, stagger: 0.1 }, ">-0.15");
    }, root);
    const unbind = bindMagnets(root);
    return () => {
      unbind();
      ctx.revert();
      root.classList.remove("is-kinetic");
    };
  }, []);

  return (
    <div ref={ref} data-parallax>
      {children}
    </div>
  );
}
