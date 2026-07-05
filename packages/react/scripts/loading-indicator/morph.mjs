// JS port of androidx.graphics.shapes' Morph vertex-matching algorithm
// (Morph.kt, PolygonMeasure.kt, FeatureMapping.kt). Build-time only.
import {
  AngleEpsilon,
  DistanceEpsilon,
  allCubics,
  cubicPointOnCurve,
  cubicSplit,
  positiveModulo,
} from "./geometry.mjs";

const dist = (x, y) => Math.sqrt(x * x + y * y);
const LENGTH_SEGMENTS = 3;

function cubicArcLength(c) {
  let total = 0;
  let prev = [c[0], c[1]];
  for (let i = 1; i <= LENGTH_SEGMENTS; i++) {
    const pt = cubicPointOnCurve(c, i / LENGTH_SEGMENTS);
    total += dist(pt[0] - prev[0], pt[1] - prev[1]);
    prev = pt;
  }
  return total;
}

function cubicCutPointForLength(c, targetLength) {
  let remainder = targetLength;
  let prev = [c[0], c[1]];
  for (let i = 1; i <= LENGTH_SEGMENTS; i++) {
    const t = i / LENGTH_SEGMENTS;
    const pt = cubicPointOnCurve(c, t);
    const segment = dist(pt[0] - prev[0], pt[1] - prev[1]);
    if (segment >= remainder) return t - (1 - remainder / segment) / LENGTH_SEGMENTS;
    remainder -= segment;
    prev = pt;
  }
  return 1;
}

// Builds the filtered MeasuredCubic list: drops near-zero-length spans,
// forces the final entry's end to exactly 1 (PolygonMeasure.kt, MeasuredPolygon ctor).
function buildMeasuredCubics(rawList) {
  const result = [];
  let start = 0;
  for (const { cubic, end, measuredSize } of rawList) {
    if (end - start > DistanceEpsilon) {
      result.push({ cubic, start, end, measuredSize });
      start = end;
    }
  }
  if (result.length) result[result.length - 1].end = 1;
  return result;
}

export function measurePolygon(polygon) {
  const cubics = [];
  const featureToCubicIndex = [];
  for (const feature of polygon.features) {
    for (let ci = 0; ci < feature.cubics.length; ci++) {
      if (feature.type === "corner" && ci === Math.floor(feature.cubics.length / 2)) {
        featureToCubicIndex.push({ feature, index: cubics.length });
      }
      cubics.push(feature.cubics[ci]);
    }
  }
  const measures = [0];
  for (const c of cubics) measures.push(measures[measures.length - 1] + cubicArcLength(c));
  const total = measures[measures.length - 1];
  const outlineProgress = measures.map((m) => (total > 0 ? m / total : 0));

  const features = featureToCubicIndex.map(({ feature, index }) => ({
    progress: positiveModulo((outlineProgress[index] + outlineProgress[index + 1]) / 2, 1),
    feature,
  }));

  const rawList = cubics.map((cubic, i) => ({
    cubic,
    end: outlineProgress[i + 1],
    measuredSize: measures[i + 1] - measures[i],
  }));
  return { measuredCubics: buildMeasuredCubics(rawList), features };
}

function cutAtProgress(mc, cutProgress) {
  const bounded = Math.min(Math.max(cutProgress, mc.start), mc.end);
  const size = mc.end - mc.start;
  const relative = size > 0 ? (bounded - mc.start) / size : 0;
  const t = cubicCutPointForLength(mc.cubic, relative * mc.measuredSize);
  const [c1, c2] = cubicSplit(mc.cubic, t);
  return [
    { cubic: c1, start: mc.start, end: bounded, measuredSize: cubicArcLength(c1) },
    { cubic: c2, start: bounded, end: mc.end, measuredSize: cubicArcLength(c2) },
  ];
}

export function cutAndShift(measuredPolygon, cuttingPoint) {
  if (cuttingPoint < DistanceEpsilon) return measuredPolygon;
  const { measuredCubics, features } = measuredPolygon;
  const n = measuredCubics.length;
  const targetIndex = measuredCubics.findIndex(
    (mc) => cuttingPoint >= mc.start && cuttingPoint <= mc.end,
  );
  const [b1, b2] = cutAtProgress(measuredCubics[targetIndex], cuttingPoint);
  const ordered = [b2];
  for (let i = 1; i < n; i++) ordered.push(measuredCubics[(i + targetIndex) % n]);
  ordered.push(b1);
  // The last entry (b1) always closes exactly back to the cut point — force
  // its shifted end to 1 rather than letting it wrap to ~0 via modulo, which
  // would make the zero-length filter below drop it (PolygonMeasure.kt's
  // retOutlineProgress hardcodes this slot to 1 for the same reason).
  const rawList = ordered.map((mc, i) => ({
    cubic: mc.cubic,
    end: i === ordered.length - 1 ? 1 : positiveModulo(mc.end - cuttingPoint, 1),
    measuredSize: mc.measuredSize,
  }));
  const newFeatures = features.map((f) => ({
    progress: positiveModulo(f.progress - cuttingPoint, 1),
    feature: f.feature,
  }));
  return { measuredCubics: buildMeasuredCubics(rawList), features: newFeatures };
}

// ---- Feature matching (FeatureMapping.kt) ----

function featureRepresentativePoint(feature) {
  const first = feature.cubics[0];
  const last = feature.cubics[feature.cubics.length - 1];
  return [(first[0] + last[6]) / 2, (first[1] + last[7]) / 2];
}

