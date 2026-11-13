"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, MQ } from "@/lib/animation/gsap";
import { bindMagnets } from "@/lib/animation/magnet";
import { motionAllowed } from "@/lib/animation/motion";

/** Fraunces' weight range for the swell. */
const BASE = 300;
const PEAK = 800;

/**
 * The call band's motion (FernGrid's closing CTA):
 * - "Call for an appointment" assembles word by word as you scroll (3D tilt
 *   up out of a blur, scrubbed both ways), then the number's digits rise in.
 * - Once assembled, a teal liquid sweeps across the digits: a fill layer
 *   clipped by a wavy, travelling edge, scrubbed to the scroll.
 * - Fine pointers: letters swell in weight toward the pointer (Fraunces is
 *   variable), and the call button is magnetic.
 * Static and fully legible without motion.
 */
export default function CallBandStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !motionAllowed()) return;
    const q = gsap.utils.selector(root);
    const headline = q("[data-headline]")[0] as HTMLElement;
    const fillEl = q("[data-num-fill]")[0] as HTMLElement;
    const words = q("[data-cword]");
    const digits = q("[data-num] [data-ch]");
    const fill = { p: 0 };
    let visible = false;

    // The liquid edge: a sine wave travelling down the fill's leading edge.
    const drawFill = (time: number) => {
      const x = fill.p * 106 - 3;
      if (x <= -3) {
        fillEl.style.clipPath = "inset(0 100% 0 0)";
        return;
      }
      // Complete: no clip at all, so the last digit's overhang fills too.
      if (fill.p >= 0.995) {
        fillEl.style.clipPath = "none";
        return;
      }
      const amp = fill.p >= 1 ? 0 : 2.2;
      const pts: string[] = ["0% 0%"];
      for (let i = 0; i <= 14; i++) {
        const y = (i / 14) * 100;
        const wx = x + Math.sin(i * 0.9 + time * 3.2) * amp + Math.sin(i * 0.37 - time * 1.7) * amp * 0.6;
        pts.push(`${wx.toFixed(2)}% ${y.toFixed(1)}%`);
      }
      pts.push("0% 100%");
      fillEl.style.clipPath = `polygon(${pts.join(",")})`;
    };
    const tick = (time: number) => { if (visible) drawFill(time); };

    const ctx = gsap.context(() => {
      gsap.set(words, { yPercent: 70, rotateX: -75, opacity: 0, filter: "blur(14px)" });
      gsap.set(digits, { yPercent: 60, opacity: 0, filter: "blur(10px)" });
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: headline, start: "top 92%", end: "top 58%", scrub: 0.6 },
        })
        .to(words, { yPercent: 0, rotateX: 0, opacity: 1, filter: "blur(0px)", duration: 0.5, stagger: 0.07, ease: "power2.out" })
        .to(digits, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.35, stagger: 0.025, ease: "power2.out" }, 0.3);
      gsap.to(fill, {
        p: 1,
        ease: "none",
        // fills as the digits finish assembling; full by the time the
        // headline's top reaches 45 % of the screen
        scrollTrigger: { trigger: headline, start: "top 68%", end: "top 45%", scrub: 0.6 },
      });
      gsap.from(q("[data-cb-rise]"), {
        y: 36,
        autoAlpha: 0,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: q("[data-cb-rise]")[0], start: "top 92%", once: true },
      });
      ScrollTrigger.create({ trigger: root, start: "top bottom", end: "bottom top", onToggle: self => { visible = self.isActive; } });
    }, root);
    drawFill(0);
    gsap.ticker.add(tick);

    // Fine pointers: the swell and the magnet.
    const offs: (() => void)[] = [];
    const mm = gsap.matchMedia();
    mm.add(MQ.fine, () => {
      const pairs = new Map<HTMLElement, HTMLElement | null>();
      const fills = q("[data-fch]");
      digits.forEach((d, i) => pairs.set(d, fills[i] ?? null));
      const chars = q("[data-ch]").map(el => {
        const twin = pairs.get(el) ?? null;
        return {
          el,
          cx: 0,
          cy: 0,
          w: gsap.quickTo(el, "fontWeight", { duration: 0.55, ease: "power3.out" }),
          tw: twin ? gsap.quickTo(twin, "fontWeight", { duration: 0.55, ease: "power3.out" }) : null,
        };
      });
      const measure = () => {
        const h = headline.getBoundingClientRect();
        for (const c of chars) {
          const r = c.el.getBoundingClientRect();
          c.cx = r.left + r.width / 2 - h.left;
          c.cy = r.top + r.height / 2 - h.top;
        }
      };
      const swell = (e: PointerEvent) => {
        const h = headline.getBoundingClientRect();
        const x = e.clientX - h.left;
        const y = e.clientY - h.top;
        const radius = Math.max(140, h.width * 0.16);
        for (const c of chars) {
          const d = Math.hypot(c.cx - x, (c.cy - y) * 1.3);
          const k = Math.max(0, 1 - d / radius);
          const wgt = BASE + (PEAK - BASE) * k * k;
          c.w(wgt);
          c.tw?.(wgt);
        }
      };
      const calm = () => chars.forEach(c => (c.w(BASE), c.tw?.(BASE)));
      headline.addEventListener("pointerenter", measure);
      headline.addEventListener("pointermove", swell);
      headline.addEventListener("pointerleave", calm);
      return () => {
        headline.removeEventListener("pointerenter", measure);
        headline.removeEventListener("pointermove", swell);
        headline.removeEventListener("pointerleave", calm);
      };
    });
    offs.push(bindMagnets(root));

    return () => {
      gsap.ticker.remove(tick);
      mm.revert();
      ctx.revert();
      offs.forEach(fn => fn());
      fillEl.style.clipPath = "";
    };
  }, []);

  return (
    <div className="cb-stage" ref={ref} data-parallax>
      {children}
    </div>
  );
}
