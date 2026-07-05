// Minimal JS port of androidx.graphics.shapes (RoundedPolygon construction) —
// ported line-for-line from the Kotlin sources under androidx/graphics/shapes/
// (Cubic.kt, RoundedPolygon.kt, Utils.kt). Build-time only: consumed by
// build-loading-indicator-shapes.mjs to precompute MD3 Loading Indicator morph
// keyframes. Points are [x, y] pairs; Cubics are flat 8-number arrays
// [a0x, a0y, c0x, c0y, c1x, c1y, a1x, a1y].

export const DistanceEpsilon = 1e-4;
export const AngleEpsilon = 1e-6;

const dist = (x, y) => Math.sqrt(x * x + y * y);
const dot = (x1, y1, x2, y2) => x1 * x2 + y1 * y2;
const clockwise = (x1, y1, x2, y2) => x1 * y2 - y1 * x2 > 0;
const lerp = (a, b, t) => a + (b - a) * t;
export const positiveModulo = (n, m) => ((n % m) + m) % m;

function directionVector(x, y) {
  const d = dist(x, y);
  if (d === 0) throw new Error("directionVector: zero-length vector");
  return [x / d, y / d];
}
const rotate90 = (x, y) => [-y, x];
const radialToCartesian = (radius, angle, cx = 0, cy = 0) => [
  Math.cos(angle) * radius + cx,
  Math.sin(angle) * radius + cy,
];

// ---- Cubic ops (Cubic.kt) ----

export function cubicPointOnCurve(c, t) {
  const u = 1 - t;
  const [a0x, a0y, c0x, c0y, c1x, c1y, a1x, a1y] = c;
  return [
    a0x * u ** 3 + c0x * 3 * t * u * u + c1x * 3 * t * t * u + a1x * t ** 3,
    a0y * u ** 3 + c0y * 3 * t * u * u + c1y * 3 * t * t * u + a1y * t ** 3,
  ];
}

export function cubicSplit(c, t) {
  const u = 1 - t;
  const [a0x, a0y, c0x, c0y, c1x, c1y, a1x, a1y] = c;
  const [px, py] = cubicPointOnCurve(c, t);
  const first = [
    a0x,
    a0y,
    a0x * u + c0x * t,
    a0y * u + c0y * t,
    a0x * u * u + c0x * 2 * u * t + c1x * t * t,
    a0y * u * u + c0y * 2 * u * t + c1y * t * t,
    px,
    py,
  ];
  const second = [
    px,
    py,
    c0x * u * u + c1x * 2 * u * t + a1x * t * t,
    c0y * u * u + c1y * 2 * u * t + a1y * t * t,
    c1x * u + a1x * t,
    c1y * u + a1y * t,
    a1x,
    a1y,
  ];
  return [first, second];
}

export const cubicReverse = (c) => [c[6], c[7], c[4], c[5], c[2], c[3], c[0], c[1]];

export function cubicTransform(c, fn) {
  const out = Array.from({ length: 8 });
  for (let i = 0; i < 8; i += 2) {
    const [x, y] = fn(c[i], c[i + 1]);
    out[i] = x;
    out[i + 1] = y;
  }
  return out;
}

export const straightLine = (x0, y0, x1, y1) => [
  x0,
  y0,
  lerp(x0, x1, 1 / 3),
  lerp(y0, y1, 1 / 3),
  lerp(x0, x1, 2 / 3),
  lerp(y0, y1, 2 / 3),
  x1,
  y1,
];

