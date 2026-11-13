"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "@/lib/animation/gsap";
import { motionAllowed } from "@/lib/animation/motion";
import { createPlates } from "@/lib/gl/plates";
import { gallery, ui } from "@/lib/content/site";
import { Arrow } from "@/components/site/Icons";

/** Card height / width (mirrors .gal-card's aspect-ratio). */
const ASPECT = 5 / 4;

/**
 * The gallery's behaviour.
 * - A native horizontal scroller (touch, trackpad, keys, the buttons); with a
 *   mouse it can also be dragged, and it glides on after a fling.
 * - Its velocity skews the cards a little (FernGrid's marquee velocity), the
 *   GL canvas skewing with them so the plates stay on their cards.
 * - GL (lib/gl/plates): each card is an ink-teal duotone that develops to
 *   colour as it nears the centre, with a glass lens under the pointer.
 *   Reduced motion: every plate developed, one still frame, no skew.
 */
export default function GalleryStage({ count, srcs, children }: { count: number; srcs: string[]; children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [at, setAt] = useState(1);

  useEffect(() => {
    const frame = frameRef.current;
    const scroller = scrollerRef.current;
    const canvas = canvasRef.current;
    if (!frame || !scroller || !canvas) return;
    const motion = motionAllowed();
    const cards = [...scroller.querySelectorAll<HTMLElement>("[data-plate]")];
    const shows = cards.map(() => (motion ? 0 : 1));
    const offs: (() => void)[] = [];

    // which card is nearest the centre, for the counter
    const centred = () => {
      const fr = frame.getBoundingClientRect();
      const mid = fr.left + fr.width / 2;
      let best = 0;
      let dist = Infinity;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (d < dist) { dist = d; best = i; }
      });
      return best;
    };
    const onScroll = () => setAt(centred() + 1);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    offs.push(() => scroller.removeEventListener("scroll", onScroll));

    // ---- GL plates
    const plates = createPlates(canvas, {
      frame,
      plates: cards,
      srcs,
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
      glide = gsap.to(scroller, {
        scrollLeft: scroller.scrollLeft - vx * 320,
        duration: 0.9,
        ease: "power3.out",
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

  const step = (dir: number) => {
    const scroller = scrollerRef.current;
    const card = scroller?.querySelector<HTMLElement>("[data-plate]");
    if (!scroller || !card) return;
    const gap = parseFloat(getComputedStyle(scroller).columnGap) || 0;
    scroller.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: motionAllowed() ? "smooth" : "auto" });
  };

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
      <div className="wrap gal-ctrl">
        <p className="mono" aria-hidden="true">
          {String(at).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </p>
        <div className="gal-btns">
          <button type="button" className="gal-btn prev" onClick={() => step(-1)} aria-label={ui.previous}>
            <Arrow />
          </button>
          <button type="button" className="gal-btn" onClick={() => step(1)} aria-label={ui.next}>
            <Arrow />
          </button>
        </div>
      </div>
    </div>
  );
}
