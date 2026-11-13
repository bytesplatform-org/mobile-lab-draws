"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/animation/gsap";
import { motionAllowed } from "@/lib/animation/motion";
import { createPlates } from "@/lib/gl/plates";
import { gallery } from "@/lib/content/site";

/** Card height / width (mirrors .gal-card's aspect-ratio). */
const ASPECT = 5 / 4;

/**
 * The gallery's behaviour.
 * - A native horizontal scroller (touch, trackpad, keys); with a mouse it can
 *   also be dragged, and it glides on after a fling.
 * - Endless: the cards come three times over (Gallery); the scroll starts on
 *   the middle set and, whenever it drifts half a set from the middle, jumps
 *   back by one whole set, which lands on an identical frame. Drag, glide and
 *   the skew all carry the jump. Without JS the copies are hidden.
 * - Its velocity skews the cards a little (FernGrid's marquee velocity), the
 *   GL canvas skewing with them so the plates stay on their cards.
 * - GL (lib/gl/plates): each card is an ink-teal duotone that develops to
 *   colour as it nears the centre, with a glass lens under the pointer.
 *   Reduced motion: every plate developed, one still frame, no skew.
 */
export default function GalleryStage({ srcs, children }: { srcs: string[]; children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const scroller = scrollerRef.current;
    const canvas = canvasRef.current;
    if (!frame || !scroller || !canvas) return;
    const motion = motionAllowed();
    const cards = [...scroller.querySelectorAll<HTMLElement>("[data-plate]")];
    const shows = cards.map(() => (motion ? 0 : 1));
    const offs: (() => void)[] = [];

    // ---- the endless loop
    const n = srcs.length;
    let span = 0;
    let onWrap: (d: number) => void = () => {};
    const measure = () => {
      span = cards.length >= 2 * n ? cards[n].offsetLeft - cards[0].offsetLeft : 0;
    };
    const wrap = () => {
      if (!span) return;
      const x = scroller.scrollLeft;
      const d = x < span * 0.5 ? span : x > span * 1.5 ? -span : 0;
      if (!d) return;
      scroller.scrollLeft = x + d;
      onWrap(d);
    };
    measure();
    scroller.scrollLeft += span;
    scroller.addEventListener("scroll", wrap, { passive: true });
    const ro = new ResizeObserver(() => {
      const old = span;
      measure();
      if (old && span) scroller.scrollLeft += span - old;
      wrap();
    });
    ro.observe(scroller);
    offs.push(() => {
      scroller.removeEventListener("scroll", wrap);
      ro.disconnect();
    });

    // ---- GL plates
    const plates = createPlates(canvas, {
      frame,
      plates: cards,
      srcs,
      srcOf: i => Number(cards[i].dataset.src ?? i) % n,
      aspect: ASPECT,
      animate: motion,
      radius: 18,
      show(i, dt) {
        if (!motion) return 1;
        const fr = frame.getBoundingClientRect();
        const r = cards[i].getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - (fr.left + fr.width / 2)) / Math.max(fr.width / 2, 1);
        const target = 1 - Math.min(1, Math.max(0, (d - 0.12) / 0.55));
        shows[i] += (target - shows[i]) * (1 - Math.pow(0.03, dt));
        return shows[i];
      },
      onReady: () => frame.setAttribute("data-gl", ""),
      onLost: () => frame.removeAttribute("data-gl"),
      onRestored: () => frame.setAttribute("data-gl", ""),
    });
    if (plates) {
      offs.push(() => {
        frame.removeAttribute("data-gl");
        plates.dispose();
      });
      const move = (e: PointerEvent) => {
        const r = frame.getBoundingClientRect();
        plates.stage.setPointerUV((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
      };
      const leave = () => plates.stage.setPointerUV(-1, -1);
      frame.addEventListener("pointermove", move);
      frame.addEventListener("pointerleave", leave);
      leave();
      offs.push(() => {
        frame.removeEventListener("pointermove", move);
        frame.removeEventListener("pointerleave", leave);
      });
    }

    if (!motion) return () => offs.forEach(fn => fn());

    // ---- velocity skew
    let last = scroller.scrollLeft;
    let skew = 0;
    const tick = (_t: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 0.1);
      const v = (scroller.scrollLeft - last) / Math.max(dt, 0.001);
      last = scroller.scrollLeft;
      const target = gsap.utils.clamp(-7, 7, -v / 260);
      skew += (target - skew) * (1 - Math.pow(0.002, dt));
      if (Math.abs(skew) < 0.01 && target === 0) skew = 0;
      frame.style.setProperty("--skew", `${skew.toFixed(3)}deg`);
    };
    gsap.ticker.add(tick);
    offs.push(() => gsap.ticker.remove(tick));

    // ---- mouse drag with a glide
    let drag: { x: number; left: number; t: number; vx: number; moved: boolean } | null = null;
    let glide: gsap.core.Tween | null = null;
    // a glide tweens a proxy; the loop's jumps are added on as an offset
    const glidePos = { v: 0 };
    let glideShift = 0;
    onWrap = d => {
      last += d;
      if (drag) drag.left += d;
      glideShift += d;
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      glide?.kill();
      drag = { x: e.clientX, left: scroller.scrollLeft, t: performance.now(), vx: 0, moved: false };
      scroller.classList.add("is-drag");
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) drag.moved = true;
      const now = performance.now();
      const left = drag.left - dx;
      drag.vx = (scroller.scrollLeft - left) / Math.max(now - drag.t, 1);
      drag.t = now;
      scroller.scrollLeft = left;
    };
    const up = () => {
      if (!drag) return;
      const { vx, moved } = drag;
      drag = null;
      if (moved) {
        const swallow = (ev: MouseEvent) => { ev.preventDefault(); ev.stopPropagation(); };
        scroller.addEventListener("click", swallow, { capture: true, once: true });
        window.setTimeout(() => scroller.removeEventListener("click", swallow, { capture: true }), 50);
      }
      glidePos.v = scroller.scrollLeft;
      glideShift = 0;
      glide = gsap.to(glidePos, {
        v: glidePos.v - vx * 320,
        duration: 0.9,
        ease: "power3.out",
        onUpdate: () => { scroller.scrollLeft = glidePos.v + glideShift; },
        onComplete: () => scroller.classList.remove("is-drag"),
      });
    };
    scroller.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    offs.push(() => {
      glide?.kill();
      scroller.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    });

    return () => offs.forEach(fn => fn());
  }, [srcs]);

  return (
    <div className="gal">
      <div className="gal-frame" ref={frameRef}>
        <ul className="gal-scroller" ref={scrollerRef} tabIndex={0} aria-label={gallery.heading}>
          {children}
        </ul>
        <div className="gal-gl" aria-hidden="true">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}