export function circularArc(cx, cy, x0, y0, x1, y1) {
  const [p0dx, p0dy] = directionVector(x0 - cx, y0 - cy);
  const [p1dx, p1dy] = directionVector(x1 - cx, y1 - cy);
  const [r0x, r0y] = rotate90(p0dx, p0dy);
  const [r1x, r1y] = rotate90(p1dx, p1dy);
  const cw = dot(r0x, r0y, x1 - cx, y1 - cy) >= 0;
  const cosa = dot(p0dx, p0dy, p1dx, p1dy);
  if (cosa > 0.999) return straightLine(x0, y0, x1, y1);
  const k =
    ((dist(x0 - cx, y0 - cy) * 4) / 3) *
    ((Math.sqrt(2 * (1 - cosa)) - Math.sqrt(1 - cosa * cosa)) / (1 - cosa)) *
    (cw ? 1 : -1);
  return [x0, y0, x0 + r0x * k, y0 + r0y * k, x1 - r1x * k, y1 - r1y * k, x1, y1];
}

// ---- CornerRounding (CornerRounding.kt) ----

export const Unrounded = { radius: 0, smoothing: 0 };
export const cornerRounding = (radius, smoothing = 0) => ({ radius, smoothing });

// ---- RoundedCorner (private helper class in RoundedPolygon.kt) ----

function buildRoundedCorner(p0, p1, p2, rounding) {
  const v01x = p0[0] - p1[0];
  const v01y = p0[1] - p1[1];
  const v21x = p2[0] - p1[0];
  const v21y = p2[1] - p1[1];
  const d01 = dist(v01x, v01y);
  const d21 = dist(v21x, v21y);
  let d1 = [0, 0];
  let d2 = [0, 0];
  let cornerRadius = 0;
  let smoothing = 0;
  let expectedRoundCut = 0;
  if (d01 > 0 && d21 > 0) {
    d1 = [v01x / d01, v01y / d01];
    d2 = [v21x / d21, v21y / d21];
    cornerRadius = rounding.radius;
    smoothing = rounding.smoothing;
    const cosAngle = dot(d1[0], d1[1], d2[0], d2[1]);
    const sinAngle = Math.sqrt(Math.max(0, 1 - cosAngle * cosAngle));
    expectedRoundCut = sinAngle > 1e-3 ? (cornerRadius * (cosAngle + 1)) / sinAngle : 0;
  }
  const expectedCut = (1 + smoothing) * expectedRoundCut;
  return { p0, p1, p2, d1, d2, cornerRadius, smoothing, expectedRoundCut, expectedCut };
}

function actualSmoothingValue(corner, allowedCut) {
  if (allowedCut > corner.expectedCut) return corner.smoothing;
  if (allowedCut > corner.expectedRoundCut) {
    return (
      (corner.smoothing * (allowedCut - corner.expectedRoundCut)) /
      (corner.expectedCut - corner.expectedRoundCut)
    );
  }
  return 0;
}

function lineIntersection(p0x, p0y, d0x, d0y, p1x, p1y, d1x, d1y) {
  const [r1x, r1y] = rotate90(d1x, d1y);
  const den = dot(d0x, d0y, r1x, r1y);
  if (Math.abs(den) < DistanceEpsilon) return null;
  const num = dot(p1x - p0x, p1y - p0y, r1x, r1y);
  if (Math.abs(den) < DistanceEpsilon * Math.abs(num)) return null;
  const k = num / den;
  return [p0x + d0x * k, p0y + d0y * k];
}

function computeFlankingCurve(
  actualRoundCut,
  smoothingValue,
  corner,
  sideStart,
  segA,
  segB,
  center,
  actualR,
) {
  const sdLen = dist(sideStart[0] - corner[0], sideStart[1] - corner[1]);
  const sdx = (sideStart[0] - corner[0]) / sdLen;
  const sdy = (sideStart[1] - corner[1]) / sdLen;
  const curveStart = [
    corner[0] + sdx * actualRoundCut * (1 + smoothingValue),
    corner[1] + sdy * actualRoundCut * (1 + smoothingValue),
  ];
  const midX = (segA[0] + segB[0]) / 2;
  const midY = (segA[1] + segB[1]) / 2;
  const px = lerp(segA[0], midX, smoothingValue);
  const py = lerp(segA[1], midY, smoothingValue);
  const [dvx, dvy] = directionVector(px - center[0], py - center[1]);
  const curveEnd = [center[0] + dvx * actualR, center[1] + dvy * actualR];
  const [tanx, tany] = rotate90(curveEnd[0] - center[0], curveEnd[1] - center[1]);
  const inter = lineIntersection(
    sideStart[0],
    sideStart[1],
    sdx,
    sdy,
    curveEnd[0],
    curveEnd[1],
    tanx,
    tany,
  );
  const anchorEnd = inter ?? [segA[0], segA[1]];
  const anchorStart = [
    (curveStart[0] + anchorEnd[0] * 2) / 3,
    (curveStart[1] + anchorEnd[1] * 2) / 3,
  ];
  return [
    curveStart[0],
    curveStart[1],
    anchorStart[0],
    anchorStart[1],
    anchorEnd[0],
    anchorEnd[1],
    curveEnd[0],
    curveEnd[1],
  ];
}

