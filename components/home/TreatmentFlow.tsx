"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ScrollTrigger } from "@/lib/animation/gsap";
import { motionAllowed } from "@/lib/animation/motion";

/**
 * "Our services include:" as a thread (Blueprint's CapabilitiesFlow):
 * scrolling draws a teal line along the rule under each item in reading
 * order, and each lights as the line reaches it (its line icon draws itself
 * in, the cap dot pulses, the copy comes up from dim). Hovering redraws an
 * icon. Without motion: the plain grid.
 */
export default function TreatmentFlow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid || !motionAllowed()) return;
    const cells = [...grid.querySelectorAll<HTMLElement>(".cap")];
    const n = cells.length;
    grid.classList.add("is-flow");
    const apply = (p: number) => {
      cells.forEach((cell, k) => {
        const fill = Math.min(1, Math.max(0, p * n - k));
        cell.style.setProperty("--fill", fill.toFixed(4));
        cell.classList.toggle("lit", fill > 0.35);
      });
    };
    apply(0);
    const st = ScrollTrigger.create({
      trigger: grid,
      // Done while the whole grid is still on screen, before the next
      // sheet's arc rises over its last row.
      start: "top 90%",
      end: "bottom 72%",
      scrub: 0.5,
      onUpdate: self => apply(self.progress),
      onRefresh: self => apply(self.progress),
    });
    return () => {
      st.kill();
      grid.classList.remove("is-flow");
      cells.forEach(c => {
        c.classList.remove("lit");
        c.style.removeProperty("--fill");
      });
    };
  }, []);

  return (
    <ul className="caps" ref={ref}>
      {children}
    </ul>
  );
}
