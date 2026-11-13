/**
 * Silhouettes for the drug-screen point cloud (after FernGrid's era/shapes).
 * Each is drawn into a 400 × 400 offscreen canvas; alpha is point density
 * (outlines dense, fills sparse), and points are sampled from the drawn
 * pixels. Purely illustrative: no values, numbers or text. Callout anchors
 * are in 0–1 box coordinates; their labels come from the content file.
 */
import type { ShapeKey } from "@/lib/content/site";

export const BOX = 400;

export type Anchor = { ax: number; ay: number; lx: number; ly: number; align?: "left" | "right" };
export type ShapeDef = { draw: (ctx: CanvasRenderingContext2D) => void; anchors: Anchor[] };

type C = CanvasRenderingContext2D;
const stroke = (ctx: C, alpha: number, width: number) => {
  ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
};
const fill = (ctx: C, alpha: number) => {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fill();
};
const roundRect = (ctx: C, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};
const line = (ctx: C, pts: [number, number][]) => {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
};
const P = (x: number, y: number) => ({ x: x / BOX, y: y / BOX });

/* Urine specimen cup: lid, tapered body, graduations, the sample inside. */
const cup: ShapeDef = {
  draw(ctx) {
    roundRect(ctx, 104, 86, 192, 40, 10);
    fill(ctx, 0.4);
    stroke(ctx, 1, 4);
    for (let x = 118; x < 290; x += 14) {
      line(ctx, [[x, 92], [x, 120]]);
      stroke(ctx, 0.55, 2);
    }
    ctx.beginPath();
    ctx.moveTo(118, 132);
    ctx.lineTo(282, 132);
    ctx.lineTo(266, 336);
    ctx.quadraticCurveTo(264, 350, 250, 350);
    ctx.lineTo(150, 350);
    ctx.quadraticCurveTo(136, 350, 134, 336);
    ctx.closePath();
    fill(ctx, 0.08);
    stroke(ctx, 1, 4.5);
    // the sample, with a meniscus
    ctx.beginPath();
    ctx.moveTo(129, 232);
    ctx.quadraticCurveTo(200, 246, 271, 232);
    ctx.lineTo(266, 336);
    ctx.quadraticCurveTo(264, 346, 250, 346);
    ctx.lineTo(150, 346);
    ctx.quadraticCurveTo(136, 346, 134, 336);
    ctx.closePath();
    fill(ctx, 0.34);
    line(ctx, [[129, 232], [200, 244], [271, 232]]);
    stroke(ctx, 0.9, 3);
    // graduations
    for (let i = 0; i < 6; i++) {
      const y = 160 + i * 28;
      line(ctx, [[272 - i * 1.2, y], [252 - i * 1.2, y]]);
      stroke(ctx, 0.8, 2.5);
    }
    // label
    roundRect(ctx, 152, 160, 84, 52, 6);
    stroke(ctx, 0.7, 2.5);
  },
  anchors: [
    { ...ax(P(200, 106)), lx: 0.06, ly: 0.12, align: "left" },
    { ...ax(P(200, 300)), lx: 0.94, ly: 0.88, align: "right" },
  ],
};

/* DOT / non-DOT: a shield split down the middle, one half solid, one hatched. */
const SHIELD = (ctx: C) => {
  ctx.beginPath();
  ctx.moveTo(200, 46);
  ctx.bezierCurveTo(250, 76, 300, 84, 334, 86);
  ctx.lineTo(334, 196);
  ctx.bezierCurveTo(334, 284, 276, 336, 200, 368);
  ctx.bezierCurveTo(124, 336, 66, 284, 66, 196);
  ctx.lineTo(66, 86);
  ctx.bezierCurveTo(100, 84, 150, 76, 200, 46);
  ctx.closePath();
};
const shield: ShapeDef = {
  draw(ctx) {
    ctx.save();
    SHIELD(ctx);
    ctx.clip();
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, 200, 400);
    for (let k = -400; k < 400; k += 18) {
      line(ctx, [[200, k + 120], [400, k + 320]]);
      stroke(ctx, 0.5, 2.5);
    }
    ctx.restore();
    SHIELD(ctx);
    stroke(ctx, 1, 5);
    line(ctx, [[200, 50], [200, 364]]);
    stroke(ctx, 1, 4);
    // inner rim
    ctx.save();
    ctx.translate(200, 207);
    ctx.scale(0.84, 0.84);
    ctx.translate(-200, -207);
    SHIELD(ctx);
    stroke(ctx, 0.5, 2.4);
    ctx.restore();
  },
  anchors: [
    { ...ax(P(130, 200)), lx: 0.06, ly: 0.08, align: "left" },
    { ...ax(P(270, 220)), lx: 0.94, ly: 0.9, align: "right" },
  ],
};