function roundedCornerGetCubics(corner, allowedCut0, allowedCut1) {
  const allowedCut = Math.min(allowedCut0, allowedCut1);
  if (
    corner.expectedRoundCut < DistanceEpsilon ||
    allowedCut < DistanceEpsilon ||
    corner.cornerRadius < DistanceEpsilon
  ) {
    return [straightLine(corner.p1[0], corner.p1[1], corner.p1[0], corner.p1[1])];
  }
  const actualRoundCut = Math.min(allowedCut, corner.expectedRoundCut);
  const smoothing0 = actualSmoothingValue(corner, allowedCut0);
  const smoothing1 = actualSmoothingValue(corner, allowedCut1);
  const actualR = (corner.cornerRadius * actualRoundCut) / corner.expectedRoundCut;
  const centerDistance = Math.sqrt(actualR * actualR + actualRoundCut * actualRoundCut);
  let ndx = corner.d1[0] + corner.d2[0];
  let ndy = corner.d1[1] + corner.d2[1];
  const ndLen = dist(ndx, ndy);
  ndx /= ndLen;
  ndy /= ndLen;
  const center = [corner.p1[0] + ndx * centerDistance, corner.p1[1] + ndy * centerDistance];
  const seg0 = [
    corner.p1[0] + corner.d1[0] * actualRoundCut,
    corner.p1[1] + corner.d1[1] * actualRoundCut,
  ];
  const seg2 = [
    corner.p1[0] + corner.d2[0] * actualRoundCut,
    corner.p1[1] + corner.d2[1] * actualRoundCut,
  ];
  const flanking0 = computeFlankingCurve(
    actualRoundCut,
    smoothing0,
    corner.p1,
    corner.p0,
    seg0,
    seg2,
    center,
    actualR,
  );
  const flanking2 = cubicReverse(
    computeFlankingCurve(
      actualRoundCut,
      smoothing1,
      corner.p1,
      corner.p2,
      seg2,
      seg0,
      center,
      actualR,
    ),
  );
  const arc = circularArc(
    center[0],
    center[1],
    flanking0[6],
    flanking0[7],
    flanking2[0],
    flanking2[1],
  );
  return [flanking0, arc, flanking2];
}

// ---- RoundedPolygon assembly (RoundedPolygon.kt §2.3-2.5) ----

/**
 * @param verts {[number, number][]} vertex list
 * @param roundingList {{radius:number, smoothing:number}[]} per-vertex CornerRounding
 * @param center {[number, number]|undefined} defaults to the vertex centroid
 */
