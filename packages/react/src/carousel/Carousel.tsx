"use client";
import * as React from "react";
import { useDirection } from "@base-ui/react/direction-provider";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Carousel.module.css";
import {
  ANCHOR_SIZE,
  centerAlignedKeylines,
  heroArrangement,
  type KeylineList,
  MAX_SMALL_ITEM_SIZE,
  MIN_SMALL_ITEM_SIZE,
  multiBrowseArrangement,
  slotAt,
  startAlignedKeylines,
  uncontainedArrangement,
} from "./keylines";

export type CarouselLayout =
  | "multi-browse"
  | "hero"
  | "center-aligned-hero"
  | "uncontained"
  | "full-screen";

const CarouselIndexContext = React.createContext<number>(-1);

interface CarouselContextValue {
  registerItem: (index: number, element: HTMLElement | null) => void;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function buildKeylines(
  layout: CarouselLayout,
  viewport: number,
  itemCount: number,
  options: {
    itemWidth: number | undefined;
    itemSpacing: number;
    minSmallItemWidth: number;
    maxSmallItemWidth: number;
  },
): KeylineList | null {
  const { itemSpacing, minSmallItemWidth, maxSmallItemWidth } = options;
  if (viewport <= 0 || itemCount === 0) {
    return null;
  }

  if (layout === "full-screen") {
    return startAlignedKeylines(
      {
        priority: 1,
        smallSize: 0,
        smallCount: 0,
        mediumSize: 0,
        mediumCount: 0,
        largeSize: viewport,
        largeCount: 1,
      },
      itemSpacing,
    );
  }

  if (layout === "uncontained") {
    const arrangement = uncontainedArrangement({
      availableSpace: viewport,
      itemSize: options.itemWidth ?? 186,
      itemSpacing,
    });
    if (!arrangement) return null;
    // A half-width leading anchor keeps the motion at the start closer to the cut off at the end.
    const leftAnchor = Math.max(
      Math.min(ANCHOR_SIZE, arrangement.largeSize),
      arrangement.mediumSize * 0.5,
    );
    return startAlignedKeylines(arrangement, itemSpacing, leftAnchor, ANCHOR_SIZE);
  }

  if (layout === "hero" || layout === "center-aligned-hero") {
    const result = heroArrangement({
      availableSpace: viewport,
      maxItemSize: options.itemWidth ?? null,
      itemSpacing,
      itemCount,
      isCentered: layout === "center-aligned-hero",
      minSmallItemSize: minSmallItemWidth,
      maxSmallItemSize: maxSmallItemWidth,
    });
    if (!result) return null;
    return result.centered
      ? centerAlignedKeylines(result.arrangement, viewport, itemSpacing)
      : startAlignedKeylines(result.arrangement, itemSpacing);
  }

  const arrangement = multiBrowseArrangement({
    availableSpace: viewport,
    preferredItemSize: options.itemWidth ?? 186,
    itemSpacing,
    itemCount,
    minSmallItemSize: minSmallItemWidth,
    maxSmallItemSize: maxSmallItemWidth,
  });
  return arrangement ? startAlignedKeylines(arrangement, itemSpacing) : null;
}

export interface CarouselProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "defaultValue" | "onChange"
> {
  /** Keyline strategy. @default 'multi-browse' */
  layout?: CarouselLayout;
  /** Index of the focal item. Use when the component is controlled. */
  value?: number;
  /** Index of the focal item on mount. @default 0 */
  defaultValue?: number;
  /** Called with the new focal index, from a click, arrow key, or settled scroll. */
  onValueChange?: (value: number) => void;
  /**
   * Target width of a large item. `preferredItemWidth` for multi-browse, the exact item
   * width for uncontained, and the max hero width for hero layouts. Ignored by full-screen.
   * @default 186
   */
  itemWidth?: number;
  /** Space between items. @default 8 */
  itemSpacing?: number;
  /** Lower bound for small items. @default 40 */
  minSmallItemWidth?: number;
  /** Upper bound for small items. @default 56 */
  maxSmallItemWidth?: number;
}

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(props, ref) {
    const {
      className,
      layout = "multi-browse",
      value: valueProp,
      defaultValue = 0,
      onValueChange,
      itemWidth,
      itemSpacing = 8,
      minSmallItemWidth = MIN_SMALL_ITEM_SIZE,
      maxSmallItemWidth = MAX_SMALL_ITEM_SIZE,
      children,
      ...rest
    } = props;

    const direction = useDirection();
    const isRtl = direction === "rtl";
    const stripRef = React.useRef<HTMLDivElement | null>(null);
    const itemsRef = React.useRef<Map<number, HTMLElement>>(new Map());
    const itemCount = React.Children.count(children);
    // Set while our own scrollTo is in flight, so its scrollend doesn't re-adopt a value.
    const programmaticScroll = React.useRef(false);
    const didMount = React.useRef(false);

    // Always drive Base UI as controlled so a settled scroll can move the focal item too.
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : uncontrolledValue;
    const valueRef = React.useRef(value);
    valueRef.current = value;

    const setValue = useEventCallback((next: number) => {
      if (next === valueRef.current) return;
      valueRef.current = next;
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    });

    const [viewport, setViewport] = React.useState(0);
    React.useEffect(() => {
      const strip = stripRef.current;
      if (!strip) return;
      setViewport(strip.clientWidth);
      const observer = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width;
        if (width != null) setViewport(width);
      });
      observer.observe(strip);
      return () => observer.disconnect();
    }, []);

    const keylines = React.useMemo(
      () =>
        buildKeylines(layout, viewport, itemCount, {
          itemWidth,
          itemSpacing,
          minSmallItemWidth,
          maxSmallItemWidth,
        }),
      [layout, viewport, itemCount, itemWidth, itemSpacing, minSmallItemWidth, maxSmallItemWidth],
    );
    const keylinesRef = React.useRef(keylines);
    keylinesRef.current = keylines;

    const registerItem = React.useCallback((index: number, element: HTMLElement | null) => {
      if (element) {
        itemsRef.current.set(index, element);
      } else {
        itemsRef.current.delete(index);
      }
    }, []);
    const context = React.useMemo<CarouselContextValue>(() => ({ registerItem }), [registerItem]);

    // Items are laid out at a uniform `pitch` and only *masked* down to their keyline
    // size, so painting never changes scroll geometry — no feedback loop with the scroller.
    const paint = useEventCallback(() => {
      const strip = stripRef.current;
      const list = keylinesRef.current;
      if (!strip || !list) return;
      const scroll = Math.abs(strip.scrollLeft);
      for (const [index, element] of itemsRef.current) {
        // The mask, not the item box, carries the paint: a transform moves an element's
        // scroll-snap area, so transforming the item itself would drag the snap points
        // around as we paint and the strip could never settle on a keyline.
        const mask = element.firstElementChild as HTMLElement | null;
        if (!mask) continue;
        const leading = index * list.pitch - scroll;
        const slot = slotAt(list, list.focalIndex + leading / list.pitch);
        mask.style.setProperty("--md3-carousel-mask-size", `${slot.size}px`);
        const shift = slot.offset - leading;
        mask.style.transform = `translateX(${isRtl ? -shift : shift}px)`;
      }
    });

    // Repaint on scroll (rAF-coalesced) and whenever the keylines change.
    React.useLayoutEffect(() => {
      paint();
    }, [paint, keylines]);

    React.useEffect(() => {
      const strip = stripRef.current;
      if (!strip) return;
      let frame = 0;
      const onScroll = () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          paint();
        });
      };
      strip.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        strip.removeEventListener("scroll", onScroll);
        if (frame) cancelAnimationFrame(frame);
      };
    }, [paint]);

    // A settled scroll (drag, wheel, snap) adopts the item nearest the focal keyline.
    React.useEffect(() => {
      const strip = stripRef.current;
      if (!strip) return;
      const settle = () => {
        const list = keylinesRef.current;
        if (!list || programmaticScroll.current) {
          programmaticScroll.current = false;
          return;
        }
        const scroll = Math.abs(strip.scrollLeft);
        const maxScroll = strip.scrollWidth - strip.clientWidth;
        // The trailing items can't reach the focal keyline — the scroller runs out of
        // travel first. Pinned at the end, keep the current item rather than snapping
        // back to whichever one happens to sit on the keyline.
        if (scroll >= maxScroll - 1 && valueRef.current * list.pitch >= maxScroll - 1) {
          return;
        }
        setValue(Math.max(0, Math.min(itemCount - 1, Math.round(scroll / list.pitch))));
      };
      if ("onscrollend" in strip) {
        strip.addEventListener("scrollend", settle);
        return () => strip.removeEventListener("scrollend", settle);
      }
      let timer: ReturnType<typeof setTimeout>;
      const onScroll = () => {
        clearTimeout(timer);
        timer = setTimeout(settle, 120);
      };
      strip.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        strip.removeEventListener("scroll", onScroll);
        clearTimeout(timer);
      };
    }, [setValue, itemCount]);

    // Bring the focal item to its keyline. The target is analytic (uniform pitch), so it
    // stays correct regardless of how the masks happen to be painted at this instant.
    React.useEffect(() => {
      const strip = stripRef.current;
      const list = keylinesRef.current;
      if (!strip || !list) return;
      const target = value * list.pitch;
      const current = Math.abs(strip.scrollLeft);
      if (Math.abs(current - target) < 1) return;
      const animate =
        didMount.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      programmaticScroll.current = true;
      strip.scrollTo({ left: isRtl ? -target : target, behavior: animate ? "smooth" : "auto" });
    }, [value, keylines, isRtl]);

    React.useEffect(() => {
      didMount.current = true;
    }, []);

    const largeSize = keylines?.slots[keylines.focalIndex]?.size ?? 0;

    return (
      <BaseTabs.Root
        ref={ref}
        className={[styles.root, className].filter(Boolean).join(" ")}
        value={value}
        onValueChange={(next) => {
          if (typeof next === "number") setValue(next);
        }}
        {...rest}
      >
        {/* The scroller sits *outside* the tablist on purpose: Base UI's composite scrolls
            its own root element into view on every arrow key, instantly and against an
            offset it measures from the nearest positioned ancestor. Keeping the tablist
            unscrollable leaves the scroll position ours alone. */}
        <div
          ref={stripRef}
          className={styles.strip}
          style={{
            // Layout pitch: every item occupies a large-size box; masks shrink visually only.
            ["--md3-carousel-item-size" as string]: `${largeSize}px`,
            ["--md3-carousel-item-spacing" as string]: `${itemSpacing}px`,
            // Turns the browser's own "reveal the focused item" scroll into "put it on the
            // leading keyline" — see the scroll-margin rule in the CSS.
            ["--md3-carousel-item-inset" as string]: `${Math.max(0, viewport - largeSize)}px`,
          }}
        >
          <BaseTabs.List className={styles.track} activateOnFocus loopFocus={false}>
            <CarouselContext.Provider value={context}>
              {React.Children.map(children, (child, index) => (
                <CarouselIndexContext.Provider value={index}>{child}</CarouselIndexContext.Provider>
              ))}
            </CarouselContext.Provider>
          </BaseTabs.List>
        </div>
      </BaseTabs.Root>
    );
  },
);

