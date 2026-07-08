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

// Width-derived constants shared by both wavy modes: w100 maps 0-1 (or 0-100%)
// track progress into pathLength-100 units (the extra ±wavelength padding the
// path carries for wave travel shrinks the usable fraction); wlf is one
// wavelength in the same units, used for the wave-phase dashoffset correction.
function wavyScale(width: number, wavelength: number) {
  const maxX = width + wavelength * 2;
  return { maxX, w100: (width / maxX) * 100, wlf: (wavelength / maxX) * 100 };
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
              style={{ "--_percent": percent } as React.CSSProperties}
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
        // `d` attribute is the universal geometry (Safari/Firefox ignore the CSS
        // `d` property); the CSS `d` below layers on the smooth amplitude morph
        // in engines that support it (Chromium).
        d={amplitude === 1 ? waveD : flatD}
        style={
          {
            d: `path("${amplitude === 1 ? waveD : flatD}")`,
            transform: `translateX(calc(var(--_wave-phase) * ${-wavelength}px))`,
            transition: [
              `d ${motion.durationLong2} ${motion.easingStandard}`,
              `stroke-dasharray ${motion.durationMedium2} ${motion.easingStandard}`,
              `stroke-dashoffset ${motion.durationMedium2} ${motion.easingStandard}`,
            ].join(", "),
            strokeDasharray: `${stopU - startU} ${100 - (stopU - startU)}`,
            strokeDashoffset: `calc(${-startU} + var(--_wave-phase) * ${-wavelengthFraction})`,
          } as React.CSSProperties
        }
      />
    </svg>
  );
}

function WavyIndeterminate({ width }: { width: number }) {
  const wavelength = WAVY_WAVELENGTH_INDETERMINATE;
  const { maxX, w100, wlf } = wavyScale(width, wavelength);
  const waveD = React.useMemo(
    () => buildWaveD(maxX, wavelength, WAVY_PEAK, WAVY_HEIGHT),
    [maxX, wavelength],
  );

  // The two sweeping bars are driven purely by CSS keyframes (see the module
  // css) — no JS animation loop — so they stay locked to the same document
  // timeline as the non-wavy indeterminate bars. JS only feeds the width-derived
  // scale + wave template that the keyframes read.
  // Geometry via the `d` attribute (static here) so it renders in Safari/Firefox,
  // which don't honor the CSS `d` property.
  const barStyle = {
    "--_w100": w100,
    "--_wlf": wlf,
    "--_wavelength": `${wavelength}px`,
  } as React.CSSProperties;

  return (
    <svg
      className={styles.wavySvg}
      viewBox={`0 0 ${width} ${WAVY_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className={`${styles.wavyIndicator} ${styles.wavyIndeterminateBar} ${styles.wavyIndeterminateBar1}`}
        pathLength={100}
        d={waveD}
        style={barStyle}
      />
      <path
        className={`${styles.wavyIndicator} ${styles.wavyIndeterminateBar} ${styles.wavyIndeterminateBar2}`}
        pathLength={100}
        d={waveD}
        style={barStyle}
      />
    </svg>
  );
}
