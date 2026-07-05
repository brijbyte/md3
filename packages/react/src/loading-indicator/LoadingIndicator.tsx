"use client";
import * as React from "react";
import {
  GLOBAL_ROTATION_DURATION_MS,
  INDETERMINATE_MORPHS,
  MORPH_INTERVAL_MS,
} from "../generated/loading-indicator-shapes";
import { morphPathD } from "../utils/morphPath";
import styles from "./LoadingIndicator.module.css";

export interface LoadingIndicatorProps extends React.ComponentPropsWithoutRef<"span"> {
  /** Contained variant: shape sits inside a colored pill container. */
  contained?: boolean;
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
    const { className, contained, "aria-label": ariaLabel, ...rest } = props;
    const pathRef = React.useRef<SVGPathElement>(null);
    const groupRef = React.useRef<SVGGElement>(null);
    const reducedMotion = usePrefersReducedMotion();

    // Renders synchronously (SSR-safe, no effect needed) so the indicator
    // never flashes an empty path for the frame or two before the first
    // rAF tick below takes over — matters most right after mount/hydration,
    // when a network-throttled chunk load can stretch that gap noticeably.
    const initialD = morphPathD(INDETERMINATE_MORPHS[0], 0);

    React.useEffect(() => {
      const path = pathRef.current;
      const group = groupRef.current;
      if (!path || !group) return;

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
    }, [reducedMotion]);

    return (
      <span
        ref={ref}
        className={[styles.root, className].filter(Boolean).join(" ")}
        data-contained={contained ? "" : undefined}
        role="progressbar"
        aria-label={ariaLabel ?? "Loading"}
        {...rest}
      >
        <svg className={styles.svg} viewBox="0 0 100 100" aria-hidden="true">
          <g ref={groupRef} className={styles.rotator}>
            <path ref={pathRef} className={styles.path} d={initialD} />
          </g>
        </svg>
      </span>
    );
  },
);