export function buildRoundedPolygon(verts, roundingList, center) {
  const n = verts.length;
  const corners = verts.map((v, i) =>
    buildRoundedCorner(verts[(i - 1 + n) % n], v, verts[(i + 1) % n], roundingList[i]),
  );

  const cutAdjusts = [];
  for (let ix = 0; ix < n; ix++) {
    const c0 = corners[ix];
    const c1 = corners[(ix + 1) % n];
    const expectedRoundCut = c0.expectedRoundCut + c1.expectedRoundCut;
    const expectedCut = c0.expectedCut + c1.expectedCut;
    const sideSize = dist(
      verts[(ix + 1) % n][0] - verts[ix][0],
      verts[(ix + 1) % n][1] - verts[ix][1],
    );
    if (expectedRoundCut > sideSize) cutAdjusts.push([sideSize / expectedRoundCut, 0]);
    else if (expectedCut > sideSize)
      cutAdjusts.push([1, (sideSize - expectedRoundCut) / (expectedCut - expectedRoundCut)]);
    else cutAdjusts.push([1, 1]);
  }

  const cornerCubics = verts.map((_, i) => {
    const allowed = [0, 1].map((delta) => {
      const sideIndex = (i + n - 1 + delta) % n;
      const [roundCutRatio, cutRatio] = cutAdjusts[sideIndex];
      const corner = corners[i];
      return (
        corner.expectedRoundCut * roundCutRatio +
        (corner.expectedCut - corner.expectedRoundCut) * cutRatio
      );
    });
    return roundedCornerGetCubics(corners[i], allowed[0], allowed[1]);
  });

  const features = [];
  for (let i = 0; i < n; i++) {
    const prev = verts[(i - 1 + n) % n];
    const curr = verts[i];
    const next = verts[(i + 1) % n];
    const convex = clockwise(
      curr[0] - prev[0],
      curr[1] - prev[1],
      next[0] - curr[0],
      next[1] - curr[1],
    );
    features.push({ type: "corner", cubics: cornerCubics[i], convex });
    const last = cornerCubics[i][cornerCubics[i].length - 1];
    const nextFirst = cornerCubics[(i + 1) % n][0];
    features.push({
      type: "edge",
      cubics: [straightLine(last[6], last[7], nextFirst[0], nextFirst[1])],
    });
  }

  const cx = center ? center[0] : verts.reduce((s, v) => s + v[0], 0) / n;
  const cy = center ? center[1] : verts.reduce((s, v) => s + v[1], 0) / n;
  return { features, center: [cx, cy] };
}

export function allCubics(polygon) {
  const list = [];
  for (const f of polygon.features) for (const c of f.cubics) list.push(c);
  return list;
}

function approxBounds(cubics) {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const c of cubics) {
    for (let i = 0; i < 8; i += 2) {
      if (c[i] < left) left = c[i];
      if (c[i] > right) right = c[i];
      if (c[i + 1] < top) top = c[i + 1];
      if (c[i + 1] > bottom) bottom = c[i + 1];
    }
  }
  return { left, top, right, bottom };
}
export const polygonApproxBounds = (polygon) => approxBounds(allCubics(polygon));

export function polygonMaxBounds(polygon) {
  const [cx, cy] = polygon.center;
  let maxDistSq = 0;
  for (const c of allCubics(polygon)) {
    const dx0 = c[0] - cx;
    const dy0 = c[1] - cy;
    maxDistSq = Math.max(maxDistSq, dx0 * dx0 + dy0 * dy0);
    const [mx, my] = cubicPointOnCurve(c, 0.5);
    const dxm = mx - cx;
    const dym = my - cy;
    maxDistSq = Math.max(maxDistSq, dxm * dxm + dym * dym);
  }
  const maxDist = Math.sqrt(maxDistSq);
  return { left: cx - maxDist, top: cy - maxDist, right: cx + maxDist, bottom: cy + maxDist };
}

export function transformPolygon(polygon, fn) {
  const features = polygon.features.map((f) => ({
    ...f,
    cubics: f.cubics.map((c) => cubicTransform(c, fn)),
  }));
  const center = fn(polygon.center[0], polygon.center[1]);
  return { features, center };
}

export function normalizePolygon(polygon) {
  const b = polygonApproxBounds(polygon);
  const width = b.right - b.left;
  const height = b.bottom - b.top;
  const side = Math.max(width, height);
  const offsetX = (side - width) / 2 - b.left;
  const offsetY = (side - height) / 2 - b.top;
  return transformPolygon(polygon, (x, y) => [(x + offsetX) / side, (y + offsetY) / side]);
}

