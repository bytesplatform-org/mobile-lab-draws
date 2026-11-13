"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Flip, gsap, ScrollTrigger, MQ } from "@/lib/animation/gsap";
import { glideTo } from "@/lib/animation/scroll";
import { motionAllowed } from "@/lib/animation/motion";
import { book } from "@/lib/content/site";

const MAX = book.axisMax;
/** Scroll the stage stays pinned for while the clock runs, in viewport heights. */
const PIN_VH = 2.4;
const timed = book.items.filter(i => i.minutes);

/** 25 → "0:25", 240 → "4:00". */
const clock = (m: number) => `${Math.floor(m / 60)}:${String(Math.floor(m % 60)).padStart(2, "0")}`;

/**
 * The menu as a scroll story (Blueprint's ProgramsStory): a teal playhead
 * sweeps the 0 → 4 hr axis; each service's bar fills as the playhead passes;
 * the readout shows the elapsed time and which appointments fit in it.
 * Pinned when the board fits on screen (desktop), else scrubbed in place;
 * on phones and tablets the clock plays once as the board enters. Without motion: the
 * full board.
 *
 * The filter tabs are a real tablist; picking one filters the rows with a
 * FLIP. TODO(client): which card belongs to which tab is a guess (content file).
 */
export default function BookStory({ head, children }: { head: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState(0);
  const [minutes, setMinutes] = useState(MAX);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // ---- the clock
  useEffect(() => {
    const inner = ref.current;
    const stage = inner?.parentElement;
    if (!inner || !stage) return;
    const schedule = stage.querySelector<HTMLElement>("[data-schedule]");
    const axis = stage.querySelector<HTMLElement>("[data-axis]");
    if (!schedule || !axis) return;
    if (!motionAllowed()) return;
    const rows = [...stage.querySelectorAll<HTMLElement>("[data-row]")];

    const measure = () => {
      const s = inner.getBoundingClientRect();
      const a = axis.getBoundingClientRect();
      const sc = schedule.getBoundingClientRect();
      inner.style.setProperty("--wl", `${a.left - s.left}px`);
      inner.style.setProperty("--ww", `${a.width}px`);
      inner.style.setProperty("--st", `${sc.top - s.top}px`);
      inner.style.setProperty("--sh", `${sc.height}px`);
    };
    let last = -1;
    const apply = (ph: number) => {
      measure();
      inner.style.setProperty("--ph", ph.toFixed(4));
      const m = ph * MAX;
      rows.forEach(r => {
        const mins = Number(r.dataset.minutes);
        if (!mins) return;
        const f = Math.min(1, Math.max(0, m / mins));
        r.style.setProperty("--fill", f.toFixed(4));
        r.classList.toggle("live", f > 0 && f < 1);
        r.classList.toggle("done", f >= 1);
      });
      const rounded = Math.round(m);
      if (rounded !== last) {
        last = rounded;
        setMinutes(rounded);
      }
    };

    stage.classList.add("is-story");
    const state = { ph: 0 };
    const mm = gsap.matchMedia();
    mm.add(MQ.story, () => {
      const fits = stage.offsetHeight <= window.innerHeight;
      const tween = gsap.to(state, {
        ph: 1,
        ease: "none",
        onUpdate: () => apply(state.ph),
        scrollTrigger: fits
          ? { trigger: stage, start: "top top", end: () => `+=${window.innerHeight * PIN_VH}`, pin: true, scrub: 0.6, invalidateOnRefresh: true }
          : { trigger: schedule, start: "top 75%", end: "bottom 45%", scrub: 0.6, invalidateOnRefresh: true },
      });
      apply(0);
      ScrollTrigger.sort();
      ScrollTrigger.refresh();

      // Opening a row mid-story: play out the clock (and unpin) first.
      let bypass = false;
      const onClick = (e: MouseEvent) => {
        const btn = (e.target as Element | null)?.closest<HTMLButtonElement>(".bk-btn");
        const st = tween.scrollTrigger;
        if (!btn || bypass || !st || !fits || window.scrollY >= st.end - 2) return;
        e.preventDefault();
        e.stopPropagation();
        glideTo(st.end + 4, 0.9);
        window.setTimeout(() => {
          bypass = true;
          btn.click();
          bypass = false;
        }, 950);
      };
      stage.addEventListener("click", onClick, true);
      return () => {
        stage.removeEventListener("click", onClick, true);
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    mm.add(MQ.flow, () => {
      apply(0);
      const tween = gsap.to(state, {
        ph: 1,
        duration: 2.6,
        ease: "power1.inOut",
        paused: true,
        onUpdate: () => apply(state.ph),
      });
      const st = ScrollTrigger.create({ trigger: schedule, start: "top 70%", once: true, onEnter: () => tween.play() });
      return () => {
        st.kill();
        tween.kill();
      };
    });
    const ro = new ResizeObserver(() => measure());
    ro.observe(schedule);
    return () => {
      ro.disconnect();
      mm.revert();
      stage.classList.remove("is-story");
      rows.forEach(r => {
        r.classList.remove("live", "done");
        r.style.removeProperty("--fill");
      });
      setMinutes(MAX);
    };
  }, []);

  // ---- the filter, with a FLIP
  const pick = (next: number) => {
    if (next === tab) return;
    const stage = ref.current?.parentElement;
    const rows = stage ? [...stage.querySelectorAll<HTMLElement>("[data-row]")] : [];
    const motion = motionAllowed();
    const state = motion ? Flip.getState(rows) : null;
    rows.forEach(r => { r.hidden = !r.dataset.tabs?.split(" ").includes(String(next)); });
    if (state) {
      Flip.from(state, {
        duration: 0.6,
        ease: "power3.inOut",
        absolute: true,
        onEnter: els => gsap.fromTo(els, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.15 }),
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

  const fitting = timed.filter(i => (i.minutes ?? 0) <= minutes);

  return (
    <div className="bk-stage">
      {/* Inner wrapper: the next sheet's parallax moves this, never the pinned stage. */}
      <div className="bk-inner" ref={ref} data-parallax>
        <div className="wrap">
          <div className="bk-top">
            {head}
            <div className="bk-readout" aria-live="polite">
              <p className="bk-time">
                {clock(minutes)} <span className="mono">{book.readout}</span>
              </p>
              <ul>
                {timed.map(i => {
                  const fits = fitting.includes(i);
                  return (
                    <li key={i.id} data-cap={i.cap} className={fits ? "fit" : undefined}>
                      <span className="cap-dot" aria-hidden="true" />
                      <span>{i.name}</span>
                      <span className="mono">{i.duration}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="bk-tabs" role="tablist" aria-label={book.label} onKeyDown={onKey}>
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
          <div role="tabpanel" id="bk-panel" aria-labelledby={`bk-tab-${tab}`}>
            {children}
          </div>
        </div>
        <div className="bk-grid" aria-hidden="true">
          {book.ticks.map(t => <i key={t.at} style={{ "--at": t.at / MAX } as CSSProperties} />)}
        </div>
        <div className="bk-playhead" aria-hidden="true">
          <span className="mono">{clock(minutes)}</span>
        </div>
      </div>
    </div>
  );
}
