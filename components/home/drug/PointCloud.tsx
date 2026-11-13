"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import type { ShapeKey } from "@/lib/content/site";
import { SHAPES, morphSeeds, samplePoints } from "./shapes";

export type PointCloudHandle = {
  /** Scroll-driven: draw shape `a` morphed `t` (0–1) of the way to shape `b`. */
  blend: (a: number, b: number, t: number) => void;
};

type Props = {
  /** The shapes, in order (a static cloud draws only `initial`). */
  shapes: ShapeKey[];
  /** Point density per shape, 0–1 (the "coming soon" tests are half). */
  density?: number[];
  initial: number;
  mode: "morph" | "static";
  count?: number;
  className?: string;
  ref?: Ref<PointCloudHandle>;
};

const DOT = "rgba(241, 244, 240, 0.9)";
const TEAL = "rgba(106, 183, 184, 0.95)";

/**
 * A stippled point cloud on a canvas (FernGrid's era/point-cloud). In
 * "morph" mode it samples every shape and draws any blend of two, each point
 * staggered and scattered a little mid-flight; the number of points drawn
 * follows the shapes' densities, so a half-density shape thins out as you
 * arrive at it. One point in seven is teal. Sampling waits until the canvas is
 * near the viewport, so it costs nothing until it's needed.
 */
export default function PointCloud({ shapes: keys, density, initial, mode, count = 2600, className, ref }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<PointCloudHandle>({ blend: () => {} });

  useImperativeHandle(ref, () => ({ blend: (a, b, t) => api.current.blend(a, b, t) }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const handle = api.current;
    const n = mode === "static" ? Math.round(count * 0.55) : count;
    const dens = (i: number) => density?.[i] ?? 1;
    let shapes: Float32Array[] | null = null;
    const from = new Float32Array(n * 2);
    const to = new Float32Array(n * 2);
    const seeds = morphSeeds(n);
    let pair = "";
    let state = { a: initial, b: initial, t: 1 };
    let w = 0;
    let h = 0;
    let dot = 1.6;

    const draw = () => {
      if (!shapes || !w) return;
      ctx.clearRect(0, 0, w, h);
      const s = Math.min(w, h);
      const ox = (w - s) / 2;
      const oy = (h - s) / 2;
      const p = state.t;
      // eased share of points: thins or thickens toward the arriving shape
      const ge = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const shown = Math.round(n * (dens(state.a) + (dens(state.b) - dens(state.a)) * ge));
      for (let pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass ? TEAL : DOT;
        for (let i = pass; i < shown; i += pass ? 7 : 1) {
          if (!pass && i % 7 === 1) continue;
          const t = Math.min(1, Math.max(0, (p - seeds.delay[i] * 0.35) / 0.65));
          const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          const lift = Math.sin(t * Math.PI);
          const x = from[i * 2] + (to[i * 2] - from[i * 2]) * e + seeds.sx[i] * lift;
          const y = from[i * 2 + 1] + (to[i * 2 + 1] - from[i * 2 + 1]) * e + seeds.sy[i] * lift;
          ctx.fillRect(ox + x * s, oy + y * s, dot, dot);
        }
      }
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      w = canvas.width;
      h = canvas.height;
      dot = Math.max(1.3, Math.min(2.3, r.width / 290)) * dpr;
      draw();
    };

    const setPair = (a: number, b: number) => {
      const key = `${a}>${b}`;
      if (!shapes || key === pair) return;
      from.set(shapes[a]);
      to.set(shapes[b]);
      pair = key;
    };

    const ensureSampled = () => {
      if (shapes) return;
      shapes = keys.map((k, i) => (mode === "static" && i !== initial ? new Float32Array(n * 2) : samplePoints(SHAPES[k], n, 7 + i)));
      setPair(state.a, state.b);
      resize();
    };

    handle.blend = (a, b, t) => {
      state = { a, b, t: Math.min(1, Math.max(0, t)) };
      if (mode === "static") return;
      setPair(a, b);
      draw();
    };

    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          ensureSampled();
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => {
      io.disconnect();
      ro.disconnect();
      handle.blend = () => {};
    };
  }, [keys, density, initial, mode, count]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