export function rotatePolygonDegrees(polygon, angleDeg) {
  const [cx, cy] = polygon.center;
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return transformPolygon(polygon, (x, y) => {
    const ox = x - cx;
    const oy = y - cy;
    return [ox * cos - oy * sin + cx, oy * cos + ox * sin + cy];
  });
}

export function scalePolygon(polygon, sx, sy) {
  return transformPolygon(polygon, (x, y) => [x * sx, y * sy]);
}

// ---- Shape construction helpers (Shapes.kt) ----

export function circlePolygon(numVertices = 8, radius = 1, cx = 0, cy = 0) {
  const theta = Math.PI / numVertices;
  const polygonRadius = radius / Math.cos(theta);
  const verts = [];
  for (let i = 0; i < numVertices; i++)
    verts.push(radialToCartesian(polygonRadius, (Math.PI / numVertices) * 2 * i, cx, cy));
  const rounding = cornerRounding(radius, 0);
  return buildRoundedPolygon(
    verts,
    verts.map(() => rounding),
    [cx, cy],
  );
}

export function starPolygon(
  numVerticesPerRadius,
  radius,
  innerRadius,
  rounding,
  innerRounding,
  cx = 0,
  cy = 0,
) {
  const n = numVerticesPerRadius;
  const verts = [];
  const roundingList = [];
  const innerR = innerRounding ?? rounding;
  for (let i = 0; i < n; i++) {
    verts.push(radialToCartesian(radius, (Math.PI / n) * 2 * i, cx, cy));
    roundingList.push(rounding);
    verts.push(radialToCartesian(innerRadius, (Math.PI / n) * (2 * i + 1), cx, cy));
    roundingList.push(innerR);
  }
  return buildRoundedPolygon(verts, roundingList, [cx, cy]);
}

function rotateDegreesAbout(x, y, angleDeg, cx, cy) {
  const a = (angleDeg * Math.PI) / 180;
  const ox = x - cx;
  const oy = y - cy;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return [ox * cos - oy * sin + cx, oy * cos + ox * sin + cy];
}

function doRepeat(points, reps, cx, cy, mirroring) {
  const result = [];
  if (!mirroring) {
    const np = points.length;
    for (let it = 0; it < np * reps; it++) {
      const src = points[it % np];
      const angle = Math.floor(it / np) * (360 / reps);
      const [x, y] = rotateDegreesAbout(src.x, src.y, angle, cx, cy);
      result.push({ x, y, r: src.r });
    }
    return result;
  }
  const angles = points.map((p) => (Math.atan2(p.y - cy, p.x - cx) * 180) / Math.PI);
  const distances = points.map((p) => dist(p.x - cx, p.y - cy));
  const actualReps = reps * 2;
  const sectionAngle = 360 / actualReps;
  for (let it = 0; it < actualReps; it++) {
    for (let index = 0; index < points.length; index++) {
      const i = it % 2 === 0 ? index : points.length - 1 - index;
      if (i > 0 || it % 2 === 0) {
        const aDeg =
          it % 2 === 0
            ? sectionAngle * it + angles[i]
            : sectionAngle * it + (sectionAngle - angles[i] + 2 * angles[0]);
        const a = (aDeg * Math.PI) / 180;
        result.push({
          x: Math.cos(a) * distances[i] + cx,
          y: Math.sin(a) * distances[i] + cy,
          r: points[i].r,
        });
      }
    }
  }
  return result;
}

/** @param pnr {{x:number,y:number,r?:{radius:number,smoothing:number}}[]} */
export function customPolygon(pnr, reps, cx = 0.5, cy = 0.5, mirroring = false) {
  const actual = doRepeat(pnr, reps, cx, cy, mirroring);
  const verts = actual.map((p) => [p.x, p.y]);
  const roundingList = actual.map((p) => p.r ?? Unrounded);
  return buildRoundedPolygon(verts, roundingList, [cx, cy]);
}
