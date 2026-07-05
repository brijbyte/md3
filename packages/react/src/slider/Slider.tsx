"use client";
import * as React from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { Tooltip } from "@base-ui/react/tooltip";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Slider.module.css";

export type SliderSize = "xs" | "s" | "m" | "l" | "xl";

export interface SliderProps extends BaseSlider.Root.Props {
  /** Shows discrete tick marks along the track. Pair with `step`. */
  ticks?: boolean;
  /** Grows the active track from the midpoint instead of from `min` — for
   * positive/negative ranges like balance or brightness offset. Single-thumb only. */
  centered?: boolean;
  /** Track/handle size per the MD3 spec table. Only `m`/`l`/`xl` are tall enough for `icon`. */
  size?: SliderSize;
  /** Icon inset into the track's leading end. Only rendered at size `m`/`l`/`xl`. */
  icon?: React.ReactNode;
  /** Forwarded to each Thumb's input, not the root (the root has no accessible role itself). */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  getAriaLabel?: (index: number) => string;
  getAriaValueText?: (formattedValue: string, value: number, index: number) => string;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Matches the old fixed 12px notch (6px eaten from each flanking segment) — the spec
// table has no per-size gap token, so this stays a flat approximation across all sizes.
const GAP_PX = 6;

// A boundary against another segment (i.e. a thumb sitting in a gap) always rounds, at a
// smaller fixed radius than the track's own true-edge corners — per spec, this corner
// reads as a small nub, not a scaled-down copy of the outer rounding. A boundary at the
// track's true 0%/100% edge uses the full track radius, unless a thumb sits exactly there
// (squared off — see trackFlatStart/trackFlatEnd).
const GAP_RADIUS = "var(--md3-slider-gap-radius)";
const TRUE_EDGE_RADIUS = "var(--md3-slider-track-radius)";

// Track/tick/icon geometry only ever needs to know whether the slider runs along the
// inline or block axis — the thumb's own positioning (including RTL/vertical-lr
// writing-mode) is Base UI's problem, not ours.
function segmentStyle(
  vertical: boolean,
  start: number,
  end: number,
  leadingRadius: string,
  trailingRadius: string,
): React.CSSProperties {
  if (vertical) {
    // Min sits at the block-end (bottom) edge, mirroring Base UI's own vertical thumb
    // convention, so "leading" (near min) = bottom corners, "trailing" (near max) = top.
    return {
      position: "absolute",
      insetInline: 0,
      insetBlockEnd: start <= 0 ? "0%" : `calc(${start}% + ${GAP_PX}px)`,
      insetBlockStart: end >= 100 ? "0%" : `calc(${100 - end}% + ${GAP_PX}px)`,
      borderEndStartRadius: leadingRadius,
      borderEndEndRadius: leadingRadius,
      borderStartStartRadius: trailingRadius,
      borderStartEndRadius: trailingRadius,
    };
  }
  return {
    position: "absolute",
    insetBlock: 0,
    insetInlineStart: start <= 0 ? "0%" : `calc(${start}% + ${GAP_PX}px)`,
    insetInlineEnd: end >= 100 ? "0%" : `calc(${100 - end}% + ${GAP_PX}px)`,
    borderStartStartRadius: leadingRadius,
    borderEndStartRadius: leadingRadius,
    borderStartEndRadius: trailingRadius,
    borderEndEndRadius: trailingRadius,
  };
}

// A point mark centered on the track at `percent` along the slider's axis — same
// anchor-then-shift-back trick as Base UI's own thumb positioning (bottom-anchored
// marks shift down, not up, to center on the point).
function markStyle(vertical: boolean, percent: number): React.CSSProperties {
  return vertical
    ? {
        insetInlineStart: "50%",
        insetBlockEnd: `${percent}%`,
        transform: "translate(-50%, 50%)",
      }
    : {
        insetBlockStart: "50%",
        insetInlineStart: `${percent}%`,
        transform: "translate(-50%, -50%)",
      };
}

// The value bubble is a Base UI Tooltip. It shows while the thumb is focused (keyboard tab,
// held for the whole focus duration) or while actively dragging, and hides on blur/release.
// Kept separate from `pressed`, which drives the visual press state (narrow handle, state
// layer) and should only reflect an actual pointer drag — not mere keyboard focus.
function SliderThumbLabel({
  index,
  vertical,
  ...thumbProps
}: {
  index: number;
  vertical: boolean;
  "aria-label": string | undefined;
  "aria-labelledby": string | undefined;
  getAriaLabel: ((index: number) => string) | undefined;
  getAriaValueText: ((formattedValue: string, value: number, index: number) => string) | undefined;
}) {
  const [focused, setFocused] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const open = focused || pressed;
  // A mouse/touch press focuses the native input same as Tab does, and that focus
  // outlives the press (browsers don't blur range inputs on pointerup) — without this,
  // the tooltip would stay stuck open after the pointer leaves. Only a focus event with
  // no immediately-preceding pointerdown counts as "keyboard" for tooltip purposes.
  const pointerDownRef = React.useRef(false);
  // The thumb moves via inline `insetInlineStart`, which doesn't resize or scroll
  // anything, so Base UI's autoUpdate (ResizeObserver/IntersectionObserver-based)
  // never notices — a virtual anchor re-measured fresh every frame does.
  const [anchor, setAnchor] = React.useState<{ getBoundingClientRect(): DOMRect } | null>(null);
  const anchorElRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!pressed) return;
    const release = () => {
      setPressed(false);
      pointerDownRef.current = false;
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [pressed]);

