"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, MQ } from "@/lib/animation/gsap";
import { motionAllowed } from "@/lib/animation/motion";

/** Scroll the stage stays pinned for, in viewport heights. */
const PIN_VH = 4.2;
/** The approach: the lead rises while the section scrolls from 80 % down the screen to the top. */
const APPROACH_VH = 0.8;
/** Dim words, before the reading head reaches them. */
const DIM = 0.14;

/**
 * SERVICE's choreography.
 *
 * Story (large screens with a fine pointer and motion), one pinned timeline:
 * 1. "All services available by appointment only." rises in huge through
 *    line masks, then rolls away and parks small at the top left.
 * 2. The concierge sentence reads in word by word; "celebrity" and "in their
 *    own home." light in teal as the head passes them.
 * 3. The rack: as you scrub, each tube fills in its cap colour (its surface
 *    wobbling), its cap clicks on, and its line in the list lights from dim
 *    to full ink.
 * 4. The insurance line arrives apart, as a note with a receipt rule drawing in.
 * 5. A hold on the finished rack, so the next sheet's arc rises over it.
 *
 * Flow (phones and tablets with motion): no pin; the concierge line reads in, and each
 * tube fills (and caps) as its row enters. Without motion: everything full.
 * Hovering a tube or its line lifts the tube and sloshes its liquid.
 */