/* Oral fluid: a collection swab, its pad, and the tube it goes into. */
const swab: ShapeDef = {
  draw(ctx) {
    ctx.save();
    ctx.translate(176, 214);
    ctx.rotate(-0.62);
    roundRect(ctx, -8, -20, 16, 210, 8);
    fill(ctx, 0.22);
    stroke(ctx, 1, 3.5);
    ctx.beginPath();
    ctx.ellipse(0, -60, 30, 52, 0, 0, Math.PI * 2);
    fill(ctx, 0.5);
    stroke(ctx, 1, 4);
    for (let i = -3; i <= 3; i++) {
      line(ctx, [[-24, -60 + i * 12], [24, -60 + i * 12]]);
      stroke(ctx, 0.45, 2);
    }
    ctx.restore();
    // tube
    roundRect(ctx, 268, 150, 64, 210, 30);
    fill(ctx, 0.06);
    stroke(ctx, 1, 4);
    roundRect(ctx, 260, 120, 80, 34, 8);
    fill(ctx, 0.36);
    stroke(ctx, 1, 3.5);
    ctx.beginPath();
    ctx.moveTo(272, 300);
    ctx.quadraticCurveTo(300, 308, 328, 300);
    ctx.lineTo(328, 330);
    ctx.quadraticCurveTo(300, 362, 272, 330);
    ctx.closePath();
    fill(ctx, 0.3);
  },
  anchors: [{ ...ax(P(120, 110)), lx: 0.06, ly: 0.08, align: "left" }],
};

/* Breath alcohol: a cloud of breath and the streams leading into it. */
const breath: ShapeDef = {
  draw(ctx) {
    const puffs: [number, number, number][] = [[170, 190, 62], [232, 168, 70], [292, 200, 54], [214, 232, 62], [130, 228, 44], [270, 246, 50]];
    ctx.beginPath();
    puffs.forEach(([x, y, r]) => { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); });
    fill(ctx, 0.2);
    puffs.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI * 0.9, Math.PI * 2.1);
      stroke(ctx, 0.9, 4);
    });
    for (let i = 0; i < 4; i++) {
      const y = 286 + i * 22;
      ctx.beginPath();
      ctx.moveTo(40, y);
      for (let x = 40; x <= 200 - i * 26; x += 4) ctx.lineTo(x, y + Math.sin(x * 0.07 + i) * 6);
      stroke(ctx, 0.9 - i * 0.12, 3.5);
    }
    // the device's mouthpiece
    roundRect(ctx, 18, 296, 30, 56, 8);
    stroke(ctx, 1, 3.5);
  },
  anchors: [{ ...ax(P(232, 168)), lx: 0.94, ly: 0.08, align: "right" }],
};