function featureDistSq(f1, f2) {
  if (
    f1.feature.type === "corner" &&
    f2.feature.type === "corner" &&
    f1.feature.convex !== f2.feature.convex
  ) {
    return Infinity;
  }
  const [x1, y1] = featureRepresentativePoint(f1.feature);
  const [x2, y2] = featureRepresentativePoint(f2.feature);
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
}

const progressDistance = (p1, p2) => Math.min(Math.abs(p1 - p2), 1 - Math.abs(p1 - p2));
const progressInRange = (p, from, to) => (to >= from ? p >= from && p <= to : p >= from || p <= to);

function doMapping(features1, features2) {
  const list = [];
  for (const f1 of features1) {
    for (const f2 of features2) {
      const d = featureDistSq(f1, f2);
      if (Number.isFinite(d)) list.push({ d, f1, f2 });
    }
  }
  list.sort((a, b) => a.d - b.d);
  if (list.length === 0)
    return [
      [0, 0],
      [0.5, 0.5],
    ];
  if (list.length === 1) {
    const { f1, f2 } = list[0];
    return [
      [f1.progress, f2.progress],
      [positiveModulo(f1.progress + 0.5, 1), positiveModulo(f2.progress + 0.5, 1)],
    ];
  }
  const mapping = [];
  const usedF1 = new Set();
  const usedF2 = new Set();
  for (const { f1, f2 } of list) {
    if (usedF1.has(f1) || usedF2.has(f2)) continue;
    let lo = 0;
    let hi = mapping.length;
    let dup = false;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (mapping[mid][0] === f1.progress) {
        dup = true;
        break;
      }
      if (mapping[mid][0] < f1.progress) lo = mid + 1;
      else hi = mid;
    }
    if (dup) continue;
    const insertionIndex = lo;
    const n = mapping.length;
    if (n >= 1) {
      const before = mapping[(insertionIndex + n - 1) % n];
      const after = mapping[insertionIndex % n];
      if (
        progressDistance(f1.progress, before[0]) < DistanceEpsilon ||
        progressDistance(f1.progress, after[0]) < DistanceEpsilon ||
        progressDistance(f2.progress, before[1]) < DistanceEpsilon ||
        progressDistance(f2.progress, after[1]) < DistanceEpsilon
      ) {
        continue;
      }
      if (n > 1 && !progressInRange(f2.progress, before[1], after[1])) continue;
    }
    mapping.splice(insertionIndex, 0, [f1.progress, f2.progress]);
    usedF1.add(f1);
    usedF2.add(f2);
  }
  return mapping;
}

function linearMap(xValues, yValues, x) {
  const n = xValues.length;
  let segmentStart = n - 1;
  for (let i = 0; i < n; i++) {
    if (progressInRange(x, xValues[i], xValues[(i + 1) % n])) {
      segmentStart = i;
      break;
    }
  }
  const segmentEnd = (segmentStart + 1) % n;
  const segmentSizeX = positiveModulo(xValues[segmentEnd] - xValues[segmentStart], 1);
  const segmentSizeY = positiveModulo(yValues[segmentEnd] - yValues[segmentStart], 1);
  const positionInSegment =
    segmentSizeX < 0.001 ? 0.5 : positiveModulo(x - xValues[segmentStart], 1) / segmentSizeX;
  return positiveModulo(yValues[segmentStart] + segmentSizeY * positionInSegment, 1);
}

function buildDoubleMapper(mapping) {
  const sourceValues = mapping.map((m) => m[0]);
  const targetValues = mapping.map((m) => m[1]);
  return {
    map: (x) => linearMap(sourceValues, targetValues, x),
    mapBack: (x) => linearMap(targetValues, sourceValues, x),
  };
}

/** Returns a list of [cubicOnPolygon1, cubicOnPolygon2] pairs, index-aligned and equal-count. */
export function morphMatch(polygon1, polygon2) {
  const mp1 = measurePolygon(polygon1);
  const mp2 = measurePolygon(polygon2);
  const mapper = buildDoubleMapper(doMapping(mp1.features, mp2.features));
  const polygon2CutPoint = mapper.map(0);
  const bs1 = mp1.measuredCubics;
  const bs2 = cutAndShift(mp2, polygon2CutPoint).measuredCubics;

  const ret = [];
  let i1 = 1;
  let i2 = 1;
  let b1 = bs1[0];
  let b2 = bs2[0];
  while (b1 && b2) {
    const b1a = i1 === bs1.length ? 1 : b1.end;
    const b2a =
      i2 === bs2.length
        ? 1
        : positiveModulo(mapper.mapBack(positiveModulo(b2.end + polygon2CutPoint, 1)), 1);
    const minb = Math.min(b1a, b2a);

    let seg1;
    let newB1;
    if (b1a > minb + AngleEpsilon) {
      [seg1, newB1] = cutAtProgress(b1, minb);
    } else {
      seg1 = b1;
      newB1 = bs1[i1++];
    }

    let seg2;
    let newB2;
    if (b2a > minb + AngleEpsilon) {
      const cutLocal = positiveModulo(mapper.map(minb) - polygon2CutPoint, 1);
      [seg2, newB2] = cutAtProgress(b2, cutLocal);
    } else {
      seg2 = b2;
      newB2 = bs2[i2++];
    }

    ret.push([seg1.cubic, seg2.cubic]);
    b1 = newB1;
    b2 = newB2;
  }
  return ret;
}

export { allCubics };
