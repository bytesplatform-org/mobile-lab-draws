"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, MQ } from "@/lib/animation/gsap";
import { motionAllowed } from "@/lib/animation/motion";

/**
 * The specimen label's motion, scrubbed to the scroll (both ways):
 * - the label rises and straightens from a tilt, settling slightly askew,
 *   like one just stuck onto the page;
 * - the cap stripe fills in, cap by cap;
 * - the header lines arrive and the barcode prints in, left to right;
 * - the four fields arrive in turn;
 * - last, the stamp thumps down (the label gives a little).
 * Fine pointers also tilt the label toward the pointer, in 3D.
 * Without motion: the finished label, stamped.
 */
export default function StatementLabel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !motionAllowed()) return;
    const q = gsap.utils.selector(root);
    const slab = q("[data-slab]")[0] as HTMLElement;
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root, start: "top 92%", end: "bottom 62%", scrub: 0.7 },
        })
        .fromTo(slab, { y: 140, rotate: -7, opacity: 0.35 }, { y: 0, rotate: -1.2, opacity: 1, duration: 0.42, ease: "power2.out" }, 0)
        .fromTo(q("[data-slab-cap]"), { scaleY: 0 }, { scaleY: 1, duration: 0.18, stagger: 0.03, ease: "power2.out" }, 0.12)
        .fromTo(q("[data-slab-in]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.16, stagger: 0.05, ease: "power2.out" }, 0.2)
        .fromTo(q(".slab-bars"), { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.24, stagger: 0.1, ease: "power1.inOut" }, 0.26)
        .fromTo(q("[data-slab-field]"), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.14, stagger: 0.06, ease: "power2.out" }, 0.42)
        .fromTo(
          q("[data-slab-stamp]"),
          { autoAlpha: 0, scale: 2.3, rotate: -24 },
          { autoAlpha: 1, scale: 1, rotate: -11, duration: 0.08, ease: "power4.in" },
          0.74,
        )
        .to(slab, { scale: 0.985, duration: 0.025, ease: "power2.out" }, 0.82)
        .to(slab, { scale: 1, duration: 0.06, ease: "power2.out" }, 0.845)
        .to({}, { duration: 0.1 });
    }, root);

    // Fine pointers: the label leans toward the pointer.
    const mm = gsap.matchMedia();
    mm.add(MQ.fine, () => {
      const tilt = q("[data-slab-tilt]")[0] as HTMLElement;
      const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.9, ease: "power3.out" });
      const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.9, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const r = tilt.getBoundingClientRect();
        rx(((e.clientY - (r.top + r.height / 2)) / r.height) * -7);
        ry(((e.clientX - (r.left + r.width / 2)) / r.width) * 9);
      };
      const leave = () => (rx(0), ry(0));
      root.addEventListener("pointermove", move);
      root.addEventListener("pointerleave", leave);
      return () => {
        root.removeEventListener("pointermove", move);
        root.removeEventListener("pointerleave", leave);
      };
    });
    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <div className="slab-stage" ref={ref}>
      <div className="slab-tilt" data-slab-tilt>
        {children}
      </div>
    </div>
  );
}
