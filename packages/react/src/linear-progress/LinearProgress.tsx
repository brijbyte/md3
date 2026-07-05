"use client";
import * as React from "react";
import { Progress } from "@base-ui/react/progress";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./LinearProgress.module.css";

export interface LinearProgressProps extends Omit<
  Progress.Root.Props,
  "value" | "render" | "children"
> {
  /** Current progress, 0-`max`. Omit (or pass `null`) for the indeterminate animation. */
  value?: number | null;
}

// Mirrors Compose's current (non-deprecated) LinearProgressIndicator: a
// rounded active indicator, a gap, then a rounded track ending in a small
// stop dot — not the older flush track material-web still ships (deprecated
// there; Android is the source of truth here, see CLAUDE.md).
export const LinearProgress = React.forwardRef<HTMLDivElement, LinearProgressProps>(
  function LinearProgress(props, ref) {
    const { className, value = null, max = 100, ...rest } = props;
    const indeterminate = value == null;
    const percent = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <Progress.Root
        ref={ref}
        className={mergeClassName(styles.root, className)}
        value={value ?? null}
        max={max}
        {...rest}
      >
        {indeterminate ? (
          <>
            <span className={styles.indeterminateBar1} />
            <span className={styles.indeterminateBar2} />
          </>
        ) : (
          <>
            <span className={styles.indicator} style={{ width: `${percent}%` }} />
            <span
              className={styles.track}
              style={{ "--md3-linear-progress-percent": percent } as React.CSSProperties}
            />
            <span className={styles.stop} />
          </>
        )}
      </Progress.Root>
    );
  },
);
