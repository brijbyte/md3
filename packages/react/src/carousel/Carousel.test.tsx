import { DirectionProvider } from "@base-ui/react/direction-provider";
import { render, waitFor } from "@testing-library/react";
import { userEvent } from "@vitest/browser/context";
import { expect, test } from "vitest";
// Shape/state tokens drive the mask geometry.
import "../generated/tokens.css";
import { Carousel, CarouselItem, type CarouselProps } from "./Carousel";
import styles from "./Carousel.module.css";
import {
  MAX_SMALL_ITEM_SIZE,
  MIN_SMALL_ITEM_SIZE,
  leadingScroll,
  multiBrowseArrangement,
  slotAt,
  startAlignedKeylines,
  uncontainedArrangement,
} from "./keylines";

const VIEWPORT = 480;

function renderCarousel(
  props?: Partial<CarouselProps> & { count?: number; dir?: "ltr" | "rtl"; inset?: number },
) {
  const { count = 8, dir = "ltr", inset = 0, ...rest } = props ?? {};
  const utils = render(
    <DirectionProvider direction={dir}>
      <div dir={dir} style={{ width: VIEWPORT, marginInlineStart: inset }}>
        <Carousel aria-label="Photos" {...rest}>
          {Array.from({ length: count }, (_, i) => (
            <CarouselItem key={i} data-testid={`item-${i}`}>
              <div style={{ height: 160, width: "100%", background: "#ccc" }}>{i}</div>
            </CarouselItem>
          ))}
        </Carousel>
      </div>
    </DirectionProvider>,
  );
  const masks = () => Array.from(utils.container.querySelectorAll<HTMLElement>(`.${styles.mask}`));
  const maskWidth = (i: number) => masks()[i]!.getBoundingClientRect().width;
  return { ...utils, masks, maskWidth };
}

test("multi-browse arrangement fills the viewport exactly", () => {
  const arrangement = multiBrowseArrangement({
    availableSpace: VIEWPORT,
    preferredItemSize: 186,
    itemSpacing: 8,
    itemCount: 10,
  })!;
  expect(arrangement).not.toBeNull();
  const total =
    arrangement.largeSize * arrangement.largeCount +
    arrangement.mediumSize * arrangement.mediumCount +
    arrangement.smallSize * arrangement.smallCount +
    8 * (arrangement.largeCount + arrangement.mediumCount + arrangement.smallCount - 1);
  expect(total).toBeCloseTo(VIEWPORT, 3);
  // Large > medium > small is what makes the keyline motion read as expanding/collapsing.
  expect(arrangement.largeSize).toBeGreaterThan(arrangement.mediumSize);
  expect(arrangement.mediumSize).toBeGreaterThan(arrangement.smallSize);
  expect(arrangement.smallSize).toBeGreaterThanOrEqual(MIN_SMALL_ITEM_SIZE);
  expect(arrangement.smallSize).toBeLessThanOrEqual(MAX_SMALL_ITEM_SIZE);
});

// Fewer items than keyline positions: small slots go first, one medium is kept so the
// large items don't fill the whole carousel, and large slots are never dropped.
test("multi-browse sheds surplus keylines when there are too few items", () => {
  const arrangement = multiBrowseArrangement({
    availableSpace: VIEWPORT,
    preferredItemSize: 186,
    itemSpacing: 8,
    itemCount: 2,
  })!;
  expect(arrangement.smallCount).toBe(0);
  expect(arrangement.mediumCount).toBe(1);
});

test("uncontained keeps a uniform item size and cuts off the overflow item", () => {
  const arrangement = uncontainedArrangement({
    availableSpace: VIEWPORT,
    itemSize: 150,
    itemSpacing: 8,
  })!;
  expect(arrangement.largeSize).toBe(150);
  expect(arrangement.smallCount).toBe(0);
  expect(arrangement.mediumCount).toBe(1);
  // The cut-off item must be visibly smaller than a full item, or there is no motion.
  expect(arrangement.mediumSize).toBeLessThan(arrangement.largeSize);
});

