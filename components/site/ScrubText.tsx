"use client";

import { Fragment, useEffect, useRef, type ElementType } from "react";
import { gsap } from "@/lib/animation/gsap";
import { motionAllowed } from "@/lib/animation/motion";

/** dim words, before the reading head reaches them */
const DIM = 0.16;
/** how many words the head's soft edge spans */
const EDGE = 4;

const bare = (w: string) => w.replace(/[.,;:!?]+$/, "");

/** Marks the words of each phrase in `lit` (whole-word runs, trailing punctuation ignored). */
function hiWords(words: string[], lit: string[]) {
  const hi = new Set<number>();
  for (const phrase of lit) {
    const run = phrase.split(/\s+/).map(bare);
    for (let i = 0; i + run.length <= words.length; i++) {
      if (run.every((w, k) => bare(words[i + k]) === w)) run.forEach((_, k) => hi.add(i + k));
    }
  }
  return hi;
}

/**
 * A paragraph read in as you scroll (Blueprint): a reading head runs through
 * the words in order, and each comes up from dim to full ink as it passes.
 * Words of the `lit` phrases also turn teal as the head reaches them. Every
 * word's state is computed from the (smoothed) scroll progress, so scrolling
 * back dims it again. Without motion it is a plain paragraph, lit phrases in
 * teal.
 */
export default function ScrubText({
  text,
  className,
  lit = [],
  as = "p",
  start = "top 82%",
  end = "bottom 52%",
}: {
  text: string;
  className?: string;
  lit?: string[];
  as?: ElementType;
  start?: string;
  end?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as;

  useEffect(() => {
    const p = ref.current;
    if (!p || !motionAllowed()) return;
    const words = [...p.querySelectorAll<HTMLElement>("[data-w]")];
    const n = words.length;
    p.classList.add("is-scrub");
    const apply = (progress: number) => {
      const head = progress * (n + EDGE);
      words.forEach((w, i) => {
        const lit = Math.min(1, Math.max(0, (head - i) / EDGE));
        w.style.opacity = (DIM + (1 - DIM) * lit).toFixed(3);
        if (w.hasAttribute("data-hi")) w.classList.toggle("is-lit", lit > 0.55);
      });
    };
    apply(0);
    const state = { p: 0 };
    const tween = gsap.to(state, {
      p: 1,
      ease: "none",
      onUpdate: () => apply(state.p),
      scrollTrigger: { trigger: p, start, end, scrub: 0.5, invalidateOnRefresh: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      p.classList.remove("is-scrub");
      words.forEach(w => {
        w.style.removeProperty("opacity");
        w.classList.remove("is-lit");
      });
    };
  }, [start, end]);

  const words = text.split(/\s+/);
  const hi = hiWords(words, lit);
  return (
    <Tag className={className} ref={ref}>
      {words.map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span data-w="" data-hi={hi.has(i) ? "" : undefined}>{w}</span>
        </Fragment>
      ))}
    </Tag>
  );
}
