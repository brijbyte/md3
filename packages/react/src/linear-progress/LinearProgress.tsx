"use client";
import * as React from "react";
import { Progress } from "@base-ui/react/progress";
import { motion } from "../generated/tokens";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./LinearProgress.module.css";

export interface LinearProgressProps extends Omit<
  Progress.Root.Props,
  "value" | "render" | "children"
> {
  /** Current progress, 0-`max`. Omit (or pass `null`) for the indeterminate animation. */
  value?: number | null;
  /**
   * Renders the active indicator as a wavy (amplitude-morphing) shape instead
   * of a straight bar, per Compose's `LinearWavyProgressIndicator`.
   */
  wavy?: boolean;
}

const THICKNESS = 4;
const GAP = 4;
const STOP_SIZE = 4;
const CAP_WIDTH = THICKNESS / 2;

// WavyProgressIndicatorDefaults / *ProgressIndicatorTokens.kt: the wavy
// container is taller (WaveHeight) to leave room for the wave, and its
// wavelength differs between determinate and indeterminate.
const WAVY_HEIGHT = 10;
const WAVY_WAVELENGTH_DETERMINATE = 40;
const WAVY_WAVELENGTH_INDETERMINATE = 20;
// Quadratic-bezier peak height for a max-amplitude wave: (height-thickness)/2
// — matches LinearProgressIndicatorTokens.ActiveWaveAmplitude (3dp) exactly.
const WAVY_PEAK = (WAVY_HEIGHT - THICKNESS) / 2;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

// WavyProgressIndicatorDefaults.indicatorAmplitude: full amplitude except
// right at the start/end of the track, where it flattens to a straight line.
function determinateAmplitude(percent: number): 0 | 1 {
  return percent <= 10 || percent >= 95 ? 0 : 1;
}

// Builds the `d` for a repeating quadratic-bezier sine wave spanning
// [0, totalWidth], vertically centered in `height`. peakY=0 produces a flat
// line with the *same* command structure, so the CSS `d` property can
// transition smoothly between a flat and wavy shape (amplitude ramp).
function buildWaveD(totalWidth: number, wavelength: number, peakY: number, height: number): string {
  const halfWavelength = wavelength / 2;
  const centerY = height / 2;
  let d = `M0,${centerY}`;
  let x = 0;
  let sign = 1;
  while (x < totalWidth) {
    const controlX = x + halfWavelength / 2;
    const controlY = centerY + sign * peakY;
    const nextX = Math.min(x + halfWavelength, totalWidth);
    d += `Q${controlX},${controlY} ${nextX},${centerY}`;
    x = nextX;
    sign *= -1;
  }
  return d;
}

function useMeasuredWidth(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [width, setWidth] = React.useState(240);
  React.useLayoutEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width || 240);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, ref]);
  return width;
}

// Compose's indeterminate head/tail animation specs, expressed as plain
// clamped-linear functions of elapsed ms within the 1750ms cycle (delay ->
// hold at 0, then rise 0->1 over its own duration, then hold at 1) — the
// exact breakpoints already verified for the non-wavy indeterminate bars.
function bar1Progress(elapsedMs: number) {
  const t = elapsedMs % 1750;
  return { tail: clamp01((t - 250) / 1000), head: clamp01(t / 1000) };
}
function bar2Progress(elapsedMs: number) {
  const t = elapsedMs % 1750;
  return { tail: clamp01((t - 900) / 850), head: clamp01((t - 650) / 850) };
}