// Regression: a touch scroller rubber-banding past its start reports an out-of-range
// offset — negative in LTR, positive in RTL. The paint used to take the magnitude of
// scrollLeft (a shortcut for RTL counting backwards), which mirrors that overscroll, so
// the masks lurched forwards while the items were being dragged backwards. Visible only
// at the ends of the travel, and only on input that can overscroll — hence "a shake at
// the edges" on touch and nothing at all with a mouse.
test("overscrolling past the leading edge keeps the masks travelling the same way", () => {
  const arrangement = multiBrowseArrangement({
    availableSpace: VIEWPORT,
    preferredItemSize: 186,
    itemSpacing: 8,
    itemCount: 8,
  })!;
  const list = startAlignedKeylines(arrangement, 8);
  // Where the first item's mask lands for a given scrollLeft, exactly as `paint` derives it.
  const maskAt = (scrollLeft: number, isRtl = false) =>
    slotAt(list, list.focalIndex + -leadingScroll(scrollLeft, isRtl) / list.pitch).offset;

  // Dragging back past the start must keep pushing the mask the way it was already going.
  expect(maskAt(-24)).toBeGreaterThan(maskAt(-12));
  expect(maskAt(-12)).toBeGreaterThan(maskAt(0));
  expect(maskAt(0)).toBeGreaterThan(maskAt(12));
  // Same story in RTL, where scrollLeft counts backwards and overscroll goes positive.
  expect(maskAt(24, true)).toBeGreaterThan(maskAt(12, true));
  expect(maskAt(12, true)).toBeGreaterThan(maskAt(0, true));
  expect(maskAt(0, true)).toBeGreaterThan(maskAt(-12, true));
});

test("renders a tablist whose focal item is masked to the large size", async () => {
  const { container, maskWidth } = renderCarousel();
  expect(container.querySelector('[role="tablist"]')).not.toBeNull();
  expect(container.querySelectorAll('[role="tab"]')).toHaveLength(8);

  const arrangement = multiBrowseArrangement({
    availableSpace: VIEWPORT,
    preferredItemSize: 186,
    itemSpacing: 8,
    itemCount: 8,
  })!;
  await waitFor(() => expect(maskWidth(0)).toBeCloseTo(arrangement.largeSize, 0));
  // Trailing keylines collapse: after the large run comes medium, then small.
  const after = arrangement.largeCount;
  expect(maskWidth(after)).toBeCloseTo(arrangement.mediumSize, 0);
  expect(maskWidth(after + arrangement.mediumCount)).toBeCloseTo(arrangement.smallSize, 0);
});

// Public contract: item content (captions especially) tracks this to stay inside the
// visible crop instead of being sliced mid-word. Documented on the Carousel docs page.
test("exposes the live mask width as --md3-carousel-mask-size", async () => {
  const { masks, maskWidth } = renderCarousel();
  await waitFor(() => expect(maskWidth(0)).toBeGreaterThan(100));
  for (const [index, mask] of masks().entries()) {
    const published = mask.style.getPropertyValue("--md3-carousel-mask-size");
    expect(published).not.toBe("");
    expect(parseFloat(published)).toBeCloseTo(maskWidth(index), 0);
  }
});

test("masks stay within the viewport and never overlap", async () => {
  const { container, masks } = renderCarousel();
  const strip = container.querySelector<HTMLElement>(`.${styles.strip}`)!;
  await waitFor(() => expect(masks()[0]!.getBoundingClientRect().width).toBeGreaterThan(100));

  const stripRect = strip.getBoundingClientRect();
  const visible = masks()
    .map((m) => m.getBoundingClientRect())
    .filter((r) => r.right > stripRect.left + 1 && r.left < stripRect.right - 1);
  expect(visible.length).toBeGreaterThan(2);
  for (let i = 1; i < visible.length; i++) {
    // Keylines are laid end to end; a gap smaller than the spacing means they collided.
    expect(visible[i]!.left).toBeGreaterThanOrEqual(visible[i - 1]!.right - 0.5);
  }
});

