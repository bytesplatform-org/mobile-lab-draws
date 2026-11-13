"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import { onIntro } from "@/lib/animation/intro";
import { bindMagnets } from "@/lib/animation/magnet";
import { motionAllowed } from "@/lib/animation/motion";
import { isTouchFirst } from "@/lib/animation/prefs";
import { bootTask, onBootDone } from "@/lib/boot";
import { createHeroType } from "@/lib/gl/heroType";

/** Scroll the hero stays pinned for the lockup → headline swap. */
const PIN = "+=220%";
/** Max pointer drift (px): the photo and routes against the pointer, the type with it. */
const DRIFT = 30;
const GRID_DRIFT = 14;
const TEXT_DRIFT = 12;
const ANNO_DRIFT = 12;
/** Over-scale so the photo's drift never shows an edge. */
const SCALE = 1.08;

/**
 * The hero sheet: everything that moves.
 *
 * - Entrance (on the loader's exit timeline): the photo settles from a zoom,
 *   the lockup rises out of a blur, the tagline rule opens, the routes and
 *   buttons follow and the callouts draw themselves in.
 * - Pinned, scroll-scrubbed swap: the lockup blurs away; the H1's three lines
 *   rise in one after another (in GL, a liquid front through the glyphs; in
 *   DOM, the same as a rising clip); then the lede blurs in word by word. A
 *   short hold, then the statement sheet's arc rises over it.
 * - Pointer: the photo drifts against it, the routes less, the type with it
 *   and the callouts most (FernGrid's layers); the H1 lines lean (Blueprint).
 * - GL: the H1 is drawn through a fluid the pointer stirs (lib/gl/heroType);
 *   on touch a slow Lissajous probe stirs it instead. Once the glyph atlas is
 *   up the section gets data-gl-type and the DOM words turn transparent;
 *   without WebGL or float targets they keep their fill and outline.
 */
