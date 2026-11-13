"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, MQ } from "@/lib/animation/gsap";
import { glideTo } from "@/lib/animation/scroll";
import { motionAllowed } from "@/lib/animation/motion";
import { CloudContext } from "./MorphCloud";
import type { PointCloudHandle } from "./PointCloud";

/** Night → a slightly warmer ink, blended continuously with the scroll (FernGrid's carbon → olive). */
const TONES = ["#06110f", "#09120f", "#0e1310", "#141310"];
/** Scroll the story stays pinned for, in viewport heights. */
const PIN_VH = 6.2;
/** The approach: the title rises while the section scrolls from 80 % down the screen to the top. */
const APPROACH_VH = 0.8;

/**
 * The drug-screen story (FernGrid's era-scene, one timeline owns everything):
 * 1. "DOT & NON DOT Drug Screen" rises in huge, then rolls away and parks
 *    small at the top left; the 24-hour line arrives with its clock.
 * 2. The tests step through: the active one stands large on the left above a
 *    rail of all nine (current one lit, click to jump); on the right one
 *    stippled cloud morphs between their shapes as you scroll, with callouts
 *    for each. The two "coming soon" tests carry a pulsing chip and are drawn
 *    at half density.
 * 3. The background drifts from night to a warmer ink; a hold at the end.
 * Story at desktop widths with motion only; otherwise the flow list.
 */
export default function DrugStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const cloud = useRef<PointCloudHandle | null>(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage || !motionAllowed()) return;
    const mm = gsap.matchMedia();
    mm.add(MQ.story, () => {
      stage.classList.add("is-story");
      const q = gsap.utils.selector(stage);
      const bigs = q("[data-ds-big]") as HTMLElement[];
      const callouts = q("[data-ds-co]") as HTMLElement[];
      const steps = q("[data-ds-step]") as HTMLButtonElement[];
      const n = bigs.length;
      const tone = gsap.utils.interpolate(TONES);

      gsap.set(q("[data-ds-tw]"), { yPercent: 120 });
      gsap.set(q("[data-ds-kicker], [data-ds-hours]"), { autoAlpha: 0, y: 12 });
      gsap.set(q("[data-ds-visual]"), { autoAlpha: 0, scale: 0.92 });
      gsap.set(q("[data-ds-rail], [data-ds-bigs]"), { autoAlpha: 0, y: 18 });

      const proxy = { f: 0 };
      let active = -1;
      const render = () => {
        const f = proxy.f;
        const a = Math.min(n - 1, Math.floor(f));
        const b = Math.min(n - 1, a + 1);
        cloud.current?.blend(a, b, f - a);
        callouts.forEach((c, i) => { c.style.opacity = String(Math.max(0, 1 - Math.abs(f - i) * 3)); });
        bigs.forEach((el, i) => {
          const d = i - f;
          const o = Math.max(0, 1 - Math.abs(d) * 1.7);
          el.style.opacity = o.toFixed(3);
          el.style.transform = `translateY(${(d * 56).toFixed(1)}px)`;
          el.style.filter = o < 0.99 ? `blur(${((1 - o) * 8).toFixed(1)}px)` : "";
          el.style.visibility = o > 0 ? "visible" : "hidden";
        });
        stage.style.backgroundColor = tone(f / Math.max(n - 1, 1));
        const now = Math.round(f);
        if (now !== active) {
          active = now;
          steps.forEach((s, i) => (i === now ? s.setAttribute("aria-current", "step") : s.removeAttribute("aria-current")));
        }
      };

      const pin = gsap.timeline({ defaults: { ease: "none" } });
      pin
        .to(q("[data-ds-tw]"), { yPercent: -130, autoAlpha: 0, duration: 0.09, stagger: 0.015, ease: "power3.in" }, 0.02)
        .to(q("[data-ds-kicker]"), { autoAlpha: 1, y: 0, duration: 0.06 }, 0.1)
        .to(q("[data-ds-hours]"), { autoAlpha: 1, y: 0, duration: 0.06 }, 0.12)
        .to(q("[data-ds-visual]"), { autoAlpha: 1, scale: 1, duration: 0.12, ease: "power3.out" }, 0.14)
        .to(q("[data-ds-bigs], [data-ds-rail]"), { autoAlpha: 1, y: 0, duration: 0.08, stagger: 0.03 }, 0.17)
        .addLabel("step0", 0.3);
      let t = 0.3;
      for (let i = 1; i < n; i++) {
        t += 0.1;
        pin.to(proxy, { f: i, duration: 0.16, ease: "power2.inOut", onUpdate: render }, t);
        t += 0.16;
        pin.addLabel(`step${i}`, t);
      }
      pin.to({}, { duration: 0.3 }, t);

      const approach = (pin.duration() * APPROACH_VH) / PIN_VH;
      const master = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top 80%",
          end: () => `+=${window.innerHeight * (APPROACH_VH + PIN_VH)}`,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });
      master.to(q("[data-ds-tw]"), { yPercent: 0, duration: approach * 0.85, stagger: approach * 0.05, ease: "power3.out" }, 0).add(pin, approach);
      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });
      render();

      // The rail's buttons glide to their test's resting point.
      const onStep = (e: MouseEvent) => {
        const i = Number((e.currentTarget as HTMLElement).dataset.dsStep);
        const st = master.scrollTrigger;
        if (!st) return;
        const time = approach + pin.labels[`step${i}`];
        glideTo(st.start + (time / master.duration()) * (st.end - st.start), 1.1);
      };
      steps.forEach(s => s.addEventListener("click", onStep));

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => {
        steps.forEach(s => {
          s.removeEventListener("click", onStep);
          s.removeAttribute("aria-current");
        });
        bigs.forEach(el => el.removeAttribute("style"));
        callouts.forEach(el => el.removeAttribute("style"));
        stage.style.backgroundColor = "";
        stage.classList.remove("is-story");
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <CloudContext.Provider value={cloud}>
      <div className="ds-stage" ref={ref}>
        {/* Inner wrapper: the next sheet's parallax moves this, never the pinned stage. */}
        <div className="ds-inner" data-parallax>
          {children}
        </div>
      </div>
    </CloudContext.Provider>
  );
}
