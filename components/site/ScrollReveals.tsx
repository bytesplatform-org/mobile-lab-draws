"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/animation/gsap";
import { motionAllowed } from "@/lib/animation/motion";
import { onBootDone } from "@/lib/boot";

/**
 * Scroll-scrubbed reveals (Blueprint), with FernGrid's line masks folded in.
 * After boot, arms the reveals (html.armed) and ties each [data-reveal]
 * element's --rv (0 → 1) to its own scroll range: from when its top enters at
 * 94 % of the viewport to when it reaches 62 %. The CSS turns --rv into each
 * variant (mask, lines, sweep, rule, settle), so scrolling back plays a reveal
 * in reverse and scrolling down again replays it.
 *
 * "lines" splits its text into lines with SplitText (re-split on resize and
 * font load), each in a mask with room for ascenders and descenders, and
 * numbers them (--i) so they rise in a stagger. "mask" is the same for
 * headings set over explicit lines (MaskLines).
 *
 * The hidden states exist only under html.armed: without JS, or with reduced
 * motion, everything is visible.
 */
export default function ScrollReveals() {
  useEffect(() => {
    if (!motionAllowed()) return;
    let ctx: gsap.Context | null = null;
    const splits: SplitText[] = [];
    const off = onBootDone(() => {
      document.documentElement.classList.add("armed");
      ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>("[data-reveal='lines']").forEach(el => {
          splits.push(
            SplitText.create(el, {
              type: "lines",
              mask: "lines",
              linesClass: "rv-line",
              autoSplit: true,
              onSplit: self => {
                self.masks.forEach(m => m.classList.add("rv-mask"));
                self.lines.forEach((line, i) => (line as HTMLElement).style.setProperty("--i", String(i)));
              },
            }),
          );
        });
        document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(el => {
          gsap.fromTo(
            el,
            { "--rv": 0 },
            {
              "--rv": 1,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 94%", end: "top 62%", scrub: 0.6, invalidateOnRefresh: true },
            },
          );
        });
      });
      ScrollTrigger.sort();
    });
    return () => {
      off();
      ctx?.revert();
      splits.forEach(s => s.revert());
    };
  }, []);

  return null;
}
