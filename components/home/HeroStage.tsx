"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import { onIntro } from "@/lib/animation/intro";
import { bindMagnets } from "@/lib/animation/magnet";
import { motionAllowed } from "@/lib/animation/motion";
import { isTouchFirst } from "@/lib/animation/prefs";
import { bootTask, onBootDone } from "@/lib/boot";
import { createHeroType } from "@/lib/gl/heroType";
import { LEVELS } from "./heroTubes";

/** Scroll the hero stays pinned for the lockup → headline swap. */
const PIN = "+=220%";
/** Max pointer drift (px): the photo against the pointer, the type and readout with it. */
const DRIFT = 30;
const TEXT_DRIFT = 12;
const READOUT_DRIFT = 20;
/** Over-scale so the photo's drift never shows an edge. */
const SCALE = 1.08;

/**
 * The hero sheet: everything that moves.
 *
 * - Entrance (on the loader's exit timeline): the photo settles from a zoom,
 *   the lockup's lines rise up through their masks like liquid filling them,
 *   the cap stripe and tagline follow, the four tubes rise into their rack,
 *   fill in their cap colours and cap on, and the scale's liquid level rises.
 * - Pinned, scroll-scrubbed swap: the lockup, tubes and scale blur
 *   away; the H1's three lines rise in one after another (in GL, a liquid
 *   front through the glyphs; in DOM, the same as a rising clip); then the
 *   lede blurs in word by word. A short hold, then the statement sheet's arc
 *   rises over it.
 * - Pointer: the photo drifts against it, the type and tubes with it; the
 *   H1 lines lean (Blueprint).
 * - GL: the H1 is drawn through a fluid the pointer stirs (lib/gl/heroType);
 *   on touch a slow Lissajous probe stirs it instead. Once the glyph atlas is
 *   up the section gets data-gl-type and the DOM words turn transparent;
 *   without WebGL or float targets they keep their fill and outline.
 */
export default function HeroStage({ media, children }: { media: ReactNode; children: ReactNode }) {
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
      tl.to("[data-hero-lockup], [data-hero-readout]", { autoAlpha: 0, scale: 0.96, filter: "blur(16px)", duration: 0.24, stagger: 0.03, ease: "power1.in" }, 0.02)
        .to("[data-hero-ruler]", { autoAlpha: 0, duration: 0.2 }, 0.04)
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
            .fromTo(q("[data-lk-line]"), { yPercent: 108 }, { yPercent: 0, duration: 1.3, stagger: 0.14, ease: "expo.out" }, 0.9)
            .fromTo(q(".lk-caps i"), { scaleY: 0 }, { scaleY: 1, duration: 0.6, stagger: 0.05, ease: "back.out(2)" }, 1.3)
            .fromTo(q(".lk-tag .mono"), { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.8, ease: "power3.out" }, 1.45)
            .fromTo(q("[data-ht]"), { y: 90, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.1, ease: "expo.out" }, 1.25)
            .fromTo(q("[data-hero-level]"), { scaleY: 0 }, { scaleY: 1, duration: 1.8, ease: "power2.inOut" }, 1.1)
            .fromTo(q("[data-hero-cta]"), { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.09, ease: "expo.out" }, 1.35);
          // the tubes fill, then their caps click on
          (q(".ht-tube") as unknown as SVGSVGElement[]).forEach((tube, i) => {
            tube.setAttribute("data-armed", "");
            tl.fromTo(tube, { "--lv": 0 }, { "--lv": LEVELS[i], duration: 1.3, ease: "power2.inOut" }, 1.55 + i * 0.12).call(
              () => tube.classList.add("capped"),
              undefined,
              2.75 + i * 0.12,
            );
          });
        });
      }),
    );

    // ---- pointer: parallax layers and the lines' lean (fine pointers only)
    if (!coarse) {
      const layer = q("[data-hero-layer]")[0];
      const center = q("[data-hero-lockup]")[0];
      const readout = q("[data-hero-readout]")[0];
      const ease = { duration: 1.4, ease: "power3.out" };
      let to: ((v: number) => void)[] = [];
      let lean: { to: gsap.QuickToFunc; dir: number }[] = [];
      ctx.add(() => {
        gsap.set(layer, { scale: SCALE });
        to = [layer, layer, center, center, readout, readout].map((el, i) =>
          el ? gsap.quickTo(el, i % 2 ? "y" : "x", ease) : () => {},
        );
        lean = lines.map(l => ({ to: gsap.quickTo(l, "x", { duration: 1.4, ease: "power3.out" }), dir: dirOf(l) }));
      });
      const amounts = [-DRIFT, -DRIFT, TEXT_DRIFT, TEXT_DRIFT, READOUT_DRIFT, READOUT_DRIFT];
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
        <canvas ref={canvasRef} className="hero-gl" aria-hidden="true" />
        <div className="hero-in">
          {children}
        </div>
      </div>
    </section>
  );
}
