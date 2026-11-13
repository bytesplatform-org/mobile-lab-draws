"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Image from "next/image";
import { Flip, gsap, ScrollTrigger, MQ } from "@/lib/animation/gsap";
import { motionAllowed } from "@/lib/animation/motion";
import { book } from "@/lib/content/site";

/**
 * The service menu's behaviour.
 * - The filter tabs are a real tablist (arrow keys, Home, End); picking one
 *   filters the rows with a FLIP. TODO(client): which service belongs to
 *   which tab is a guess (content file).
 * - Fine pointers with motion: over a row, that service's photograph peeks
 *   out beside the pointer, following it and tilting with its speed.
 */
export default function BookMenu({ head, children }: { head: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // ---- the photo peek
  useEffect(() => {
    const root = ref.current;
    const list = root?.querySelector<HTMLElement>("[data-list]");
    const peek = root?.querySelector<HTMLElement>("[data-peek-card]");
    if (!root || !list || !peek || !motionAllowed()) return;
    const mm = gsap.matchMedia();
    mm.add(MQ.fine, () => {
      const shots = [...peek.querySelectorAll<HTMLElement>("[data-shot]")];
      const x = gsap.quickTo(peek, "x", { duration: 0.6, ease: "power3.out" });
      const y = gsap.quickTo(peek, "y", { duration: 0.6, ease: "power3.out" });
      const rot = gsap.quickTo(peek, "rotation", { duration: 0.8, ease: "power3.out" });
      let lastX = 0;
      let shown = -1;
      const show = (i: number) => {
        if (i === shown) return;
        shown = i;
        shots.forEach(s => s.classList.toggle("on", Number(s.dataset.shot) === i));
        gsap.to(peek, { autoAlpha: i >= 0 ? 1 : 0, scale: i >= 0 ? 1 : 0.85, duration: 0.35, ease: "power3.out", overwrite: "auto" });
      };
      const move = (e: PointerEvent) => {
        const r = list.getBoundingClientRect();
        const px = e.clientX - r.left;
        const py = e.clientY - r.top;
        x(px + 28);
        y(py - peek.offsetHeight / 2);
        rot(gsap.utils.clamp(-10, 10, (e.clientX - lastX) * 0.6));
        lastX = e.clientX;
        const row = (e.target as Element | null)?.closest<HTMLElement>("[data-row]");
        show(row?.dataset.peek ? Number(row.dataset.peek) : -1);
      };
      const leave = () => show(-1);
      gsap.set(peek, { autoAlpha: 0, scale: 0.85 });
      list.addEventListener("pointermove", move);
      list.addEventListener("pointerleave", leave);
      return () => {
        list.removeEventListener("pointermove", move);
        list.removeEventListener("pointerleave", leave);
      };
    });
    return () => mm.revert();
  }, []);

  // ---- the filter, with a FLIP
  const pick = (next: number) => {
    if (next === tab) return;
    const rows = [...(ref.current?.querySelectorAll<HTMLElement>("[data-row]") ?? [])];
    const state = motionAllowed() ? Flip.getState(rows) : null;
    rows.forEach(r => { r.hidden = !r.dataset.tabs?.split(" ").includes(String(next)); });
    if (state) {
      Flip.from(state, {
        duration: 0.6,
        ease: "power3.inOut",
        absolute: true,
        onEnter: els => gsap.fromTo(els, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.15 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    } else ScrollTrigger.refresh();
    setTab(next);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = book.tabs.length;
    const moves: Record<string, number> = { ArrowRight: tab + 1, ArrowLeft: tab - 1 + n, Home: 0, End: n - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const next = moves[e.key] % n;
    pick(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="mn" ref={ref}>
      <div className="mn-head">
        {head}
        <div className="mn-tabs" role="tablist" aria-label={book.label} onKeyDown={onKey}>
          {book.tabs.map((t, i) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`bk-tab-${i}`}
              aria-selected={tab === i}
              aria-controls="bk-panel"
              tabIndex={tab === i ? 0 : -1}
              onClick={() => pick(i)}
              ref={el => { tabRefs.current[i] = el; }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="mn-panel" role="tabpanel" id="bk-panel" aria-labelledby={`bk-tab-${tab}`}>
        <ul className="mn-list" data-list>
          {children}
        </ul>
        <div className="mn-peek" data-peek-card aria-hidden="true">
          {book.items.map((item, i) =>
            item.image ? (
              <span className="mn-shot" data-shot={i} key={item.id}>
                <Image src={item.image.src} alt="" fill sizes="300px" />
              </span>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}