/* Point of service, same day: a stopwatch, the elapsed sweep shaded. */
const stopwatch: ShapeDef = {
  draw(ctx) {
    const cx = 200, cy = 226, r = 128;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    fill(ctx, 0.06);
    stroke(ctx, 1, 6);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r - 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 0.7);
    ctx.closePath();
    fill(ctx, 0.3);
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const r1 = i % 5 === 0 ? r - 24 : r - 14;
      line(ctx, [[cx + Math.cos(a) * r1, cy + Math.sin(a) * r1], [cx + Math.cos(a) * (r - 6), cy + Math.sin(a) * (r - 6)]]);
      stroke(ctx, i % 5 === 0 ? 1 : 0.5, i % 5 === 0 ? 4 : 2);
    }
    const a = -Math.PI / 2 + Math.PI * 0.7;
    line(ctx, [[cx, cy], [cx + Math.cos(a) * (r - 30), cy + Math.sin(a) * (r - 30)]]);
    stroke(ctx, 1, 5);
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    fill(ctx, 1);
    roundRect(ctx, 182, 62, 36, 24, 5);
    fill(ctx, 0.5);
    stroke(ctx, 1, 3.5);
    line(ctx, [[200, 86], [200, 98]]);
    stroke(ctx, 1, 6);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(0.78);
    roundRect(ctx, -12, -r - 26, 24, 18, 4);
    stroke(ctx, 1, 3.5);
    ctx.restore();
  },
  anchors: [
    { ...ax(P(276, 180)), lx: 0.94, ly: 0.06, align: "right" },
    { ...ax(P(200, 72)), lx: 0.06, ly: 0.06, align: "left" },
  ],
};

/* Saliva: a funnel over a collection tube, a drop falling in. */
const saliva: ShapeDef = {
  draw(ctx) {
    roundRect(ctx, 160, 150, 80, 210, 38);
    fill(ctx, 0.06);
    stroke(ctx, 1, 4.5);
    ctx.beginPath();
    ctx.moveTo(110, 96);
    ctx.lineTo(290, 96);
    ctx.lineTo(222, 160);
    ctx.lineTo(178, 160);
    ctx.closePath();
    fill(ctx, 0.2);
    stroke(ctx, 1, 4);
    ctx.beginPath();
    ctx.moveTo(165, 282);
    ctx.quadraticCurveTo(200, 292, 235, 282);
    ctx.lineTo(235, 322);
    ctx.quadraticCurveTo(200, 368, 165, 322);
    ctx.closePath();
    fill(ctx, 0.4);
    ctx.beginPath();
    ctx.moveTo(200, 26);
    ctx.bezierCurveTo(186, 46, 180, 56, 180, 64);
    ctx.arc(200, 64, 20, Math.PI, 0, true);
    ctx.bezierCurveTo(220, 56, 214, 46, 200, 26);
    fill(ctx, 0.6);
    stroke(ctx, 1, 3);
    for (let i = 0; i < 4; i++) {
      line(ctx, [[232, 196 + i * 22], [216, 196 + i * 22]]);
      stroke(ctx, 0.7, 2.5);
    }
  },
  anchors: [{ ...ax(P(200, 300)), lx: 0.94, ly: 0.9, align: "right" }],
};

/* Blood alcohol: a drop, with a highlight and two small satellites. */
const DROP = (ctx: C, s: number, x: number, y: number) => {
  ctx.beginPath();
  ctx.moveTo(x, y - 150 * s);
  ctx.bezierCurveTo(x + 40 * s, y - 80 * s, x + 110 * s, y - 20 * s, x + 110 * s, y + 50 * s);
  ctx.arc(x, y + 50 * s, 110 * s, 0, Math.PI, false);
  ctx.bezierCurveTo(x - 110 * s, y - 20 * s, x - 40 * s, y - 80 * s, x, y - 150 * s);
  ctx.closePath();
};
const drop: ShapeDef = {
  draw(ctx) {
    DROP(ctx, 1, 200, 190);
    fill(ctx, 0.32);
    stroke(ctx, 1, 5);
    ctx.beginPath();
    ctx.arc(200, 240, 76, Math.PI * 1.05, Math.PI * 1.45);
    stroke(ctx, 0.9, 7);
    DROP(ctx, 0.14, 330, 300);
    fill(ctx, 0.6);
    DROP(ctx, 0.09, 78, 330);
    fill(ctx, 0.6);
  },
  anchors: [{ ...ax(P(258, 230)), lx: 0.94, ly: 0.1, align: "right" }],
};

