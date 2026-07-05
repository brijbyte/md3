"use client";
import * as React from "react";
import {
  DETERMINATE_MORPH,
  GLOBAL_ROTATION_DURATION_MS,
  INDETERMINATE_MORPHS,
  MORPH_INTERVAL_MS,
  type Morph,
} from "../generated/loading-indicator-shapes";
import styles from "./LoadingIndicator.module.css";

export interface LoadingIndicatorProps extends React.ComponentPropsWithoutRef<"span"> {
  /** 0-1. Omit for the indeterminate (looping) animation. */
  progress?: number;
  /** Contained variant: shape sits inside a colored pill container. */
  contained?: boolean;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Bakes a Morph + progress (per-control-point lerp, matching Morph.asCubics)
// into an SVG path `d`. Precomputed morphs already close exactly at every
// integer progress (see build-loading-indicator-shapes.mjs), so a plain lerp
// + Z close needs no extra seam-snapping.
function morphPathD(morph: Morph, t: number): string {
  const [firstStart, firstEnd] = morph[0];
  let d = `M${lerp(firstStart[0], firstEnd[0], t)},${lerp(firstStart[1], firstEnd[1], t)}`;
  for (const [cs, ce] of morph) {
    d += `C${lerp(cs[2], ce[2], t)},${lerp(cs[3], ce[3], t)} ${lerp(cs[4], ce[4], t)},${lerp(cs[5], ce[5], t)} ${lerp(cs[6], ce[6], t)},${lerp(cs[7], ce[7], t)}`;
  }
  return `${d}Z`;
}

// Compose's spring(dampingRatio=0.6, stiffness=200) step response — critically
// close to settling (within its 0.1 visibilityThreshold) by ~300ms, well under
// the 650ms step interval, so sampling it over real elapsed time (rather than
// a normalized 0-1 progress) reproduces the same "morph, slight overshoot,
// brief hold" cadence as the real component.
function springValue(elapsedMs: number): number {
  const t = elapsedMs / 1000;
  const omega = Math.sqrt(200);
  const zeta = 0.6;
  const omegaD = omega * Math.sqrt(1 - zeta * zeta);
  const decay = Math.exp(-zeta * omega * t);
  return 1 - decay * (Math.cos(omegaD * t) + ((zeta * omega) / omegaD) * Math.sin(omegaD * t));
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export const LoadingIndicator = React.forwardRef<HTMLSpanElement, LoadingIndicatorProps>(
  function LoadingIndicator(props, ref) {
    const { className, progress, contained, "aria-label": ariaLabel, ...rest } = props;
    const pathRef = React.useRef<SVGPathElement>(null);
    const groupRef = React.useRef<SVGGElement>(null);
    const reducedMotion = usePrefersReducedMotion();
    const determinate = progress != null;
    const clampedProgress = determinate ? Math.min(1, Math.max(0, progress)) : undefined;

    React.useEffect(() => {
      const path = pathRef.current;
      const group = groupRef.current;
      if (!path || !group) return;

      if (clampedProgress != null) {
        const t = clampedProgress === 1 ? 1 : clampedProgress % 1;
        path.setAttribute("d", morphPathD(DETERMINATE_MORPH, t));
        group.style.transform = `rotate(${-clampedProgress * 180}deg)`;
        return;
      }

      if (reducedMotion) {
        path.setAttribute("d", morphPathD(INDETERMINATE_MORPHS[0], 1));
        group.style.transform = "rotate(0deg)";
        return;
      }

      let raf = 0;
      let cancelled = false;
      let morphIndex = 0;
      let stepStart = performance.now();
      let rotationTarget = 0;
      const startTime = stepStart;

      function frame(now: number) {
        const stepElapsed = now - stepStart;
        const eased = springValue(stepElapsed);
        const globalRotation = ((now - startTime) / GLOBAL_ROTATION_DURATION_MS) * 360;
        const totalRotation = eased * 90 + rotationTarget + globalRotation;
        path!.setAttribute("d", morphPathD(INDETERMINATE_MORPHS[morphIndex], eased));
        group!.style.transform = `rotate(${totalRotation % 360}deg)`;
        if (stepElapsed >= MORPH_INTERVAL_MS) {
          morphIndex = (morphIndex + 1) % INDETERMINATE_MORPHS.length;
          rotationTarget = (rotationTarget + 90) % 360;
          stepStart = now;
        }
        if (!cancelled) raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
      };
    }, [clampedProgress, reducedMotion]);

    return (
      <span
        ref={ref}
        className={[styles.root, className].filter(Boolean).join(" ")}
        data-contained={contained ? "" : undefined}
        role="progressbar"
        aria-label={ariaLabel ?? "Loading"}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={clampedProgress}
        {...rest}
      >
        <svg className={styles.svg} viewBox="0 0 100 100" aria-hidden="true">
          <g ref={groupRef} className={styles.rotator}>
            <path ref={pathRef} className={styles.path} />
          </g>
        </svg>
      </span>
    );
  },
);
