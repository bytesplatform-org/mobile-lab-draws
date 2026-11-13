"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { motionAllowed } from "@/lib/animation/motion";
import { compileMaterials, createShaderPass, createStage } from "@/lib/gl/engine";
import { credentialSealFragment } from "@/lib/shaders/credentialSeal";
import { CROSS, HEART } from "@/components/site/Mark";

/** Ring radius in the 1000-unit viewBox; the SVG is 86 % of the plate's height. */
const R = 448;
const CIRC = 2 * Math.PI * R;

/**
 * The credential seal (Blueprint's): GL guilloche on teal-silver foil
 * (lib/shaders/credentialSeal), the legal name set on a ring around the
 * medallion and the heart-cross mark at its centre. The pointer is the light
 * the engraving catches; without one the light drifts on its own. The seal
 * draws itself in as it scrolls into view. Reduced motion: one fully drawn
 * frame. Without WebGL: the ring and mark over the plain plate.
 */
export default function CredentialSeal({ ring, tags }: { ring: string; tags: string[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const motion = motionAllowed();
    const stage = createStage(canvas, { dprCap: 1.5, scale: 0.85, animate: motion });
    if (!stage) return;

    const light = new THREE.Vector2(0.2, 0.15);
    const target = new THREE.Vector2();
    let amount = 0.55;
    let pointer: [number, number] | null = null;
    const uniforms = {
      uLight: { value: light },
      uLightAmt: { value: amount },
      uDraw: { value: motion ? 0 : 1 },
    };
    const pass = createShaderPass(stage.shared, {
      fragmentShader: credentialSealFragment,
      uniforms,
      update(dt) {
        const t = stage.shared.uTime.value;
        const aspect = canvas.width / Math.max(canvas.height, 1);
        if (pointer) target.set(pointer[0], pointer[1]);
        else target.set(0.55 * aspect * 0.5 * Math.sin(t * 0.25), 0.32 * Math.sin(t * 0.37 + 1));
        const k = 1 - Math.pow(0.02, dt);
        light.lerp(target, dt > 0 ? k : 1);
        amount += ((pointer ? 1 : 0.55) - amount) * k;
        uniforms.uLightAmt.value = amount;
        if (motion) {
          const r = box.getBoundingClientRect();
          const vh = window.innerHeight;
          uniforms.uDraw.value = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.55)));
        }
      },
    });
    if (!compileMaterials(stage.renderer, [pass.material])) {
      pass.dispose();
      stage.dispose();
      return;
    }
    stage.add(pass);
    box.setAttribute("data-gl", "");

    const move = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      pointer = [((e.clientX - r.left) / r.width - 0.5) * (r.width / r.height), 0.5 - (e.clientY - r.top) / r.height];
    };
    const leave = () => { pointer = null; };
    box.addEventListener("pointermove", move);
    box.addEventListener("pointerleave", leave);
    if (!motion) stage.renderOnce(0.5);

    return () => {
      box.removeEventListener("pointermove", move);
      box.removeEventListener("pointerleave", leave);
      box.removeAttribute("data-gl");
      stage.dispose();
    };
  }, []);

  return (
    <div className="seal-box" ref={boxRef} data-reveal="sweep">
      <canvas ref={canvasRef} aria-hidden="true" />
      <svg className="seal-ring" viewBox="0 0 1000 1000" aria-hidden="true">
        <defs>
          <path id="seal-ring-path" d={`M 500 ${500 - R} a ${R} ${R} 0 1 1 -0.01 0`} fill="none" />
        </defs>
        <g className="seal-ring-spin">
          <text className="seal-ring-text">
            <textPath href="#seal-ring-path" textLength={CIRC} lengthAdjust="spacing">
              {ring}
            </textPath>
          </text>
        </g>
        <g className="seal-mark" transform="translate(436 436) scale(2)">
          <path className="mark-heart" d={HEART} />
          <path className="mark-cross" d={CROSS} />
        </g>
      </svg>
      <div className="seal-tags mono" aria-hidden="true">
        {tags.map(tag => <span key={tag}>{tag}</span>)}
      </div>
    </div>
  );
}
