"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/animation/gsap";
import { introsReady } from "@/lib/animation/prefs";
import { CAPS, CAP_ORDER } from "@/lib/content/site";

/**
 * The specimen-route network (FernGrid's power grid, reinterpreted): thin
 * routes between small collection points, kept to the edges so the headline
 * stays clear. Routes draw in on load; small pulses in the tube-cap colours
 * travel along a few of them (mobile collection on the move); a soft
 * spotlight follows the pointer and lights the nearby routes in teal.
 * Static under reduced motion. Coordinates are in a 1600 × 900 box ("slice").
 */
const NODES: [number, number][] = [
  // left
  [70, 250], [200, 320], [120, 470], [310, 430], [250, 600], [90, 700], [390, 620], [330, 770], [170, 850],
  // right
  [1530, 250], [1400, 330], [1490, 470], [1290, 420], [1360, 590], [1510, 700], [1220, 630], [1270, 780], [1440, 850],
  // foot
  [560, 800], [800, 846], [1040, 800],
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [3, 6], [4, 5], [4, 6], [5, 8], [6, 7], [7, 8], [6, 18], [7, 18], [18, 19],
  [9, 10], [10, 11], [10, 12], [11, 13], [12, 13], [12, 15], [13, 14], [13, 15], [14, 17], [15, 16], [16, 17], [15, 20],
  [16, 20], [19, 20],
];

/** Collection points that get a double ring. */
const HUBS = new Set([3, 6, 12, 15, 19]);
/** Routes that carry a travelling pulse, each in the next cap colour. */
const PULSES = [2, 7, 11, 13, 19, 21, 27, 5];

const route = ([a, b]: [number, number]) => `M ${NODES[a][0]} ${NODES[a][1]} L ${NODES[b][0]} ${NODES[b][1]}`;

function Network({ stroke, width }: { stroke: string; width: number }) {
  return (
    <g fill="none" stroke={stroke} strokeWidth={width}>
      {EDGES.map((e, i) => (
        <path key={i} data-grid-line d={route(e)} pathLength={1} strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
      ))}
      {NODES.map(([x, y], i) => (
        <g key={i} data-grid-node>
          <circle cx={x} cy={y} r={3.2} fill={stroke} stroke="none" />
          {HUBS.has(i) && <circle cx={x} cy={y} r={11} vectorEffect="non-scaling-stroke" />}
        </g>
      ))}
    </g>
  );
}

export default function HeroGrid() {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = svgRef.current;
      if (!svg) return;
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        // Draws in after the loader has lifted (hidden by CSS until then: no flash).
        const tl = gsap.timeline({ delay: 0.5, paused: true });
        tl.set(svg, { autoAlpha: 1 })
          .fromTo("[data-grid-line]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.out", stagger: 0.025 })
          .from("[data-grid-node]", { autoAlpha: 0, duration: 0.6, stagger: 0.02 }, 0.4);
        introsReady().then(() => tl.play());

        gsap.utils.toArray<SVGPathElement>("[data-grid-pulse]").forEach((p, i) => {
          gsap.fromTo(
            p,
            { strokeDashoffset: 0.06 },
            { strokeDashoffset: -1, duration: 2.8 + (i % 3) * 0.7, ease: "none", repeat: -1, repeatDelay: 0.4 + (i % 4) * 0.5, delay: 2 + i * 0.45 },
          );
        });
      });

      // Pointer spotlight (mouse and trackpad only).
      mm.add(`${MQ.motion} and ${MQ.fine}`, () => {
        const spot = svg.querySelector<SVGCircleElement>("[data-grid-spot]");
        if (!spot) return;
        const pos = { x: 800, y: 450, r: 0 };
        const apply = () => {
          spot.setAttribute("cx", String(pos.x));
          spot.setAttribute("cy", String(pos.y));
          spot.setAttribute("r", String(pos.r));
        };
        const pt = svg.createSVGPoint();
        const onMove = (e: PointerEvent) => {
          if (svg.getBoundingClientRect().bottom <= 0) return;
          const ctm = svg.getScreenCTM();
          if (!ctm) return;
          pt.x = e.clientX;
          pt.y = e.clientY;
          const p = pt.matrixTransform(ctm.inverse());
          gsap.to(pos, { x: p.x, y: p.y, r: 280, duration: 0.7, ease: "power3.out", overwrite: true, onUpdate: apply });
        };
        const onLeave = () => gsap.to(pos, { r: 0, duration: 0.6, ease: "power2.out", overwrite: true, onUpdate: apply });
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        return () => {
          window.removeEventListener("pointermove", onMove);
          document.documentElement.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { scope: svgRef },
  );

  return (
    <svg ref={svgRef} className="hero-grid" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="hg-spot-fill">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="hg-spot" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900">
          <circle data-grid-spot cx="800" cy="450" r="0" fill="url(#hg-spot-fill)" />
        </mask>
      </defs>
      <Network stroke="rgba(241, 244, 240, 0.16)" width={1} />
      <g mask="url(#hg-spot)">
        <Network stroke="var(--teal-bright)" width={1.6} />
      </g>
      <g className="hg-pulses" fill="none" strokeWidth={2.6} strokeLinecap="round">
        {PULSES.map((edge, i) => (
          <path
            key={edge}
            data-grid-pulse
            d={route(EDGES[edge])}
            stroke={CAPS[CAP_ORDER[i % CAP_ORDER.length]]}
            pathLength={1}
            strokeDasharray="0.06 1"
            strokeDashoffset={1.1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}
