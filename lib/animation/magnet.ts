import { gsap } from "./gsap";
import { motionAllowed } from "./motion";

/**
 * Magnetic buttons (FernGrid's closing CTA): every [data-magnet] inside
 * `root` leans toward the pointer while it's near, and springs back when it
 * leaves. Fine pointers with motion only. Returns the teardown.
 */
export function bindMagnets(root: HTMLElement, pull = { x: 0.32, y: 0.4 }): () => void {
  if (!motionAllowed() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
  const magnets = [...root.querySelectorAll<HTMLElement>("[data-magnet]")].map(el => ({
    el,
    x: gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" }),
    y: gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" }),
  }));
  if (!magnets.length) return () => {};
  const move = (e: PointerEvent) => {
    for (const m of magnets) {
      const b = m.el.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2);
      const dy = e.clientY - (b.top + b.height / 2);
      const near = Math.abs(dx) < b.width / 2 + 50 && Math.abs(dy) < b.height / 2 + 40;
      m.x(near ? dx * pull.x : 0);
      m.y(near ? dy * pull.y : 0);
    }
  };
  const leave = () => magnets.forEach(m => (m.x(0), m.y(0)));
  root.addEventListener("pointermove", move);
  root.addEventListener("pointerleave", leave);
  return () => {
    root.removeEventListener("pointermove", move);
    root.removeEventListener("pointerleave", leave);
    magnets.forEach(m => gsap.killTweensOf(m.el));
    gsap.set(magnets.map(m => m.el), { clearProps: "transform" });
  };
}
