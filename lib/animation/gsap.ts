/**
 * The one place GSAP plugins are registered (after FernGrid's
 * motion/gsap.ts). Every animated module imports gsap / ScrollTrigger /
 * SplitText / Flip / useGSAP from here, never from "gsap" directly.
 * (SplitText and Flip ship free with gsap ≥ 3.13.)
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);
}

/** Media queries shared by the animated sections. */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  /**
   * The pinned, scroll-scrubbed stories run on large screens with a fine
   * pointer only (and only with motion, see motionAllowed()); phones and
   * tablets get the lighter enter-on-scroll flow instead.
   */
  story: "(min-width: 1025px) and (hover: hover) and (pointer: fine)",
  flow: "(max-width: 1024px), (hover: none), (pointer: coarse)",
  fine: "(hover: hover) and (pointer: fine)",
} as const;

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
