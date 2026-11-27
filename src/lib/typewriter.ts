/**
 * Shows an answer as if it is being typed: the text that has arrived is
 * revealed at a steady pace, a few characters at a time, word by word.
 *
 * The answer streams from the backend in uneven bursts (and arrives whole
 * when the stream falls back), so revealing it directly makes text jump.
 * The pace speeds up when a lot is waiting, so the display is never more than
 * about two seconds behind what has arrived. In a background tab, or for
 * people who ask for reduced motion, the text is shown at once.
 */
export interface Typewriter {
  /** The full text received so far (not a piece). */
  push(text: string): void;
  /** No more text is coming; resolves once everything is on screen. */
  finish(): Promise<void>;
  /** Show everything now (errors, limits, cancel). */
  flush(): void;
  /** What is on screen right now. */
  readonly shown: string;
}

const BASE_CHARS_PER_SEC = 70; // an easy reading pace
const MAX_LAG_SEC = 2; // never further behind than this
const FRAME_MS = 32;

export function createTypewriter(render: (text: string) => void): Typewriter {
  let target = "";
  let count = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let last = 0;
  let finishing = false;
  let resolveDone: (() => void) | null = null;
  const done = new Promise<void>((r) => (resolveDone = r));

  const instant = () =>
    (typeof document !== "undefined" && document.hidden) ||
    (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  const settle = () => {
    if (finishing && count >= target.length) {
      stop();
      resolveDone?.();
    }
  };

  const tick = () => {
    const now = Date.now();
    const dt = Math.min(250, now - last) / 1000;
    last = now;
    if (instant()) {
      count = target.length;
    } else {
      const waiting = target.length - count;
      const speed = Math.max(BASE_CHARS_PER_SEC, waiting / MAX_LAG_SEC);
      let next = Math.min(target.length, count + Math.max(1, Math.round(speed * dt)));
      // End on a word boundary when one is close, so words appear whole.
      const space = target.slice(next, next + 12).search(/\s/);
      if (space > 0) next += space;
      count = Math.min(target.length, next);
    }
    render(target.slice(0, count));
    if (count >= target.length) {
      stop();
      settle();
    }
  };

  const start = () => {
    if (timer) return;
    last = Date.now();
    timer = setInterval(tick, FRAME_MS);
  };

  return {
    push(text: string) {
      // Text that doesn't continue what came before replaced it (a limit or
      // error message): type it from the start.
      if (!text.startsWith(target)) count = 0;
      target = text;
      if (count < target.length) start();
    },
    finish() {
      finishing = true;
      if (count >= target.length) {
        stop();
        resolveDone?.();
      }
      return done;
    },
    flush() {
      stop();
      count = target.length;
      render(target);
      finishing = true;
      resolveDone?.();
    },
    get shown() {
      return target.slice(0, count);
    },
  };
}