export const LinearProgress = React.forwardRef<HTMLDivElement, LinearProgressProps>(
  function LinearProgress(props, ref) {
    const { className, value = null, max = 100, wavy = false, ...rest } = props;
    const indeterminate = value == null;
    const percent = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
    const rootRef = React.useRef<HTMLDivElement>(null);
    const width = useMeasuredWidth(rootRef, wavy);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    return (
      <Progress.Root
        ref={rootRef}
        className={mergeClassName(styles.root, className)}
        value={value ?? null}
        max={max}
        style={wavy ? { height: WAVY_HEIGHT } : undefined}
        {...rest}
      >
        {wavy ? (
          indeterminate ? (
            <WavyIndeterminate width={width} />
          ) : (
            <WavyDeterminate width={width} percent={percent} />
          )
        ) : indeterminate ? (
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

function WavyDeterminate({ width, percent }: { width: number; percent: number }) {
  const wavelength = WAVY_WAVELENGTH_DETERMINATE;
  const maxX = width + wavelength * 2;
  const amplitude = determinateAmplitude(percent);
  const waveD = React.useMemo(
    () => buildWaveD(maxX, wavelength, WAVY_PEAK, WAVY_HEIGHT),
    [maxX, wavelength],
  );
  const flatD = React.useMemo(
    () => buildWaveD(maxX, wavelength, 0, WAVY_HEIGHT),
    [maxX, wavelength],
  );

  const adjustedBarTailPx = CAP_WIDTH;
  const adjustedBarHeadPx = clamp((percent / 100) * width, CAP_WIDTH, width - CAP_WIDTH);
  const trackStartPx = Math.min(width - CAP_WIDTH, adjustedBarHeadPx + GAP + THICKNESS);
  const u = (px: number) => (px / maxX) * 100;
  const startU = u(adjustedBarTailPx);
  const stopU = u(adjustedBarHeadPx);
  const wavelengthFraction = (wavelength / maxX) * 100;

  return (
    <svg
      className={styles.wavySvg}
      viewBox={`0 0 ${width} ${WAVY_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {trackStartPx < width - CAP_WIDTH && (
        <line
          className={styles.wavyTrack}
          x1={trackStartPx}
          y1={WAVY_HEIGHT / 2}
          x2={width - CAP_WIDTH}
          y2={WAVY_HEIGHT / 2}
        />
      )}
      <circle
        className={styles.wavyStop}
        cx={width - STOP_SIZE / 2}
        cy={WAVY_HEIGHT / 2}
        r={STOP_SIZE / 2}
      />
      <path
        className={mergeClassName(styles.wavyIndicator, styles.wavyIndicatorMoving) as string}
        pathLength={100}
        style={
          {
            d: `path("${amplitude === 1 ? waveD : flatD}")`,
            transform: `translateX(calc(var(--md3-linear-progress-wave-phase) * ${-wavelength}px))`,
            transition: [
              `d ${motion.durationLong2} ${motion.easingStandard}`,
              `stroke-dasharray ${motion.durationMedium2} ${motion.easingStandard}`,
              `stroke-dashoffset ${motion.durationMedium2} ${motion.easingStandard}`,
            ].join(", "),
            strokeDasharray: `${stopU - startU} ${100 - (stopU - startU)}`,
            strokeDashoffset: `calc(${-startU} + var(--md3-linear-progress-wave-phase) * ${-wavelengthFraction})`,
          } as React.CSSProperties
        }
      />
    </svg>
  );
}

function WavyIndeterminate({ width }: { width: number }) {
  const wavelength = WAVY_WAVELENGTH_INDETERMINATE;
  const maxX = width + wavelength * 2;
  const waveD = React.useMemo(
    () => buildWaveD(maxX, wavelength, WAVY_PEAK, WAVY_HEIGHT),
    [maxX, wavelength],
  );
  const bar1Ref = React.useRef<SVGPathElement>(null);
  const bar2Ref = React.useRef<SVGPathElement>(null);

  const applyBar = React.useCallback(
    (el: SVGPathElement | null, tail: number, head: number, phase: number) => {
      if (!el) return;
      const tailPx = clamp(tail * width, CAP_WIDTH, width - CAP_WIDTH);
      const headPx = clamp(head * width, CAP_WIDTH, width - CAP_WIDTH);
      const waveShiftPx = phase * wavelength;
      const u = (px: number) => (px / maxX) * 100;
      const startU = u(tailPx + waveShiftPx);
      const stopU = u(headPx + waveShiftPx);
      el.style.strokeDasharray = `${Math.max(0, stopU - startU)} ${100 - Math.max(0, stopU - startU)}`;
      el.style.strokeDashoffset = `${-startU}`;
      el.style.transform = `translateX(${-waveShiftPx}px)`;
    },
    [width, wavelength, maxX],
  );

  // Synchronous initial frame (t=0) so there's no flash before the first rAF tick.
  React.useLayoutEffect(() => {
    const { tail: tail1, head: head1 } = bar1Progress(0);
    const { tail: tail2, head: head2 } = bar2Progress(0);
    applyBar(bar1Ref.current, tail1, head1, 0);
    applyBar(bar2Ref.current, tail2, head2, 0);
  }, [applyBar]);

  React.useEffect(() => {
    let raf = 0;
    let cancelled = false;
    const start = performance.now();
    function frame(now: number) {
      const elapsed = now - start;
      const { tail: tail1, head: head1 } = bar1Progress(elapsed);
      const { tail: tail2, head: head2 } = bar2Progress(elapsed);
      const phase = (elapsed % 1000) / 1000;
      applyBar(bar1Ref.current, tail1, head1, phase);
      applyBar(bar2Ref.current, tail2, head2, phase);
      if (!cancelled) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [applyBar]);

  return (
    <svg
      className={styles.wavySvg}
      viewBox={`0 0 ${width} ${WAVY_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        ref={bar1Ref}
        className={styles.wavyIndicator}
        pathLength={100}
        style={{ d: `path("${waveD}")` } as React.CSSProperties}
      />
      <path
        ref={bar2Ref}
        className={styles.wavyIndicator}
        pathLength={100}
        style={{ d: `path("${waveD}")` } as React.CSSProperties}
      />
    </svg>
  );
}
