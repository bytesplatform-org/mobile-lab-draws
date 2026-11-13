/**
 * Photo plates in GL (lib/shaders/foundations): every photograph is drawn,
 * cropped to the plates' shape, into one atlas texture; one canvas draws all
 * the plates, re-reading each one's box every frame, so the GL follows the
 * DOM as it scrolls or is dragged. Only the plates inside the frame are drawn
 * (up to MAX_PLATES), so there can be more plates than slots, e.g. a looping
 * row of repeated photos; `srcOf` maps a plate to its photo. The DOM <img>s stay as the fallback (and
 * stay visible until the atlas is on the GPU).
 */

import * as THREE from "three";
import { compileMaterials, createShaderPass, createStage, type Stage } from "./engine";
import { foundationsFragment, MAX_PLATES } from "@/lib/shaders/foundations";

type Options = {
  /** the element the canvas covers (unskewed): plate boxes are read relative to it */
  frame: HTMLElement;
  plates: HTMLElement[];
  /** the distinct photographs, one atlas cell each */
  srcs: string[];
  /** which of `srcs` plate i shows (default: plate i shows srcs[i]) */
  srcOf?(i: number): number;
  /** plate height / width */
  aspect: number;
  /** strength per plate this frame, 0–1 (rest → developed) */
  show(i: number, dt: number): number;
  animate: boolean;
  radius: number;
  onReady(): void;
  onLost(): void;
  onRestored(): void;
};

const CELL_W = 360;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function createPlates(canvas: HTMLCanvasElement, o: Options): { stage: Stage; dispose(): void } | null {
  const n = o.srcs.length;
  const srcOf = o.srcOf ?? ((i: number) => i);
  const atlasCells = new Float32Array(n * 4);
  let ready = false;
  const stage = createStage(canvas, { dprCap: 1.5, animate: o.animate, onLost: o.onLost, onRestored: () => { if (ready) o.onRestored(); } });
  if (!stage) return null;

  const rects = new Float32Array(MAX_PLATES * 4);
  const cells = new Float32Array(MAX_PLATES * 4);
  const show = new Float32Array(MAX_PLATES);
  const uniforms = {
    uRadius: { value: o.radius },
    uReady: { value: 0 },
    uRects: { value: rects },
    uCells: { value: cells },
    uShow: { value: show },
    uCount: { value: 0 },
    uAtlas: { value: null as THREE.Texture | null },
  };
  const pass = createShaderPass(stage.shared, {
    fragmentShader: foundationsFragment,
    uniforms,
    update(dt) {
      if (!ready) return false;
      const fr = o.frame.getBoundingClientRect();
      uniforms.uRadius.value = o.radius * stage.pixelRatio();
      let k = 0;
      for (let i = 0; i < o.plates.length && k < MAX_PLATES; i++) {
        const r = o.plates[i].getBoundingClientRect();
        if (r.right < fr.left || r.left > fr.right) continue;
        const c = srcOf(i) * 4;
        rects.set([(r.left - fr.left) / fr.width, (r.top - fr.top) / fr.height, (r.right - fr.left) / fr.width, (r.bottom - fr.top) / fr.height], k * 4);
        cells.set(atlasCells.subarray(c, c + 4), k * 4);
        show[k] = o.show(i, dt);
        k++;
      }
      uniforms.uCount.value = k;
    },
  });
  if (!compileMaterials(stage.renderer, [pass.material])) {
    pass.dispose();
    stage.dispose();
    return null;
  }
  stage.add(pass);

  let disposed = false;
  let texture: THREE.CanvasTexture | null = null;
  const cw = CELL_W;
  const ch = Math.round(CELL_W * o.aspect);
  const cols = Math.min(4, n);
  const rows = Math.ceil(n / cols);
  Promise.all(o.srcs.map(src => loadImage(src).catch(() => null))).then(imgs => {
    if (disposed) return;
    const atlas = document.createElement("canvas");
    atlas.width = cols * cw;
    atlas.height = rows * ch;
    const ctx = atlas.getContext("2d")!;
    imgs.forEach((img, i) => {
      const x = (i % cols) * cw;
      const y = Math.floor(i / cols) * ch;
      atlasCells.set([x / atlas.width, y / atlas.height, cw / atlas.width, ch / atlas.height], i * 4);
      if (!img) return;
      // object-fit: cover, cropped from the source so nothing spills into the next cell
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const sw = cw / s;
      const sh = ch / s;
      ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, cw, ch);
    });
    texture = new THREE.CanvasTexture(atlas);
    texture.flipY = false;
    texture.colorSpace = THREE.NoColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    uniforms.uAtlas.value = texture;
    uniforms.uReady.value = 1;
    ready = true;
    o.onReady();
    if (!o.animate) stage.renderOnce(0);
  });

  return {
    stage,
    dispose() {
      disposed = true;
      texture?.dispose();
      stage.dispose();
    },
  };
}
