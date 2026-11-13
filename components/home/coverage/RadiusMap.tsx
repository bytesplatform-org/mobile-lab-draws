"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/animation/gsap";
import { motionAllowed } from "@/lib/animation/motion";
import { CAPS, CAP_ORDER } from "@/lib/content/site";
import { LAND, NEAR, OUTLINE, PIN, RADIUS, VIEW } from "./georgia";

const [px, py] = PIN;
/** Where the route meets the ring (up and to the right). */
const ANGLE = -0.62;
const ex = px + Math.cos(ANGLE) * RADIUS;
const ey = py + Math.sin(ANGLE) * RADIUS;

/**
 * The radius map: a dot-matrix Georgia with a pin at Fayetteville. The
 * 30-mile ring draws in as it scrolls into view, then ripples outward like a
 * drop landing in water, again and again (slowly); a route from the pin to the
 * ring's edge carries a travelling pulse in the cap colours. Decorative: the
 * headline beside it says it in words. Without motion: the ring drawn, still.
 */
export default function RadiusMap({ pin, ring }: { pin: string; ring: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg || !motionAllowed()) return;
    const q = gsap.utils.selector(svg);
    const pulse = svg.querySelector<SVGPathElement>("[data-pulse]")!;
    const ctx = gsap.context(() => {
      gsap.fromTo(q("[data-ring]"), { strokeDashoffset: 1 }, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: { trigger: svg, start: "top 80%", end: "center 55%", scrub: 0.6 },
      });
      gsap.fromTo(q("[data-near]"), { opacity: 0.25 }, {
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: svg, start: "top 70%", end: "center 55%", scrub: 0.6 },
      });
      let i = 0;
      gsap.fromTo(pulse, { strokeDashoffset: 0.12 }, {
        strokeDashoffset: -1,
        duration: 2.4,
        ease: "power1.inOut",
        repeat: -1,
        repeatDelay: 0.6,
        onRepeat: () => { pulse.style.stroke = CAPS[CAP_ORDER[++i % CAP_ORDER.length]]; },
      });
    }, svg);
    const io = new IntersectionObserver(([e]) => svg.classList.toggle("is-live", !!e?.isIntersecting));
    io.observe(svg);
    return () => {
      ctx.revert();
      io.disconnect();
    };
  }, []);

  return (
    <svg className="rmap" ref={ref} viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} aria-hidden="true">
      <path className="rmap-outline" d={OUTLINE} />
      <path className="rmap-land" d={LAND} />
      <path className="rmap-near" d={NEAR} data-near />
      {[0, 1, 2].map(k => (
        <circle key={k} className="rmap-ripple" cx={px} cy={py} r={RADIUS} style={{ animationDelay: `${k * 1.6}s` }} />
      ))}
      <circle className="rmap-ring" cx={px} cy={py} r={RADIUS} pathLength={1} data-ring transform={`rotate(-90 ${px} ${py})`} />
      <path className="rmap-route" d={`M${px} ${py}L${ex.toFixed(1)} ${ey.toFixed(1)}`} />
      <path className="rmap-pulse" data-pulse d={`M${px} ${py}L${ex.toFixed(1)} ${ey.toFixed(1)}`} pathLength={1} style={{ stroke: CAPS.lavender }} />
      <circle className="rmap-end" cx={ex} cy={ey} r={4.5} />
      <text className="rmap-ring-label" x={ex + 10} y={ey - 6}>{ring}</text>
      <g className="rmap-pin" transform={`translate(${px} ${py})`}>
        <circle r={13} className="rmap-pin-halo" />
        <path d="M0 0C-5 -7 -11 -11 -11 -18a11 11 0 0 1 22 0c0 7-6 11-11 18Z" />
        <circle cy={-18} r={4} className="rmap-pin-dot" />
      </g>
      <text className="rmap-pin-label" x={px} y={py + 30} textAnchor="middle">{pin}</text>
    </svg>
  );
}