test("arrow keys move the focal item and report the new index", async () => {
  const changes: number[] = [];
  const { container } = renderCarousel({ onValueChange: (v) => changes.push(v) });
  const tabs = container.querySelectorAll<HTMLElement>('[role="tab"]');

  tabs[0]!.focus();
  await userEvent.keyboard("{ArrowRight}");
  await waitFor(() => expect(changes.at(-1)).toBe(1));
  expect(tabs[1]!.getAttribute("aria-selected")).toBe("true");

  await userEvent.keyboard("{End}");
  await waitFor(() => expect(changes.at(-1)).toBe(7));
});

// Regression: arrow keys animated forwards but lurched the wrong way backwards — the
// strip jumped a whole pitch past the destination and then slid back, which reads as a
// forwards step. Base UI's composite scrolls its own root into view on every arrow key,
// measuring the item's offset from the nearest *positioned* ancestor rather than from the
// scroller, so an inset carousel aimed a pitch too far; the browser's own reveal-the-
// focused-tab scroll piled on top. The scroller now sits outside the tablist and the item
// scroll margin lines the browser's reveal up with our keyline.
test("arrow keys animate towards the keyline going backwards as well as forwards", async () => {
  // Inset so the strip is far from the page origin — that offset is what Base UI's
  // scroll-into-view used to add to its target.
  const { container } = renderCarousel({ inset: 600 });
  const strip = container.querySelector<HTMLElement>(`.${styles.strip}`)!;
  const list = container.querySelector<HTMLElement>('[role="tablist"]')!;
  // Base UI only scrolls its composite root when that root overflows.
  expect(list.parentElement).toBe(strip);
  expect(list.scrollWidth).toBe(list.clientWidth);

  await waitFor(() => expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth));
  const pitch =
    parseFloat(getComputedStyle(strip).getPropertyValue("--md3-carousel-item-size")) + 8;
  const trail = async (keys: string) => {
    const samples: number[] = [];
    await userEvent.keyboard(keys);
    for (let i = 0; i < 10; i++) {
      samples.push(Math.abs(strip.scrollLeft));
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    return samples;
  };

  container.querySelector<HTMLElement>('[role="tab"]')!.focus();
  const forwards = await trail("{ArrowRight}{ArrowRight}{ArrowRight}");
  // Overshooting the destination at any point means the strip travelled the wrong way.
  expect(Math.max(...forwards)).toBeLessThanOrEqual(3 * pitch + 1);
  await waitFor(() => expect(Math.abs(strip.scrollLeft)).toBeCloseTo(3 * pitch, 0));

  const backwards = await trail("{ArrowLeft}");
  expect(Math.min(...backwards)).toBeGreaterThanOrEqual(2 * pitch - 1);
  await waitFor(() => expect(Math.abs(strip.scrollLeft)).toBeCloseTo(2 * pitch, 0));
});

// The browser's reveal-the-focused-element scroll can't be prevented, so it is aimed
// instead: a trailing scroll margin of viewport - itemSize turns "bring this item into
// view" into "put this item on the leading keyline", so wherever it lands agrees with us.
test("item scroll margin aims the browser's reveal scroll at the keyline", async () => {
  const { container } = renderCarousel();
  const strip = container.querySelector<HTMLElement>(`.${styles.strip}`)!;
  await waitFor(() => expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth));

  const itemSize = parseFloat(getComputedStyle(strip).getPropertyValue("--md3-carousel-item-size"));
  const item = container.querySelector<HTMLElement>('[role="tab"]')!;
  const margin = parseFloat(getComputedStyle(item).scrollMarginRight);
  expect(margin).toBeCloseTo(VIEWPORT - itemSize - 1, 0);
  // A snap area wider than the scrollport relaxes mandatory snapping, which a touch fling
  // then settles out of — the margin has to stay under it, not merely near it.
  expect(margin + item.getBoundingClientRect().width).toBeLessThan(strip.clientWidth);
  // The reveal itself has to animate: it runs after all script for the keypress, so it
  // cannot be pre-empted or rewound out of sight.
  expect(getComputedStyle(strip).scrollBehavior).toBe("smooth");
});

