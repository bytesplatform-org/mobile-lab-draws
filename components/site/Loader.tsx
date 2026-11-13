"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import { playIntro } from "@/lib/animation/intro";
import { lockScroll } from "@/lib/animation/scroll";
import { motionAllowed } from "@/lib/animation/motion";
import { bootProgress, bootTask, finishBoot, isBooted } from "@/lib/boot";
import { brand, business, loader as copy } from "@/lib/content/site";
import Mark from "./Mark";

/** Never faster than this (s)… */
const MIN_TIME = 1.8;
/** …and never waits longer than this, whatever is still loading (s). */
const MAX_TIME = 6;

/* The tube, in a 120 × 380 box. */
const GLASS = "M32 50V328a28 28 0 0 0 56 0V50";
const INNER = "M35.2 46V328a24.8 24.8 0 0 0 49.6 0V46Z";
const FLOOR = 352;
const BRIM = 64;
const GRADUATIONS = [0.2, 0.4, 0.6, 0.8];

/** Webfonts the first paint depends on, or 3.5 s, whichever is first. */
function displayFontsReady(): Promise<unknown> {
  const root = getComputedStyle(document.documentElement);
  const display = root.getPropertyValue("--font-fraunces").trim();
  const mono = root.getPropertyValue("--font-plex-mono").trim();
  const loads = [
    display && document.fonts.load(`400 100px ${display}`),
    display && document.fonts.load(`italic 400 100px ${display}`),
    mono && document.fonts.load(`400 14px ${mono}`),
  ].filter(Boolean) as Promise<unknown>[];
  return Promise.race([Promise.all(loads).then(() => document.fonts.ready), new Promise(r => setTimeout(r, 3500))]).catch(() => {});
}

/** The hero photograph (server-rendered, the LCP) decoded and ready. */
function heroMediaReady(): Promise<unknown> {
  const img = document.querySelector<HTMLImageElement>("[data-hero-media] img");
  if (!img) return Promise.resolve();
  if (img.complete) return img.decode().catch(() => {});
  return new Promise<void>(r => {
    img.addEventListener("load", () => r(), { once: true });
    img.addEventListener("error", () => r(), { once: true });
  });
}

/**
 * The specimen-tube loader. A tube outline fills with liquid from the bottom
 * (its surface wobbles, climbing the glass at the edges like a meniscus) while
 * a mono counter runs 0 → 100 on real progress: the boot tasks (fonts, window
 * load, the hero photograph, the hero's glyph atlas), held between MIN_TIME
 * and MAX_TIME (FernGrid's charge). At 100 the cap clicks on in teal, the mark
 * and wordmark resolve, and the panel lifts away on a curved edge while every
 * entrance registered with onIntro plays on the same timeline.
 *
 * CSS shows it only under html.motion; a CSS failsafe hides it at 10 s
 * whatever happens here. Reduced motion: never shown.
 */