export default function HeroStage({ media, grid, children }: { media: ReactNode; grid: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const hero = ref.current;
    const canvas = canvasRef.current;
    const cleanups: (() => void)[] = [];
    const cleanup = () => cleanups.splice(0).reverse().forEach(fn => fn());
    if (!hero || !canvas || !motionAllowed()) return cleanup;
    const title = hero.querySelector<HTMLElement>("#hero-title");
    if (!title) return cleanup;

    const coarse = isTouchFirst();
    const q = gsap.utils.selector(hero);
    const lines = q("[data-line]") as HTMLElement[];
    const dirOf = (el: Element) => Number(el.closest<HTMLElement>("[data-line]")?.dataset.dir ?? 1);

    // ---- GL: the fluid headline. The loader waits for it (up to 6 s).
    let settle: () => void = () => {};
    bootTask(new Promise<void>(r => { settle = r; }), "hero-type");
    const failsafe = window.setTimeout(() => settle(), 6000);
    cleanups.push(() => window.clearTimeout(failsafe));
    let atlasUp = false;
    let disposed = false;
    const gl = createHeroType(canvas, title, {
      coarse,
      onLost: () => hero.removeAttribute("data-gl-type"),
      onRestored: () => { if (atlasUp) hero.setAttribute("data-gl-type", ""); },
    });
    if (gl) {
      cleanups.push(() => {
        disposed = true;
        hero.removeAttribute("data-gl-type");
        gl.dispose();
      });
      gl.ready.then(() => {
        if (disposed) return;
        atlasUp = true;
        hero.setAttribute("data-gl-type", "");
        gl.state.text = 1;
        requestAnimationFrame(() => requestAnimationFrame(() => settle()));
      }, () => settle());
      cleanups.push(onBootDone(() => gl.drive()));
    } else {
      settle();
    }
    // Each line's reveal: the GL state when there is one (a plain stand-in otherwise).
    const reveal = gl?.state.reveal ?? [{ v: 0 }, { v: 0 }, { v: 0 }];

    const ctx = gsap.context(() => {
      // ---- the pinned swap
      const lede = q("[data-lede-word]");
      gsap.set(lines, { "--fill": 0 });
      gsap.set(lede, { autoAlpha: 0, y: 14, filter: "blur(12px)" });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          // the hero sits under the nav from the very top of the page
          start: "top top",
          end: PIN,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      tl.to("[data-hero-lockup]", { autoAlpha: 0, scale: 0.94, filter: "blur(18px)", duration: 0.26, ease: "power1.in" }, 0.02)
        .fromTo("[data-hero-media]", { scale: 1 }, { scale: 1.07, duration: 1, immediateRender: false }, 0)
        .fromTo("[data-hero-veil]", { opacity: 0.82 }, { opacity: 1, duration: 0.5, immediateRender: false }, 0.05);
      lines.forEach((line, i) => {
        const at = 0.24 + i * 0.09;
        tl.to(reveal[i], { v: 1, duration: 0.32, ease: "power1.inOut" }, at)
          .to(line, { "--fill": 1, duration: 0.32, ease: "power1.inOut" }, at)
          .fromTo(
            line.querySelectorAll("[data-atlas-word]"),
            { x: () => `${-dirOf(line) * 4}vw` },
            { x: 0, duration: 0.4, ease: "power2.out" },
            at - 0.04,
          );
      });
      tl.to(lede, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.12, stagger: 0.18 / Math.max(lede.length, 1), ease: "power2.out" }, 0.62)
        .to({}, { duration: 0.16 });
    }, hero);
    cleanups.push(() => ctx.revert());

    // ---- the entrance, on the loader's exit timeline
    cleanups.push(
      onIntro(tl => {
        ctx.add(() => {
          tl.fromTo("[data-hero-media]", { scale: 1.22 }, { scale: 1, duration: 1.9, ease: "expo.out" }, 0.5)
            .fromTo("[data-hero-fade]", { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, 1.1)
            .fromTo(
              q("[data-lk-line]"),
              { yPercent: 55, autoAlpha: 0, filter: "blur(14px)" },
              { yPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1.1, stagger: 0.12, ease: "expo.out" },
              0.95,
            )
            .fromTo("[data-lk-tag]", { scaleX: 0.4, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 1, ease: "expo.out" }, 1.25)
            .fromTo(q("[data-hero-cta]"), { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.09, ease: "expo.out" }, 1.35)
            .set(q("[data-anno], [data-lk-ring]"), { autoAlpha: 1 }, 1.7)
            .fromTo(q("[data-anno-path]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.15 }, 1.7)
            .fromTo(q(".anno-label"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.12 }, 2.05);
        });
      }),
    );

    // ---- pointer: parallax layers and the lines' lean (fine pointers only)
    if (!coarse) {
      const layer = q("[data-hero-layer]")[0];
      const center = q("[data-hero-text]")[0];
      const gridEl = q("[data-hero-grid]")[0];
      const annos = q("[data-hero-annos]")[0];
      const ease = { duration: 1.4, ease: "power3.out" };
      let to: ((v: number) => void)[] = [];
      let lean: { to: gsap.QuickToFunc; dir: number }[] = [];
      ctx.add(() => {
        gsap.set(layer, { scale: SCALE });
        to = [layer, layer, gridEl, gridEl, center, center, annos, annos].map((el, i) =>
          el ? gsap.quickTo(el, i % 2 ? "y" : "x", ease) : () => {},
        );
        lean = lines.map(l => ({ to: gsap.quickTo(l, "x", { duration: 1.4, ease: "power3.out" }), dir: dirOf(l) }));
      });
      const amounts = [-DRIFT, -DRIFT, -GRID_DRIFT, -GRID_DRIFT, TEXT_DRIFT, TEXT_DRIFT, ANNO_DRIFT, ANNO_DRIFT];
      // On the window: the nav sits over the hero, so the section's own events would stop at it.
      const onMove = (e: PointerEvent) => {
        if (hero.getBoundingClientRect().bottom <= 0) return;
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        to.forEach((fn, i) => fn((i % 2 ? ny : nx) * amounts[i]));
        lean.forEach(l => l.to(nx * 18 * l.dir));
      };
      const onLeave = () => {
        to.forEach(fn => fn(0));
        lean.forEach(l => l.to(0));
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      });
    }
    cleanups.push(bindMagnets(hero));

    ScrollTrigger.refresh();
    return cleanup;
  }, []);

  return (
    <section ref={ref} className="hero" id="top" data-sheet="top" data-tone="night" aria-labelledby="hero-title">
      {/* Inner wrapper: the statement sheet's parallax moves this, never the pinned section itself. */}
      <div className="hero-inner" data-parallax>
        <div className="hero-layer" data-hero-layer>
          <div className="hero-media" data-hero-media>
            {media}
          </div>
        </div>
        <div className="hero-veil" data-hero-veil aria-hidden="true" />
        <div className="hero-grid-wrap" data-hero-grid aria-hidden="true">
          {grid}
        </div>
        <canvas ref={canvasRef} className="hero-gl" aria-hidden="true" />
        <div className="hero-in">
          {children}
        </div>
      </div>
    </section>
  );
}
