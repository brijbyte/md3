/* Arrangement + keyline math ported from androidx.compose.material3.carousel
   (Arrangement.kt, Keylines.kt, androidx-main). Pure arithmetic — no DOM, no React. */

/** CarouselDefaults.MinSmallItemSize */
export const MIN_SMALL_ITEM_SIZE = 40;
/** CarouselDefaults.MaxSmallItemSize */
export const MAX_SMALL_ITEM_SIZE = 56;
/** CarouselDefaults.AnchorSize — the sliver an item collapses to at the viewport edge. */
export const ANCHOR_SIZE = 10;

const MEDIUM_LARGE_ITEM_DIFF_THRESHOLD = 0.85;
const MEDIUM_ITEM_FLEX_PERCENTAGE = 0.1;

export interface Arrangement {
  smallSize: number;
  smallCount: number;
  mediumSize: number;
  mediumCount: number;
  largeSize: number;
  largeCount: number;
  /** Permutation rank; feeds `cost` so earlier (more desirable) counts win ties. */
  priority: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function isValid(a: Arrangement): boolean {
  if (a.largeCount > 0 && a.smallCount > 0 && a.mediumCount > 0) {
    return a.largeSize > a.mediumSize && a.mediumSize > a.smallSize;
  }
  if (a.largeCount > 0 && a.smallCount > 0) {
    return a.largeSize > a.smallSize;
  }
  return true;
}

function cost(a: Arrangement, targetLargeSize: number): number {
  return isValid(a) ? Math.abs(targetLargeSize - a.largeSize) * a.priority : Number.MAX_VALUE;
}

export const arrangementItemCount = (a: Arrangement) => a.largeCount + a.mediumCount + a.smallCount;

/**
 * Solves `available = large*largeCount + ((large + small) / 2)*mediumCount + small*smallCount`
 * for the large size.
 */
function calculateLargeSize(
  availableSpace: number,
  smallCount: number,
  smallSize: number,
  mediumCount: number,
  largeCount: number,
): number {
  return (
    (availableSpace - (smallCount + mediumCount / 2) * smallSize) / (largeCount + mediumCount / 2)
  );
}

/** Adjusts small items first, then medium, and only then large, to fit `availableSpace`. */
function fit(options: {
  priority: number;
  availableSpace: number;
  itemSpacing: number;
  smallCount: number;
  smallSize: number;
  minSmallSize: number;
  maxSmallSize: number;
  mediumCount: number;
  mediumSize: number;
  largeCount: number;
  largeSize: number;
}): Arrangement {
  const {
    priority,
    availableSpace,
    itemSpacing,
    smallCount,
    minSmallSize,
    maxSmallSize,
    mediumCount,
    largeCount,
    largeSize,
  } = options;

  const totalItemCount = largeCount + mediumCount + smallCount;
  const availableSpaceWithoutSpacing = availableSpace - (totalItemCount - 1) * itemSpacing;
  let arrangedSmallSize = clamp(options.smallSize, minSmallSize, maxSmallSize);

  const totalSpaceTaken =
    largeSize * largeCount + options.mediumSize * mediumCount + arrangedSmallSize * smallCount;
  const delta = availableSpaceWithoutSpacing - totalSpaceTaken;
  if (smallCount > 0 && delta > 0) {
    arrangedSmallSize += Math.min(delta / smallCount, maxSmallSize - arrangedSmallSize);
  } else if (smallCount > 0 && delta < 0) {
    arrangedSmallSize += Math.max(delta / smallCount, minSmallSize - arrangedSmallSize);
  }
  if (smallCount === 0) {
    arrangedSmallSize = 0;
  }

  let arrangedLargeSize = calculateLargeSize(
    availableSpaceWithoutSpacing,
    smallCount,
    arrangedSmallSize,
    mediumCount,
    largeCount,
  );
  let arrangedMediumSize = (arrangedLargeSize + arrangedSmallSize) / 2;

  // Give the large items back some of their target size by flexing medium items.
  if (mediumCount > 0 && arrangedLargeSize !== largeSize) {
    const targetAdjustment = (largeSize - arrangedLargeSize) * largeCount;
    const availableMediumFlex = arrangedMediumSize * MEDIUM_ITEM_FLEX_PERCENTAGE * mediumCount;
    const distribute = Math.min(Math.abs(targetAdjustment), availableMediumFlex);
    if (targetAdjustment > 0) {
      arrangedMediumSize -= distribute / mediumCount;
      arrangedLargeSize += distribute / largeCount;
    } else {
      arrangedMediumSize += distribute / mediumCount;
      arrangedLargeSize -= distribute / largeCount;
    }
  }

  return {
    priority,
    smallSize: arrangedSmallSize,
    smallCount,
    mediumSize: arrangedMediumSize,
    mediumCount,
    largeSize: arrangedLargeSize,
    largeCount,
  };
}

export function findLowestCostArrangement(options: {
  availableSpace: number;
  itemSpacing: number;
  targetSmallSize: number;
  minSmallSize: number;
  maxSmallSize: number;
  smallCounts: number[];
  targetMediumSize: number;
  mediumCounts: number[];
  targetLargeSize: number;
  largeCounts: number[];
}): Arrangement | null {
  const { targetLargeSize } = options;
  let lowest: Arrangement | null = null;
  let priority = 1;

  for (const largeCount of options.largeCounts) {
    for (const mediumCount of options.mediumCounts) {
      for (const smallCount of options.smallCounts) {
        const arrangement = fit({
          priority,
          availableSpace: options.availableSpace,
          itemSpacing: options.itemSpacing,
          smallCount,
          smallSize: options.targetSmallSize,
          minSmallSize: options.minSmallSize,
          maxSmallSize: options.maxSmallSize,
          mediumCount,
          mediumSize: options.targetMediumSize,
          largeCount,
          largeSize: targetLargeSize,
        });
        if (lowest == null || cost(arrangement, targetLargeSize) < cost(lowest, targetLargeSize)) {
          lowest = arrangement;
          // Permutations come in priority order, so a cost of 0 is unbeatable.
          if (cost(lowest, targetLargeSize) === 0) {
            return lowest;
          }
        }
        priority++;
      }
    }
  }
  return lowest;
}

export function multiBrowseArrangement(options: {
  availableSpace: number;
  preferredItemSize: number;
  itemSpacing: number;
  itemCount: number;
  minSmallItemSize?: number;
  maxSmallItemSize?: number;
}): Arrangement | null {
  const {
    availableSpace,
    preferredItemSize,
    itemSpacing,
    itemCount,
    minSmallItemSize = MIN_SMALL_ITEM_SIZE,
    maxSmallItemSize = MAX_SMALL_ITEM_SIZE,
  } = options;
  if (availableSpace === 0 || preferredItemSize === 0) {
    return null;
  }

  let smallCounts = [1];
  const mediumCounts = [1, 0];

  const targetLargeSize = Math.min(preferredItemSize, availableSpace);
  // Small items aim for a third of the large size, clamped to the allowed range.
  const targetSmallSize = clamp(targetLargeSize / 3, minSmallItemSize, maxSmallItemSize);
  const targetMediumSize = (targetLargeSize + targetSmallSize) / 2;

  if (availableSpace < minSmallItemSize * 2) {
    smallCounts = [0];
  }

  const minAvailableLargeSpace =
    availableSpace -
    targetMediumSize * Math.max(...mediumCounts) -
    maxSmallItemSize * Math.max(...smallCounts);
  const minLargeCount = Math.max(1, Math.floor(minAvailableLargeSpace / targetLargeSize));
  const maxLargeCount = Math.ceil(availableSpace / targetLargeSize);
  const largeCounts = Array.from(
    { length: maxLargeCount - minLargeCount + 1 },
    (_, i) => maxLargeCount - i,
  );

  const base = {
    availableSpace,
    itemSpacing,
    targetSmallSize,
    minSmallSize: minSmallItemSize,
    maxSmallSize: maxSmallItemSize,
    targetMediumSize,
    targetLargeSize,
    largeCounts,
  };
  let arrangement = findLowestCostArrangement({ ...base, smallCounts, mediumCounts });

  // Fewer items than keyline positions — drop small, then medium, keeping one medium.
  if (arrangement != null && arrangementItemCount(arrangement) > itemCount) {
    let surplus = arrangementItemCount(arrangement) - itemCount;
    let smallCount = arrangement.smallCount;
    let mediumCount = arrangement.mediumCount;
    while (surplus > 0) {
      if (smallCount > 0) {
        smallCount -= 1;
      } else if (mediumCount > 1) {
        mediumCount -= 1;
      }
      surplus -= 1;
    }
    arrangement = findLowestCostArrangement({
      ...base,
      smallCounts: [smallCount],
      mediumCounts: [mediumCount],
    });
  }

  return arrangement;
}

export function heroArrangement(options: {
  availableSpace: number;
  maxItemSize: number | null;
  itemSpacing: number;
  itemCount: number;
  isCentered: boolean;
  minSmallItemSize?: number;
  maxSmallItemSize?: number;
}): { arrangement: Arrangement; centered: boolean } | null {
  const {
    availableSpace,
    maxItemSize,
    itemSpacing,
    itemCount,
    isCentered,
    minSmallItemSize = MIN_SMALL_ITEM_SIZE,
    maxSmallItemSize = MAX_SMALL_ITEM_SIZE,
  } = options;
  if (availableSpace === 0) {
    return null;
  }

  // Under 3 items there is nothing to flank the hero with, so fall back to start-aligned.
  const shouldCenter = isCentered && itemCount >= 3;

  // Centered arrangements need an even number of small items to stay symmetric.
  let smallCounts = itemCount <= 1 ? [0] : shouldCenter ? [2] : [1];

  const targetLargeSize = Math.min(maxItemSize ?? availableSpace, availableSpace);
  const targetSmallSize = clamp(targetLargeSize / 3, minSmallItemSize, maxSmallItemSize);

  // Needs room for the small items plus a large item at least 25% bigger than them.
  const fullscreenThreshold = minSmallItemSize * Math.max(...smallCounts) + minSmallItemSize * 1.25;
  if (availableSpace < fullscreenThreshold) {
    smallCounts = [0];
  }

  const minAvailableLargeSpace = availableSpace - minSmallItemSize * Math.max(...smallCounts);
  const minLargeCount = Math.max(1, Math.floor(minAvailableLargeSpace / targetLargeSize));
  const maxLargeCount = Math.ceil(availableSpace / targetLargeSize);
  const largeCounts = Array.from(
    { length: maxLargeCount - minLargeCount + 1 },
    (_, i) => maxLargeCount - i,
  );

  const arrangement = findLowestCostArrangement({
    availableSpace,
    itemSpacing,
    targetSmallSize,
    minSmallSize: minSmallItemSize,
    maxSmallSize: maxSmallItemSize,
    smallCounts,
    targetMediumSize: 0,
    mediumCounts: [0],
    targetLargeSize,
    largeCounts,
  });
  if (arrangement == null) {
    return null;
  }
  return { arrangement, centered: shouldCenter && itemCount >= arrangementItemCount(arrangement) };
}

/**
 * Picks a medium size that gets sufficiently cut off without looking like a large item.
 * Ported from Keylines.kt `calculateMediumChildSize`.
 */
export function calculateMediumChildSize(
  minimumMediumSize: number,
  largeItemSize: number,
  remainingSpace: number,
): number {
  // Ideally a third of the medium item is cut off, i.e. 1.5x the leftover space.
  let mediumItemSize = Math.max(remainingSpace * 1.5, minimumMediumSize);
  const largeItemThreshold = largeItemSize * MEDIUM_LARGE_ITEM_DIFF_THRESHOLD;
  if (mediumItemSize > largeItemThreshold) {
    // Too close to large — fall back to whichever is bigger: the threshold, or a 20% cut off.
    mediumItemSize = Math.min(Math.max(largeItemThreshold, remainingSpace * 1.2), largeItemSize);
  }
  return mediumItemSize;
}

export function uncontainedArrangement(options: {
  availableSpace: number;
  itemSize: number;
  itemSpacing: number;
}): Arrangement | null {
  const { availableSpace, itemSpacing } = options;
  const itemSize = Math.min(options.itemSize, availableSpace);
  if (availableSpace === 0 || itemSize === 0) {
    return null;
  }

  const pitch = itemSize + itemSpacing;
  const largeCount = Math.max(1, Math.floor((availableSpace + itemSpacing) / pitch));
  const remainingSpace = availableSpace - (largeCount * pitch - itemSpacing);
  const mediumCount = remainingSpace > itemSpacing ? 1 : 0;
  const mediumSize = calculateMediumChildSize(
    ANCHOR_SIZE,
    itemSize,
    Math.max(0, remainingSpace - itemSpacing),
  );

  return {
    priority: 1,
    smallSize: 0,
    smallCount: 0,
    mediumSize,
    mediumCount,
    largeSize: itemSize,
    largeCount,
  };
}

/**
 * Distance scrolled away from the leading edge, which `scrollLeft` counts backwards in RTL.
 * Stays signed on purpose: a scroller rubber-banding past its start reports an out-of-range
 * offset, and the keylines extrapolate through it. Taking the magnitude instead would mirror
 * the overscroll and send every mask the wrong way at twice the speed.
 */
export function leadingScroll(scrollLeft: number, isRtl: boolean): number {
  return isRtl ? -scrollLeft : scrollLeft;
}

export interface Slot {
  size: number;
  /** Leading edge of the slot, in px from the viewport's leading edge. */
  offset: number;
}

export interface KeylineList {
  slots: Slot[];
  /** Index into `slots` that the active item occupies when snapped. */
  focalIndex: number;
  /** Layout distance between consecutive items — every item is laid out at the large size. */
  pitch: number;
  itemSpacing: number;
}

function buildKeylines(
  sizes: number[],
  focalIndex: number,
  leadOffset: number,
  itemSpacing: number,
  largeSize: number,
): KeylineList {
  const slots: Slot[] = [];
  let offset = leadOffset;
  for (const size of sizes) {
    slots.push({ size, offset });
    offset += size + itemSpacing;
  }
  return { slots, focalIndex, pitch: largeSize + itemSpacing, itemSpacing };
}

/** Start-aligned: `[anchor, large…, medium…, small…, anchor]`, first large at offset 0. */
export function startAlignedKeylines(
  arrangement: Arrangement,
  itemSpacing: number,
  leftAnchorSize = ANCHOR_SIZE,
  rightAnchorSize = ANCHOR_SIZE,
): KeylineList {
  const sizes = [
    leftAnchorSize,
    ...Array<number>(arrangement.largeCount).fill(arrangement.largeSize),
    ...Array<number>(arrangement.mediumCount).fill(arrangement.mediumSize),
    ...Array<number>(arrangement.smallCount).fill(arrangement.smallSize),
    rightAnchorSize,
  ];
  return buildKeylines(
    sizes,
    1,
    -(leftAnchorSize + itemSpacing),
    itemSpacing,
    arrangement.largeSize,
  );
}

/** Center-aligned: small/medium items split evenly around the large block, centered in the viewport. */
export function centerAlignedKeylines(
  arrangement: Arrangement,
  availableSpace: number,
  itemSpacing: number,
  anchorSize = ANCHOR_SIZE,
): KeylineList {
  const halfSmall = Math.floor(arrangement.smallCount / 2);
  const halfMedium = Math.floor(arrangement.mediumCount / 2);
  const leading = [
    ...Array<number>(halfSmall).fill(arrangement.smallSize),
    ...Array<number>(halfMedium).fill(arrangement.mediumSize),
  ];
  const trailing = [
    ...Array<number>(halfMedium).fill(arrangement.mediumSize),
    ...Array<number>(halfSmall).fill(arrangement.smallSize),
  ];
  const body = [
    ...leading,
    ...Array<number>(arrangement.largeCount).fill(arrangement.largeSize),
    ...trailing,
  ];
  const bodyWidth = body.reduce((sum, s) => sum + s, 0) + itemSpacing * (body.length - 1);
  const bodyStart = (availableSpace - bodyWidth) / 2;

  const sizes = [anchorSize, ...body, anchorSize];
  // +1 for the leading anchor; the active item sits on the first large slot.
  return buildKeylines(
    sizes,
    1 + leading.length,
    bodyStart - (anchorSize + itemSpacing),
    itemSpacing,
    arrangement.largeSize,
  );
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Size and leading edge for an item sitting at continuous slot position `u`
 * (integral when snapped). Outside the keyline range the item keeps the anchor
 * size and keeps travelling, so off-screen items don't pile up at the edges.
 */
export function slotAt(keylines: KeylineList, u: number): Slot {
  const { slots, itemSpacing } = keylines;
  const last = slots.length - 1;
  if (u <= 0) {
    const first = slots[0]!;
    return { size: first.size, offset: first.offset + u * (first.size + itemSpacing) };
  }
  if (u >= last) {
    const end = slots[last]!;
    return { size: end.size, offset: end.offset + (u - last) * (end.size + itemSpacing) };
  }
  const i0 = Math.floor(u);
  const frac = u - i0;
  const a = slots[i0]!;
  const b = slots[i0 + 1]!;
  return { size: lerp(a.size, b.size, frac), offset: lerp(a.offset, b.offset, frac) };
}
