"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import { motionAllowed } from "@/lib/animation/motion";
import { announcement } from "@/lib/content/site";

/** A small tube cap between items; its colour cycles through the cap code (CSS). */
const Dot = ({ i }: { i: number }) => <i className="ann-dot" style={{ "--d": i } as CSSProperties} />;

function Lines() {
  return (
    <div className="ann-set">
      {[...announcement.lines, ...announcement.lines].map((t, i) => (
        <span className="ann-item" key={i}>
          {t}
          <Dot i={i} />
        </span>
      ))}
    </div>
  );
}

function Terms() {
  return (
    <div className="ann-set">
      {[...announcement.terms, ...announcement.terms].map((t, i) => (
        <span className="ann-item ann-term" key={i}>
          {t}
          <Dot i={i + 3} />
        </span>
      ))}
    </div>
  );
}

/**
 * The live site's top bar, reborn as FernGrid's two-row marquee: slim, teal
 * on night, above the nav. Row 1 carries its three lines; row 2 runs the other
 * way in outlined service terms from the copy. Scroll velocity nudges the
 * speed (and turns both rows round when scrolling back up), then they ease
 * back to cruising pace. Static (the first set, in place) without motion.
 */
export default function Announcement() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;
    const ctx = gsap.context(() => {
      const a = gsap.to("[data-ann='1']", { xPercent: -50, duration: 46, ease: "none", repeat: -1 });
      const b = gsap.fromTo("[data-ann='2']", { xPercent: -50 }, { xPercent: 0, duration: 58, ease: "none", repeat: -1 });
      const tweens = [a, b];
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        onToggle: self => tweens.forEach(t => (self.isActive || self.progress === 0 ? t.play() : t.pause())),
        onLeaveBack: () => tweens.forEach(t => t.play()),
        onUpdate: self => {
          const boost = gsap.utils.clamp(-6, 6, self.getVelocity() / 260);
          const scale = (self.direction >= 0 ? 1 : -1) * (1 + Math.abs(boost));
          tweens.forEach(t =>
            gsap.to(t, {
              timeScale: scale,
              duration: 0.2,
              overwrite: true,
              onComplete: () => { gsap.to(t, { timeScale: Math.sign(scale) || 1, duration: 1.4, ease: "power2.out" }); },
            }),
          );
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="ann" ref={ref} aria-label={announcement.ariaLabel}>
      <ul className="sr-only">
        {announcement.lines.map(t => <li key={t}>{t}</li>)}
      </ul>
      <div className="ann-rows" aria-hidden="true">
        <div className="ann-track" data-ann="1">
          <Lines />
          <Lines />
        </div>
        <div className="ann-track ann-track-2" data-ann="2">
          <Terms />
          <Terms />
        </div>
      </div>
    </section>
  );
}