  React.useEffect(() => {
    if (!open) return;
    const measure = () => {
      const el = anchorElRef.current;
      if (el) setAnchor({ getBoundingClientRect: () => el.getBoundingClientRect() });
    };
    measure();
    let frame = requestAnimationFrame(function loop() {
      measure();
      frame = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  return (
    <Tooltip.Root open={open}>
      <BaseSlider.Thumb
        ref={anchorElRef}
        index={index}
        className={styles.thumb}
        {...thumbProps}
        data-pressed={pressed || undefined}
        onPointerDown={() => {
          pointerDownRef.current = true;
          setPressed(true);
        }}
        onFocus={() => {
          if (!pointerDownRef.current) setFocused(true);
        }}
        onBlur={() => setFocused(false)}
      >
        <span className={styles.stateLayer} aria-hidden />
      </BaseSlider.Thumb>
      <Tooltip.Portal>
        <Tooltip.Positioner
          anchor={anchor}
          side={vertical ? "right" : "top"}
          sideOffset={12}
          className={styles.positioner}
        >
          <Tooltip.Popup className={styles.valueLabel}>
            <BaseSlider.Value>{(formattedValues) => formattedValues[index]}</BaseSlider.Value>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

// Range sliders get one Thumb/Value per entry in `value`/`defaultValue`.
export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(function Slider(props, ref) {
  const {
    className,
    ticks = false,
    centered = false,
    size = "xs",
    icon,
    value,
    defaultValue,
    min = 0,
    max = 100,
    step = 1,
    orientation = "horizontal",
    onValueChange,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    getAriaLabel,
    getAriaValueText,
    ...rest
  } = props;

  const vertical = orientation === "vertical";
  // Mirrors Base UI's own uncontrolled-value bookkeeping (defaults to `min`, updates on
  // every drag/keyboard change) so the track fill can react live without needing
  // `Slider.Value`'s render prop — which would otherwise nest the whole track markup
  // inside the `<output>` element it renders, an accessibility violation.
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? min);
  const liveValue = value ?? uncontrolledValue;
  const trackValues = Array.isArray(liveValue) ? liveValue : [liveValue];
  const thumbCount = trackValues.length;
  const isRange = thumbCount > 1;
  const tickCount = ticks ? Math.floor((max - min) / step) + 1 : 0;
  const toPercent = (v: number) => ((v - min) / (max - min)) * 100;
  const hasIcon = icon != null && (size === "m" || size === "l" || size === "xl");

  const handleValueChange = React.useCallback<NonNullable<SliderProps["onValueChange"]>>(
    (newValue, eventDetails) => {
      setUncontrolledValue(newValue);
      onValueChange?.(newValue, eventDetails);
    },
    [onValueChange],
  );

  // A thumb resting exactly at min/max squares off the track's adjacent corner (a
  // rounded corner must never poke out past the thumb capping it); every other
  // boundary — where the active fill meets a tail, or meets another thumb — always
  // rounds, since that corner is only ever bounded by the thin thumb sitting in its
  // own gap, never by the track's true edge.
  const atMin = trackValues[0] <= min;
  const atMax = trackValues[trackValues.length - 1] >= max;
  const activeStart =
    centered && !isRange
      ? Math.min(toPercent(trackValues[0]), 50)
      : isRange
        ? toPercent(trackValues[0])
        : 0;
  const activeEnd =
    centered && !isRange
      ? Math.max(toPercent(trackValues[0]), 50)
      : toPercent(trackValues[trackValues.length - 1]);
  const hasBeforeTail = activeStart > 0.01;
  const hasAfterTail = activeEnd < 99.99;

  return (
    <BaseSlider.Root
      ref={ref}
      data-size={size}
      className={mergeClassName(styles.root, className)}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      orientation={orientation}
      onValueChange={handleValueChange}
      {...rest}
    >
      <BaseSlider.Control className={styles.control}>
        <BaseSlider.Track
          className={cx(styles.track, atMin && styles.trackFlatStart, atMax && styles.trackFlatEnd)}
        >
          {hasIcon && (
            <span className={styles.insetIcon} aria-hidden>
              {icon}
            </span>
          )}
          {/* A discrete slider's outer tick already marks each end; a continuous one needs its own dot. */}
          {!ticks && (
            <span className={styles.stopIndicator} style={markStyle(vertical, 1)} aria-hidden />
          )}
          {!ticks && (
            <span className={styles.stopIndicator} style={markStyle(vertical, 99)} aria-hidden />
          )}
          {hasBeforeTail && (
            <span
              className={styles.trackSegment}
              style={segmentStyle(
                vertical,
                0,
                activeStart,
                atMin ? "0" : TRUE_EDGE_RADIUS,
                GAP_RADIUS,
              )}
              aria-hidden
            />
          )}
          <span
            className={cx(styles.trackSegment, styles.trackSegmentActive)}
            style={segmentStyle(
              vertical,
              activeStart,
              activeEnd,
              hasBeforeTail ? GAP_RADIUS : atMin ? "0" : TRUE_EDGE_RADIUS,
              hasAfterTail ? GAP_RADIUS : atMax ? "0" : TRUE_EDGE_RADIUS,
            )}
            aria-hidden
          />
          {hasAfterTail && (
            <span
              className={styles.trackSegment}
              style={segmentStyle(
                vertical,
                activeEnd,
                100,
                GAP_RADIUS,
                atMax ? "0" : TRUE_EDGE_RADIUS,
              )}
              aria-hidden
            />
          )}
          {centered && !isRange && <span className={styles.centerMark} aria-hidden />}
          {ticks &&
            Array.from({ length: tickCount }, (_, i) => {
              // Same edge inset as the stop indicators — the spec never sits a
              // mark flush on the track's rounded corner, only just inside it.
              const percent = i === 0 ? 1 : i === tickCount - 1 ? 99 : (i / (tickCount - 1)) * 100;
              const active = percent >= activeStart - 0.01 && percent <= activeEnd + 0.01;
              return (
                <span
                  key={i}
                  className={cx(styles.tick, active && styles.tickActive)}
                  style={markStyle(vertical, percent)}
                  aria-hidden
                />
              );
            })}
        </BaseSlider.Track>
        {Array.from({ length: thumbCount }, (_, i) => (
          <SliderThumbLabel
            key={i}
            index={i}
            vertical={vertical}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            getAriaLabel={getAriaLabel}
            getAriaValueText={getAriaValueText}
          />
        ))}
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
});
