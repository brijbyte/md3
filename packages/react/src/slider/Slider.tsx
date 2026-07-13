"use client";
import * as React from "react";
import { useDirection } from "@base-ui/react/direction-provider";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { Tooltip } from "@base-ui/react/tooltip";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Slider.module.css";

export type SliderSize = "xs" | "s" | "m" | "l" | "xl";

export interface SliderProps extends BaseSlider.Root.Props {
  /** Shows discrete tick marks along the track. `true` marks every `step`; a number marks
   * at that value interval instead (e.g. `30` on a per-second slider = a tick every 30s). */
  ticks?: boolean | number;
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
  /** Formats the value shown in the thumb's tooltip bubble (e.g. seconds → `m:ss`).
   * Falls back to Base UI's `format`-based number formatting when omitted. */
  formatValue?: (value: number, index: number) => string;
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Segments are inset this far from the thumb's center (its value position). Spec gap is
// measured from the thumb *edge* (Compose ActiveHandle Leading/Trailing Space = 6dp, fixed
// across all sizes), so this is 6dp + the resting handle half-width (4px/2) to leave a 6px
// visible gap on each side.
const GAP_PX = 8;

// A boundary against another segment (i.e. a thumb sitting in a gap) always rounds, at a
// smaller fixed radius than the track's own true-edge corners — per spec, this corner
// reads as a small nub, not a scaled-down copy of the outer rounding. A boundary at the
// track's true 0%/100% edge uses the full track radius, unless a thumb sits exactly there
// (squared off — see trackFlatStart/trackFlatEnd).
const GAP_RADIUS = "var(--_gap-radius)";
const TRUE_EDGE_RADIUS = "var(--_track-radius)";

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

// The value bubble is a Base UI Tooltip. It shows while the thumb is focused via keyboard,
// or while actively dragging, and hides on blur/release. Dragging is read from Base UI's own
// `data-dragging` on the thumb — set on the active thumb for a track click too, not just a
// direct grab — so clicking anywhere on the track opens the bubble; `pressed` state we
// managed from the thumb's own pointerdown missed track-initiated drags entirely.
function SliderThumbLabel({
  index,
  active,
  vertical,
  formatValue,
  ...thumbProps
}: {
  index: number;
  active: boolean;
  vertical: boolean;
  formatValue: ((value: number, index: number) => string) | undefined;
  "aria-label": string | undefined;
  "aria-labelledby": string | undefined;
  getAriaLabel: ((index: number) => string) | undefined;
  getAriaValueText: ((formattedValue: string, value: number, index: number) => string) | undefined;
}) {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const direction = useDirection();
  // `dragging` (from data-dragging) is true on every thumb during any drag; `active` narrows
  // it to the one actually moving so only its bubble opens and only its handle narrows.
  const activeDrag = dragging && active;
  // Spec (material-web `.label`): the value bubble shows on hover, focus, and press/drag.
  const open = focused || hovered || activeDrag;
  // Base UI positions the thumb by mutating its inline `style` (inset-inline-start), which
  // its own autoUpdate (ResizeObserver/IntersectionObserver-based) never reacts to — so we
  // re-anchor the bubble off a MutationObserver on that attribute instead.
  const [anchor, setAnchor] = React.useState<{
    getBoundingClientRect(): DOMRect;
    contextElement?: Element;
  } | null>(null);
  const anchorElRef = React.useRef<HTMLDivElement>(null);

  // Mirror Base UI's `data-dragging` (which it toggles on the active thumb for both direct
  // grabs and track clicks) into React state so the tooltip can react to it.
  React.useEffect(() => {
    const el = anchorElRef.current;
    if (!el) return;
    const sync = () => setDragging(el.hasAttribute("data-dragging"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(el, { attributes: true, attributeFilter: ["data-dragging"] });
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const el = anchorElRef.current;
    if (!el) return;
    // Re-anchor exactly when the thumb moves (its `style` mutates) rather than polling every
    // frame — an idle open bubble does no work and never re-renders. `contextElement` lets
    // Base UI attach its scroll/resize tracking to the real thumb's ancestors.
    const reanchor = () =>
      setAnchor({ getBoundingClientRect: () => el.getBoundingClientRect(), contextElement: el });
    reanchor();
    const observer = new MutationObserver(reanchor);
    observer.observe(el, { attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, [open]);

  return (
    <Tooltip.Root open={open}>
      <BaseSlider.Thumb
        ref={anchorElRef}
        index={index}
        className={styles.thumb}
        {...thumbProps}
        data-active={activeDrag || undefined}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        // Focused (tooltip + focus ring) tracks keyboard focus only: :focus-visible is true
        // when focus arrives via keyboard, false for pointer — so a thumb press or a track
        // click (which focuses the input without leaving it visibly focused) never sticks the
        // ring on; pointer interactions surface the bubble through hover/press instead.
        onFocus={(event) => {
          if ((event.target as HTMLElement).matches(":focus-visible")) setFocused(true);
        }}
        onBlur={() => setFocused(false)}
      >
        <span className={styles.thumbBar} aria-hidden />
      </BaseSlider.Thumb>
      <Tooltip.Portal>
        <Tooltip.Positioner
          anchor={anchor}
          side={vertical ? "left" : "top"}
          sideOffset={12}
          className={styles.positioner}
          // Portalled out of a scoped DirectionProvider's DOM (see FabMenu).
          dir={direction === "rtl" ? "rtl" : undefined}
        >
          <Tooltip.Popup className={styles.valueLabel}>
            <BaseSlider.Value>
              {(formattedValues, values) =>
                formatValue ? formatValue(values[index], index) : formattedValues[index]
              }
            </BaseSlider.Value>
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
    formatValue,
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
  // Ticks default to one per `step`; a numeric `ticks` sets an independent value interval
  // (so a per-second slider can still mark only every 30s).
  const tickInterval = ticks === true ? step : typeof ticks === "number" ? ticks : 0;
  const tickCount = tickInterval ? Math.floor((max - min) / tickInterval) + 1 : 0;
  const toPercent = (v: number) => ((v - min) / (max - min)) * 100;
  const hasIcon = icon != null && (size === "m" || size === "l" || size === "xl");

  // Base UI's `data-dragging` is a root-level flag on *every* thumb, so on a range slider we
  // track which thumb is actually moving (from the change event) to scope the value bubble
  // and the pressed-handle narrowing to it. A single-thumb slider is always "the" thumb.
  const [activeThumb, setActiveThumb] = React.useState(-1);

  const handleValueChange = React.useCallback<NonNullable<SliderProps["onValueChange"]>>(
    (newValue, eventDetails) => {
      setUncontrolledValue(newValue);
      setActiveThumb(eventDetails.activeThumbIndex);
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
              // Position each mark at its real value; clamp to the same edge inset as the
              // stop indicators — the spec never sits a mark flush on the rounded corner.
              const raw = toPercent(min + i * tickInterval);
              const percent = raw <= 1 ? 1 : raw >= 99 ? 99 : raw;
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
            active={!isRange || i === activeThumb}
            vertical={vertical}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            getAriaLabel={getAriaLabel}
            getAriaValueText={getAriaValueText}
            formatValue={formatValue}
          />
        ))}
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
});
