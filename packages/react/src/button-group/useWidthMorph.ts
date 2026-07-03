"use client";
import * as React from "react";

// MDC: pressed button grows 15% of its width; immediate neighbors absorb it
// (half each, or all of it with a single neighbor). Standard groups only.
const WIDTH_CHANGE = 0.15;
// MD3 expressive fast-spatial spring (button groups are an expressive component;
// MDC's expressive theme resolves motionSpringFastSpatial to 800 / 0.6). The 0.6
// damping gives a visible overshoot bounce — key for middle presses, where growth
// splits across both edges and each moves at half the speed of an edge press.
const STIFFNESS = 800;
const DAMPING = 2 * 0.6 * Math.sqrt(STIFFNESS);
// Like the ripple, a quick tap still plays the press morph before contracting —
// otherwise most of the squish lands after pointerup and reads as lag.
const MIN_PRESS_MS = 150;

interface Spring {
  /** Unanimated width — offsetWidth lies while an inline width is applied. */
  natural: number;
  current: number;
  velocity: number;
  target: number;
  /** Press generation — a deferred release only retargets its own press. */
  press?: number;
}

/**
 * Press width morph as a rAF spring integrator, mirroring MDC's SpringAnimation.
 * Springs retarget with velocity carried over, so releasing or re-pressing
 * mid-flight never has a velocity jump (a reversed keyframe animation does).
 * Inline widths also leave the buttons' own CSS transitions untouched.
 */
export function useWidthMorph(enabled: boolean) {
  const springsRef = React.useRef<Map<HTMLElement, Spring>>(new Map());
  const loopRef = React.useRef({ raf: 0, last: 0 });
  const pressIdRef = React.useRef(0);
  const timeoutsRef = React.useRef<Set<number>>(new Set());

  React.useEffect(() => {
    const loop = loopRef.current;
    const springs = springsRef.current;
    const timeouts = timeoutsRef.current;
    return () => {
      cancelAnimationFrame(loop.raf);
      for (const id of timeouts) clearTimeout(id);
      timeouts.clear();
      springs.clear();
    };
  }, []);

  const tick = (now: number) => {
    const loop = loopRef.current;
    // Clamp dt: a background tab's huge gap would explode the integration.
    const dt = Math.min(now - loop.last, 32) / 1000;
    loop.last = now;
    let moving = false;

    for (const [el, s] of springsRef.current) {
      s.velocity += (-STIFFNESS * (s.current - s.target) - DAMPING * s.velocity) * dt;
      s.current += s.velocity * dt;
      if (Math.abs(s.current - s.target) < 0.1 && Math.abs(s.velocity) < 2) {
        s.current = s.target;
        s.velocity = 0;
        if (s.target === s.natural) {
          // Settled back at rest: hand width back to CSS.
          el.style.width = "";
          springsRef.current.delete(el);
          continue;
        }
      } else {
        moving = true;
      }
      el.style.width = `${s.current}px`;
    }
    loop.raf = moving ? requestAnimationFrame(tick) : 0;
  };

  const ensureLoop = () => {
    const loop = loopRef.current;
    if (!loop.raf) {
      loop.last = performance.now();
      loop.raf = requestAnimationFrame(tick);
    }
  };

  return (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || event.button !== 0) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = event.currentTarget;
    const children = Array.from(root.children) as HTMLElement[];
    const pressed = children.find((child) => child.contains(event.target as Node));
    if (!pressed) return;

    const index = children.indexOf(pressed);
    const neighbors = [children[index - 1], children[index + 1]].filter(
      (n): n is HTMLElement => n !== undefined,
    );
    if (neighbors.length === 0) return;

    const springs = springsRef.current;
    const springFor = (el: HTMLElement): Spring => {
      let s = springs.get(el);
      if (!s) {
        // getBoundingClientRect: fractional, unlike offsetWidth's integer rounding.
        const w = el.getBoundingClientRect().width;
        s = { natural: w, current: w, velocity: 0, target: w };
        springs.set(el, s);
      }
      return s;
    };

    const pressId = ++pressIdRef.current;
    const pressedAt = performance.now();
    const pressedSpring = springFor(pressed);
    pressedSpring.target = pressedSpring.natural * (1 + WIDTH_CHANGE);
    pressedSpring.press = pressId;
    const share = (pressedSpring.natural * WIDTH_CHANGE) / neighbors.length;
    for (const neighbor of neighbors) {
      const s = springFor(neighbor);
      s.target = s.natural - share;
      s.press = pressId;
    }
    ensureLoop();

    const ac = new AbortController();
    const release = () => {
      ac.abort();
      const retarget = () => {
        for (const el of [pressed, ...neighbors]) {
          const s = springs.get(el);
          // Skip springs a newer press has claimed since.
          if (s && s.press === pressId) s.target = s.natural;
        }
        ensureLoop();
      };
      const remaining = MIN_PRESS_MS - (performance.now() - pressedAt);
      if (remaining > 0) {
        const id = window.setTimeout(() => {
          timeoutsRef.current.delete(id);
          retarget();
        }, remaining);
        timeoutsRef.current.add(id);
      } else {
        retarget();
      }
    };
    window.addEventListener("pointerup", release, { signal: ac.signal });
    window.addEventListener("pointercancel", release, { signal: ac.signal });
  };
}