export default function Loader() {
  const ref = useRef<HTMLDivElement>(null);
  const [skip] = useState(() => typeof window !== "undefined" && isBooted());
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (skip || !el) return;
    if (!motionAllowed() || isBooted()) {
      el.hidden = true;
      finishBoot();
      return;
    }

    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    let release: (() => void) | null = lockScroll();
    const unlock = () => {
      release?.();
      release = null;
    };

    bootTask(displayFontsReady(), "fonts");
    bootTask(heroMediaReady(), "hero-media");
    bootTask(
      new Promise<void>(r => (document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true }))),
      "window-load",
    );

    const panel: HTMLDivElement = el;
    const q = gsap.utils.selector(panel);
    const pick = <T extends Element>(sel: string) => panel.querySelector<T>(sel)!;
    const liquid = pick<SVGPathElement>("[data-liquid]");
    const count = pick<HTMLElement>("[data-count]");
    const status = pick<HTMLElement>("[data-status]");
    const bar = pick<HTMLElement>("[data-bar]");
    const cap = pick<SVGGElement>("[data-cap]");
    const tube = pick<SVGSVGElement>("[data-tube]");
    const word = pick<HTMLElement>("[data-word]");
    const edge = pick<SVGSVGElement>("[data-edge]");

    let p = 0;
    let level = 0;
    let slosh = 0;
    let disposed = false;
    const t0 = performance.now();

    // The liquid surface: a gentle travelling wave, plus a meniscus that climbs
    // the glass, plus a slosh that grows with how fast the level is rising.
    const drawLiquid = (time: number) => {
      const y = FLOOR - level * (FLOOR - BRIM);
      const amp = 1.1 + slosh * 9;
      let d = "";
      for (let i = 0; i <= 16; i++) {
        const x = 34 + (52 * i) / 16;
        const u = (x - 60) / 26;
        const wave = Math.sin(x * 0.19 + time * 3.1) * amp + Math.sin(x * 0.07 - time * 1.7) * amp * 0.6;
        const meniscus = -5 * Math.pow(Math.abs(u), 6);
        d += `${i ? "L" : "M"}${x.toFixed(2)} ${(y + wave + meniscus).toFixed(2)}`;
      }
      liquid.setAttribute("d", `${d}L86 380L34 380Z`);
    };

    const write = (value: number) => {
      panel.style.setProperty("--progress", value.toFixed(4));
      count.textContent = String(Math.round(value * 100)).padStart(3, "0");
      bar.style.transform = `scaleX(${value})`;
      const s = copy.status[Math.min(copy.status.length - 1, Math.floor(value * copy.status.length))];
      if (status.textContent !== s) status.textContent = s;
    };

    const tick = () => {
      const now = performance.now();
      const elapsed = (now - t0) / 1000;
      const { total, settled } = bootProgress();
      const real = total ? settled / total : 0;
      // FernGrid's charge: time keeps it moving (never past 92 % until things
      // have actually loaded), real progress pulls it ahead.
      const timeFloor = Math.min(0.92, elapsed / MIN_TIME);
      let goal = Math.max(p, Math.min(Math.max(real, timeFloor * 0.6), timeFloor + 0.08, 1));
      if (real >= 0.99 && elapsed >= MIN_TIME) goal = 1;
      if (elapsed >= MAX_TIME) goal = 1;
      const before = level;
      p += (goal - p) * (goal === 1 ? 0.12 : 0.06);
      if (goal === 1 && p > 0.995) p = 1;
      level += (p - level) * 0.18;
      slosh += (Math.min(1, Math.abs(level - before) * 40) - slosh) * 0.08;
      write(p);
      drawLiquid(elapsed);
      if (p === 1 && !capping) cap_on();
    };

    let capping = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)); };
    const finish = () => {
      panel.hidden = true;
      unlock();
      ScrollTrigger.refresh();
      setGone(true);
    };

    // At 100: the cap clicks on, the mark and wordmark resolve, then the lift.
    function cap_on() {
      capping = true;
      const tl = gsap.timeline();
      tl.fromTo(cap, { y: -70, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.42, ease: "back.out(2.6)" })
        .to(tube, { scaleY: 0.985, scaleX: 1.012, duration: 0.06, ease: "power2.out", transformOrigin: "50% 100%" }, 0.36)
        .to(tube, { scaleY: 1, scaleX: 1, duration: 0.5, ease: "elastic.out(1, 0.35)" }, 0.42)
        .fromTo(word, { autoAlpha: 0, y: 14, filter: "blur(12px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out" }, 0.5)
        .call(lift, undefined, 1.35);
    }

    function lift() {
      if (disposed) return;
      gsap.ticker.remove(tick);
      const dur = 1.15;
      const at = 0.35;
      const tl = gsap.timeline({ onComplete: finish });
      tl.to(q("[data-lift-out]"), { yPercent: -40, autoAlpha: 0, duration: 0.55, ease: "power3.in", stagger: 0.04 }, 0)
        .to(count, { yPercent: -110, autoAlpha: 0, duration: 0.45, ease: "power3.in" }, 0.05)
        .fromTo(
          panel,
          { y: 0 },
          { y: () => -(panel.offsetHeight + edge.getBoundingClientRect().height + 2), duration: dur, ease: "expo.inOut" },
          at,
        )
        .fromTo(edge, { scaleY: 1 }, { scaleY: 0.2, duration: dur, ease: "expo.inOut" }, at)
        // The page boots as the panel starts to rise: reveals arm, the film trail
        // starts, the hero's GL wakes; scrolling comes back once it has cleared.
        .call(finishBoot, undefined, at)
        .call(unlock, undefined, at + dur);
      playIntro(tl);
    }

    gsap.ticker.add(tick);

    // Failsafe: whatever happens to the frame loop, the page is shown.
    later(() => {
      if (isBooted()) return;
      finishBoot();
      panel.classList.add("leave");
      later(finish, 900);
    }, 9000);

    return () => {
      disposed = true;
      gsap.ticker.remove(tick);
      timers.forEach(id => window.clearTimeout(id));
      unlock();
    };
  }, [skip]);

  if (skip || gone) return null;
  return (
    <div className="loader" ref={ref} role="status" aria-live="polite" aria-label={copy.ariaLabel}>
      <div className="ld-grid" aria-hidden="true" />
      <div className="ld-row mono" aria-hidden="true" data-lift-out>
        <span>{brand.kicker}</span>
        <span className="hide-sm">{brand.sequence.join(" → ")}</span>
      </div>

      <div className="ld-center" aria-hidden="true">
        <svg className="ld-tube" data-tube viewBox="0 0 120 380" data-lift-out>
          <defs>
            <clipPath id="ld-inner">
              <path d={INNER} />
            </clipPath>
            <linearGradient id="ld-blood" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#5e1016" />
              <stop offset="0.45" stopColor="#8e1b22" />
              <stop offset="1" stopColor="#4a0b10" />
            </linearGradient>
          </defs>
          <g clipPath="url(#ld-inner)">
            <path className="ld-liquid" data-liquid d={`M34 ${FLOOR}L86 ${FLOOR}L86 380L34 380Z`} />
          </g>
          {GRADUATIONS.map(g => {
            const y = FLOOR - g * (FLOOR - BRIM);
            return <path key={g} className="ld-grad" d={`M88 ${y}h${g === 0.4 || g === 0.8 ? 12 : 7}`} />;
          })}
          <path className="ld-glass" d={GLASS} />
          <path className="ld-gloss" d="M41 70V300" />
          <path className="ld-lip" d="M26 48H94" />
          <g className="ld-cap" data-cap>
            <rect x="24" y="8" width="72" height="40" rx="7" />
            <path d="M36 14v28M48 14v28M60 14v28M72 14v28M84 14v28" />
          </g>
        </svg>
        <div className="ld-word" data-word>
          <Mark className="ld-mark" />
          <span>{brand.name}</span>
        </div>
      </div>

      <div className="ld-bottom" aria-hidden="true">
        <p className="mono" data-lift-out>
          <span className="ld-legal">{business.legalName}</span>
          <span data-status>{copy.status[0]}</span>
        </p>
        <p className="ld-count" data-count>000</p>
      </div>
      <div className="ld-bar" aria-hidden="true">
        <i data-bar />
      </div>

      {/* Curved bottom edge that sweeps up as the panel lifts (FernGrid). */}
      <svg className="ld-edge" data-edge viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0 Q50 200 100 0 Z" />
      </svg>
    </div>
  );
}