export interface CarouselItemProps extends Omit<BaseTabs.Tab.Props, "value"> {
  /** Overrides the positional index used as the Tab value. */
  value?: number;
}

export const CarouselItem = React.forwardRef<HTMLButtonElement, CarouselItemProps>(
  function CarouselItem(props, ref) {
    const { className, children, value, onPointerDown, onClick, ...rest } = props;
    const index = React.useContext(CarouselIndexContext);
    const context = React.useContext(CarouselContext);
    const ripple = useRipple();
    const elementRef = React.useRef<HTMLButtonElement | null>(null);

    const setRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        elementRef.current = node;
        context?.registerItem(index, node);
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [context, index, ref],
    );

    return (
      <BaseTabs.Tab
        ref={setRef}
        className={mergeClassName(styles.item, className)}
        value={value ?? index}
        onPointerDown={(event) => {
          ripple.onPointerDown(event);
          onPointerDown?.(event);
        }}
        onClick={(event) => {
          ripple.onClick();
          onClick?.(event);
        }}
        {...rest}
      >
        <span className={styles.mask}>
          <span className={styles.content}>{children}</span>
          <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
        </span>
      </BaseTabs.Tab>
    );
  },
);

/** Stable callback that always sees the latest render's values. */
function useEventCallback<Args extends unknown[], Return>(fn: (...args: Args) => Return) {
  const ref = React.useRef(fn);
  React.useLayoutEffect(() => {
    ref.current = fn;
  });
  return React.useCallback((...args: Args) => ref.current(...args), []);
}