// Regression: the ring sat 5px outside the mask (outline-offset: 2px), but the strip
// clips on both axes and the focal mask is flush with its leading edge, so the ring was
// sliced off top and bottom. It has to paint inward to survive.
test("focus ring paints inside the mask so the scroll container can't clip it", async () => {
  const { container } = renderCarousel();
  const strip = container.querySelector<HTMLElement>(`.${styles.strip}`)!;
  const tabs = container.querySelectorAll<HTMLElement>('[role="tab"]');

  tabs[0]!.focus();
  await userEvent.keyboard("{ArrowRight}");
  const focused = container.querySelector<HTMLElement>('[role="tab"]:focus-visible');
  expect(focused).not.toBeNull();

  const ring = getComputedStyle(focused!.querySelector<HTMLElement>(`.${styles.mask}`)!);
  expect(parseFloat(ring.outlineWidth)).toBeGreaterThan(0);
  expect(parseFloat(ring.outlineOffset)).toBeLessThan(0);
  // The strip clips on both axes — which is exactly why the ring must be inward.
  expect(getComputedStyle(strip).overflowY).toBe("hidden");
});

test("clicking an item makes it focal and scrolls it to the leading keyline", async () => {
  const { container, getByTestId } = renderCarousel();
  const strip = container.querySelector<HTMLElement>(`.${styles.strip}`)!;
  await waitFor(() => expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth));

  await userEvent.click(getByTestId("item-2"));
  await waitFor(() => {
    const stripRect = strip.getBoundingClientRect();
    const mask = getByTestId("item-2").querySelector<HTMLElement>(`.${styles.mask}`)!;
    expect(mask.getBoundingClientRect().left).toBeCloseTo(stripRect.left, 0);
  });
});

test("center-aligned hero centers the focal mask in the viewport", async () => {
  const { container, getByTestId } = renderCarousel({
    layout: "center-aligned-hero",
    defaultValue: 3,
  });
  const strip = container.querySelector<HTMLElement>(`.${styles.strip}`)!;
  await waitFor(() => {
    const stripRect = strip.getBoundingClientRect();
    const mask = getByTestId("item-3").querySelector<HTMLElement>(`.${styles.mask}`)!;
    const rect = mask.getBoundingClientRect();
    expect(rect.left + rect.width / 2).toBeCloseTo(stripRect.left + stripRect.width / 2, 0);
  });
});

// Regression: the mask transform used to sit on the item, which is also what carries
// `scroll-snap-align`. A transform moves an element's snap area, so painting dragged the
// snap points around and the strip settled off-keyline (worst under center-aligned hero,
// where the whole body is offset). The item box must stay untransformed.
test("mask paint never moves the item's scroll-snap area", async () => {
  const { container, getByTestId } = renderCarousel({
    layout: "center-aligned-hero",
    defaultValue: 2,
  });
  const strip = container.querySelector<HTMLElement>(`.${styles.strip}`)!;

  await waitFor(() => {
    const mask = getByTestId("item-2").querySelector<HTMLElement>(`.${styles.mask}`)!;
    expect(mask.style.transform).not.toBe("");
  });
  for (const tab of container.querySelectorAll<HTMLElement>('[role="tab"]')) {
    expect(getComputedStyle(tab).transform).toBe("none");
  }

  // Snap points are one uniform pitch apart, so the settled offset is exactly index * pitch.
  const itemSize = parseFloat(getComputedStyle(strip).getPropertyValue("--md3-carousel-item-size"));
  await waitFor(() => expect(Math.abs(strip.scrollLeft)).toBeCloseTo(2 * (itemSize + 8), 0));
});

test("full-screen masks one item across the whole viewport", async () => {
  const { maskWidth } = renderCarousel({ layout: "full-screen" });
  await waitFor(() => expect(maskWidth(0)).toBeCloseTo(VIEWPORT, 0));
});

// RTL flips the leading edge, so the focal mask must land on the right.
test("rtl anchors the focal mask to the right edge of the strip", async () => {
  const { container, getByTestId } = renderCarousel({ dir: "rtl" });
  const strip = container.querySelector<HTMLElement>(`.${styles.strip}`)!;
  await waitFor(() => {
    const stripRect = strip.getBoundingClientRect();
    const mask = getByTestId("item-0").querySelector<HTMLElement>(`.${styles.mask}`)!;
    expect(mask.getBoundingClientRect().right).toBeCloseTo(stripRect.right, 0);
  });
});