export default function ServicesStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    const q = gsap.utils.selector(stage);
    const slots = q("[data-slot]") as HTMLElement[];
    const items = q("[data-item]") as HTMLElement[];
    const rackTubes = [...stage.querySelectorAll<SVGSVGElement>(".rack-tube")];
    const listTubes = [...stage.querySelectorAll<SVGSVGElement>(".sv-tube")];
    const words = q("[data-cw]") as HTMLElement[];
    const n = items.length;

    // ---- hover: a tube and its line lift together (every mode)
    const hover = (i: number, on: boolean) => {
      slots[i]?.classList.toggle("hover", on);
      items[i]?.classList.toggle("hover", on);
    };
    const offs: (() => void)[] = [];
    [...slots, ...items].forEach(el => {
      const i = Number(el.dataset.slot ?? el.dataset.item);
      const enter = () => hover(i, true);
      const leave = () => hover(i, false);
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      offs.push(() => {
        el.removeEventListener("pointerenter", enter);
        el.removeEventListener("pointerleave", leave);
      });
    });
    if (!motionAllowed()) return () => offs.forEach(fn => fn());

    const level = (tubes: SVGSVGElement[], i: number, lv: number) => {
      const t = tubes[i];
      if (!t) return;
      t.style.setProperty("--lv", lv.toFixed(3));
      t.classList.toggle("capped", lv > 0.97);
    };
    const read = (p: number) => {
      const head = p * (words.length + 4);
      words.forEach((w, i) => {
        const lit = Math.min(1, Math.max(0, (head - i) / 4));
        w.style.opacity = (DIM + (1 - DIM) * lit).toFixed(3);
        if (w.hasAttribute("data-hi")) w.classList.toggle("is-lit", lit > 0.55);
      });
    };
    const concierge = q("[data-sv-concierge]")[0] as HTMLElement | undefined;
    concierge?.classList.add("is-scrub");
    [...rackTubes, ...listTubes].forEach(t => {
      t.setAttribute("data-armed", "");
      t.style.setProperty("--lv", "0");
    });

    const mm = gsap.matchMedia();

    // ---- story
    mm.add(MQ.story, () => {
      stage.classList.add("is-story");
      const fill = (f: number) => {
        for (let i = 0; i < n; i++) {
          const lv = Math.min(1, Math.max(0, f - i));
          level(rackTubes, i, lv);
          items[i].classList.toggle("lit", lv > 0.3);
        }
      };
      fill(0);
      read(0);
      gsap.set(q("[data-sv-lw]"), { yPercent: 115 });
      gsap.set(q("[data-sv-kicker]"), { autoAlpha: 0, y: 14 });
      gsap.set(q("[data-sv-concierge]"), { autoAlpha: 0 });
      gsap.set(q("[data-sv-board]"), { autoAlpha: 0, y: 48 });
      gsap.set(q("[data-sv-note]"), { autoAlpha: 0, y: 24 });
      gsap.set(q("[data-receipt]"), { strokeDashoffset: 1 });

      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      const proxy = { f: 0, c: 0 };
      const pin = gsap.timeline({ defaults: { ease: "none" } });
      pin
        .to(q("[data-sv-lw]"), { yPercent: -130, autoAlpha: 0, duration: 0.08, stagger: 0.012, ease: "power3.in" }, 0.04)
        .to(q("[data-sv-kicker]"), { autoAlpha: 1, y: 0, duration: 0.06 }, 0.1)
        .to(q("[data-sv-concierge]"), { autoAlpha: 1, duration: 0.03 }, 0.12)
        .to(proxy, { c: 1, duration: 0.26, onUpdate: () => read(proxy.c) }, 0.14)
        .to(q("[data-sv-concierge]"), { autoAlpha: 0, yPercent: -16, filter: "blur(10px)", duration: 0.07 }, 0.46)
        .to(q("[data-sv-board]"), { autoAlpha: 1, y: 0, duration: 0.1, ease: "power3.out" }, 0.5)
        .to(proxy, { f: n, duration: 0.42, onUpdate: () => fill(proxy.f) }, 0.56)
        .to(q("[data-sv-note]"), { autoAlpha: 1, y: 0, duration: 0.06, ease: "power2.out" }, 0.9)
        .to(q("[data-receipt]"), { strokeDashoffset: 0, duration: 0.08 }, 0.93)
        .to({}, { duration: 0.24 });

      const approach = (pin.duration() * APPROACH_VH) / PIN_VH;
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top 80%",
            end: () => `+=${window.innerHeight * (APPROACH_VH + PIN_VH)}`,
            scrub: 0.7,
            invalidateOnRefresh: true,
          },
        })
        .to(q("[data-sv-lw]"), { yPercent: 0, duration: approach * 0.85, stagger: approach * 0.04, ease: "power3.out" }, 0)
        .add(pin, approach);

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => {
        stage.classList.remove("is-story");
        items.forEach(it => it.classList.remove("lit"));
      };
    });

    // ---- flow (phones and tablets)
    mm.add(MQ.flow, () => {
      const triggers: ScrollTrigger[] = [];
      triggers.push(
        ScrollTrigger.create({
          trigger: q("[data-sv-concierge]")[0],
          start: "top 82%",
          end: "bottom 52%",
          scrub: 0.5,
          onUpdate: self => read(self.progress),
          onRefresh: self => read(self.progress),
        }),
      );
      items.forEach((item, i) => {
        const st = { lv: 0 };
        triggers.push(
          ScrollTrigger.create({
            trigger: item,
            start: "top 88%",
            once: true,
            onEnter: () => {
              gsap.to(st, { lv: 1, duration: 1.3, delay: (i % 2) * 0.12, ease: "power2.inOut", onUpdate: () => level(listTubes, i, st.lv) });
              item.classList.add("lit");
            },
          }),
        );
      });
      gsap.set(q("[data-receipt]"), { strokeDashoffset: 1 });
      triggers.push(
        ScrollTrigger.create({
          trigger: q("[data-sv-note]")[0],
          start: "top 85%",
          once: true,
          onEnter: () => { gsap.to(q("[data-receipt]"), { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }); },
        }),
      );
      return () => {
        triggers.forEach(t => t.kill());
        items.forEach(it => it.classList.remove("lit"));
      };
    });

    return () => {
      mm.revert();
      offs.forEach(fn => fn());
      concierge?.classList.remove("is-scrub");
      words.forEach(w => {
        w.style.removeProperty("opacity");
        w.classList.remove("is-lit");
      });
      [...rackTubes, ...listTubes].forEach(t => {
        t.removeAttribute("data-armed");
        t.style.removeProperty("--lv");
        t.classList.remove("capped");
      });
    };
  }, []);

  return (
    <div className="sv-stage" ref={ref}>
      {/* Inner wrapper: the next sheet's parallax moves this, never the pinned stage. */}
      <div className="sv-inner" data-parallax>
        {children}
      </div>
    </div>
  );
}
