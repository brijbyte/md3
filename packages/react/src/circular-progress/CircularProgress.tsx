"use client";
import * as React from "react";
import { Progress } from "@base-ui/react/progress";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./CircularProgress.module.css";

export interface CircularProgressProps extends Omit<
  Progress.Root.Props,
  "value" | "render" | "children"
> {
  /** Current progress, 0-`max`. Omit (or pass `null`) for the indeterminate animation. */
  value?: number | null;
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

export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  function CircularProgress(props, ref) {
    const { className, value = null, max = 100, ...rest } = props;
    const indeterminate = value == null;
    const sweep = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
    const appliedGap = Math.min(sweep, GAP_PERCENT);
    const trackLength = Math.max(0, 100 - sweep - 2 * appliedGap);
    const trackOffset = -(sweep + appliedGap);

    return (
      <Progress.Root
        ref={ref}
        className={mergeClassName(styles.root, className)}
        value={value ?? null}
        max={max}
        {...rest}
      >
        <svg
          className={indeterminate ? styles.svgIndeterminate : styles.svg}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          aria-hidden="true"
        >
          {!indeterminate && (
            <circle
              className={styles.track}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              pathLength={100}
              strokeDasharray={`${trackLength} ${100 - trackLength}`}
              strokeDashoffset={trackOffset}
            />
          )}
          <circle
            className={styles.indicator}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            pathLength={100}
            strokeDasharray={indeterminate ? undefined : `${sweep} ${100 - sweep}`}
            strokeDashoffset={indeterminate ? undefined : 0}
          />
        </svg>
      </Progress.Root>
    );
  },
);
