"use client";
import * as React from "react";
import { Progress } from "@base-ui/react/progress";
import {
  CIRCLE_STAR_MORPH,
  CIRCULAR_PROGRESS_NUM_VERTICES,
  CIRCULAR_PROGRESS_SIZE,
  CIRCULAR_PROGRESS_STROKE_WIDTH,
} from "../generated/circular-progress-shapes";
import { motion } from "../generated/tokens";
import { mergeClassName } from "../utils/mergeClassName";
import { morphPathD } from "../utils/morphPath";
import styles from "./CircularProgress.module.css";

export interface CircularProgressProps extends Omit<
  Progress.Root.Props,
  "value" | "render" | "children"
> {
  /** Current progress, 0-`max`. Omit (or pass `null`) for the indeterminate animation. */
  value?: number | null;
  /**
   * Renders the active indicator as a wavy (amplitude-morphing) shape instead
   * of a smooth arc, per Compose's `CircularWavyProgressIndicator`.
   */
  wavy?: boolean;
}

// Spec constants (px), from CircularProgressIndicatorTokens.kt: 40px diameter,
// 4px active/track thickness, 4px active-track gap. pathLength="100" on both
// circles normalizes dasharray/dashoffset to plain 0-100 units regardless of
// the actual radius (mirrors material-web's determinate-circle trick).
const SIZE = 40;
const THICKNESS = 4;
const GAP = 4;
const RADIUS = (SIZE - THICKNESS) / 2;
// (gap + thickness) as a fraction of the circumference, in pathLength=100
// units — the `+ thickness` compensates for the round stroke cap's own
// half-width reach on each side of the gap (see drawCircularIndicator).
const GAP_PERCENT = ((GAP + THICKNESS) / (Math.PI * SIZE)) * 100;

// Wavy uses a bigger container (WaveSize token) to leave room for the star's
// points, and its own gap-percent since the circumference differs.
const WAVY_SIZE = CIRCULAR_PROGRESS_SIZE;
const WAVY_RADIUS = (WAVY_SIZE - CIRCULAR_PROGRESS_STROKE_WIDTH) / 2;
const WAVY_GAP_PERCENT = ((GAP + THICKNESS) / (Math.PI * WAVY_SIZE)) * 100;
const CIRCLE_D = morphPathD(CIRCLE_STAR_MORPH, 0);
const STAR_D = morphPathD(CIRCLE_STAR_MORPH, 1);
// One full wave-phase cycle (--md3-circular-progress-wave-phase: 0 -> 1) is
// one vertex-to-vertex hop of the star: 360/numVertices of rotation, and
// 100/numVertices of the pathLength=100 circumference.
const WAVE_PHASE_ROTATION_DEG = 360 / CIRCULAR_PROGRESS_NUM_VERTICES;
const WAVE_PHASE_DASH_PERCENT = 100 / CIRCULAR_PROGRESS_NUM_VERTICES;

// Compose's WavyProgressIndicatorDefaults.indicatorAmplitude: full amplitude
// except right at the start/end of the track, where it flattens to a circle.
function determinateAmplitude(sweep: number): 0 | 1 {
  return sweep <= 10 || sweep >= 95 ? 0 : 1;
}

export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  function CircularProgress(props, ref) {
    const { className, value = null, max = 100, wavy = false, ...rest } = props;
    const indeterminate = value == null;
    const sweep = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
    const size = wavy ? WAVY_SIZE : SIZE;
    const radius = wavy ? WAVY_RADIUS : RADIUS;
    const gapPercent = wavy ? WAVY_GAP_PERCENT : GAP_PERCENT;
    const appliedGap = Math.min(sweep, gapPercent);
    const trackLength = Math.max(0, 100 - sweep - 2 * appliedGap);
    const trackOffset = -(sweep + appliedGap);
    const amplitude = indeterminate ? 1 : determinateAmplitude(sweep);

    return (
      <Progress.Root
        ref={ref}
        className={mergeClassName(styles.root, className)}
        value={value ?? null}
        max={max}
        style={wavy ? { width: size, height: size } : undefined}
        {...rest}
      >
        <svg
          className={indeterminate ? styles.svgIndeterminate : styles.svg}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          {!indeterminate && (
            <circle
              className={styles.track}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              pathLength={100}
              strokeDasharray={`${trackLength} ${100 - trackLength}`}
              strokeDashoffset={trackOffset}
            />
          )}
          {wavy ? (
            <path
              className={mergeClassName(styles.indicator, styles.indicatorWavy) as string}
              pathLength={100}
              // `d` attribute is the universal geometry (Safari/Firefox ignore the
              // CSS `d` property); the CSS `d` below layers on the smooth
              // circle<->star morph in engines that support it (Chromium).
              d={amplitude === 1 ? STAR_D : CIRCLE_D}
              style={
                {
                  d: `path("${amplitude === 1 ? STAR_D : CIRCLE_D}")`,
                  transformOrigin: `${size / 2}px ${size / 2}px`,
                  transform: `rotate(calc(var(--md3-circular-progress-wave-phase) * ${WAVE_PHASE_ROTATION_DEG}deg))`,
                  transition: indeterminate
                    ? undefined
                    : [
                        `d ${motion.durationLong2} ${motion.easingStandard}`,
                        `stroke-dasharray ${motion.durationMedium2} ${motion.easingStandard}`,
                        `stroke-dashoffset ${motion.durationMedium2} ${motion.easingStandard}`,
                      ].join(", "),
                  strokeDasharray: indeterminate ? undefined : `${sweep} ${100 - sweep}`,
                  strokeDashoffset: indeterminate
                    ? undefined
                    : `calc(var(--md3-circular-progress-wave-phase) * ${-WAVE_PHASE_DASH_PERCENT}%)`,
                } as React.CSSProperties
              }
            />
          ) : (
            <circle
              className={styles.indicator}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              pathLength={100}
              strokeDasharray={indeterminate ? undefined : `${sweep} ${100 - sweep}`}
              strokeDashoffset={indeterminate ? undefined : 0}
            />
          )}
        </svg>
      </Progress.Root>
    );
  },
);