/* Court ordered: a gavel over its sound block, strike lines. */
const gavel: ShapeDef = {
  draw(ctx) {
    ctx.save();
    ctx.translate(196, 170);
    ctx.rotate(-0.62);
    roundRect(ctx, -80, -36, 160, 72, 14);
    fill(ctx, 0.34);
    stroke(ctx, 1, 4.5);
    roundRect(ctx, -92, -42, 18, 84, 6);
    fill(ctx, 0.6);
    roundRect(ctx, 74, -42, 18, 84, 6);
    fill(ctx, 0.6);
    roundRect(ctx, -9, 36, 18, 190, 8);
    fill(ctx, 0.22);
    stroke(ctx, 1, 3.5);
    ctx.restore();
    roundRect(ctx, 60, 318, 190, 40, 10);
    fill(ctx, 0.34);
    stroke(ctx, 1, 4);
    roundRect(ctx, 84, 296, 142, 24, 8);
    stroke(ctx, 1, 3.5);
    [[46, 268, 70, 286], [40, 300, 66, 304], [264, 268, 240, 286]].forEach(([a, b, c, d]) => {
      line(ctx, [[a, b], [c, d]]);
      stroke(ctx, 0.9, 3.5);
    });
  },
  anchors: [{ ...ax(P(155, 330)), lx: 0.06, ly: 0.94, align: "left" }],
};

/* Reasonable suspicion: a magnifier, an eye in its lens. */
const magnifier: ShapeDef = {
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(170, 170, 112, 0, Math.PI * 2);
    fill(ctx, 0.05);
    stroke(ctx, 1, 9);
    ctx.beginPath();
    ctx.arc(170, 170, 96, 0, Math.PI * 2);
    stroke(ctx, 0.45, 2.5);
    ctx.save();
    ctx.translate(170, 170);
    ctx.beginPath();
    ctx.moveTo(-72, 0);
    ctx.quadraticCurveTo(0, -62, 72, 0);
    ctx.quadraticCurveTo(0, 62, -72, 0);
    ctx.closePath();
    fill(ctx, 0.14);
    stroke(ctx, 1, 4);
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    fill(ctx, 0.5);
    stroke(ctx, 1, 3);
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    fill(ctx, 1);
    ctx.restore();
    ctx.save();
    ctx.translate(254, 254);
    ctx.rotate(Math.PI / 4);
    roundRect(ctx, 0, -16, 128, 32, 14);
    fill(ctx, 0.4);
    stroke(ctx, 1, 4);
    ctx.restore();
  },
  anchors: [
    { ...ax(P(100, 170)), lx: 0.06, ly: 0.9, align: "left" },
    { ...ax(P(240, 170)), lx: 0.94, ly: 0.06, align: "right" },
  ],
};

function ax(p: { x: number; y: number }) {
  return { ax: p.x, ay: p.y };
}

export const SHAPES: Record<ShapeKey, ShapeDef> = { cup, shield, swab, breath, stopwatch, saliva, drop, gavel, magnifier };

/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Samples `n` points (normalised 0–1, interleaved x,y) from a shape's drawn alpha. */
export function samplePoints(shape: ShapeDef, n: number, seed = 7): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = BOX;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  shape.draw(ctx);
  const data = ctx.getImageData(0, 0, BOX, BOX).data;
  const candidates: number[] = [];
  for (let i = 0, p = 0; i < data.length; i += 4, p++) if (data[i + 3] > 8) candidates.push(p);
  const rnd = mulberry32(seed);
  const out = new Float32Array(n * 2);
  let k = 0;
  let guard = 0;
  while (k < n && guard < n * 60 && candidates.length) {
    guard++;
    const p = candidates[(rnd() * candidates.length) | 0];
    if (rnd() > data[p * 4 + 3] / 255) continue;
    out[k * 2] = ((p % BOX) + rnd()) / BOX;
    out[k * 2 + 1] = (Math.floor(p / BOX) + rnd()) / BOX;
    k++;
  }
  return out;
}

/** Per-point stagger and scatter used while morphing (stable across shapes). */
export function morphSeeds(n: number, seed = 11) {
  const rnd = mulberry32(seed);
  const delay = new Float32Array(n);
  const sx = new Float32Array(n);
  const sy = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    delay[i] = rnd();
    const a = rnd() * Math.PI * 2;
    const r = 0.02 + rnd() * 0.08;
    sx[i] = Math.cos(a) * r;
    sy[i] = Math.sin(a) * r;
  }
  return { delay, sx, sy };
}
