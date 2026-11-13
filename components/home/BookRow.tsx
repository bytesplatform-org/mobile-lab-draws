"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScrollTrigger } from "@/lib/animation/gsap";
import type { Cap } from "@/lib/content/site";

/**
 * One service row (Blueprint's ProgramRow): the header is the toggle, and
 * the detail opens by animating grid-template-rows 0fr → 1fr. The page height
 * changes, so ScrollTrigger re-measures once the transition is done.
 */
export default function BookRow({
  id,
  tabs,
  minutes,
  cap,
  head,
  children,
}: {
  id: string;
  tabs: number[];
  minutes: number | null;
  cap: Cap;
  head: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const toggle = () => {
    setOpen(o => !o);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => ScrollTrigger.refresh(), 600);
  };

  return (
    <div className="bk-row" data-row data-tabs={tabs.join(" ")} data-minutes={minutes ?? undefined} data-cap={cap}>
      <button type="button" className="bk-btn" aria-expanded={open} aria-controls={id} onClick={toggle}>
        {head}
      </button>
      <div className="bk-detail" id={id}>
        <div>{children}</div>
      </div>
    </div>
  );
}
