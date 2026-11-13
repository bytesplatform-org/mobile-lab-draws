/**
 * One shared intro timeline (after FernGrid's motion/intro.ts).
 *
 * Components register their entrance with onIntro(fn). When the loader lifts
 * it builds ONE timeline and hands it to every registered entrance, so the
 * hero, nav and buttons are choreographed with the loader's exit on a single
 * clock. Registering after that (the page has already booted) returns false
 * and does nothing: those elements are simply visible.
 */
type Entrance = (tl: gsap.core.Timeline) => void;

const entrances = new Set<Entrance>();
let played = false;

/** Registers an entrance; returns the unregister. Does nothing once the intro has played. */
export function onIntro(fn: Entrance): () => void {
  if (played) return () => {};
  entrances.add(fn);
  return () => { entrances.delete(fn); };
}

/** Called by the loader: adds every registered entrance to its exit timeline. */
export function playIntro(tl: gsap.core.Timeline) {
  if (played) return;
  played = true;
  entrances.forEach(fn => {
    try {
      fn(tl);
    } catch (error) {
      console.error(error);
    }
  });
  entrances.clear();
}

/** True while the loader still covers the page. */
export function introPending() {
  return !played;
}
