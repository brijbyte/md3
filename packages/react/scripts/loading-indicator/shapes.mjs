// The 8 MaterialShapes.kt recipes needed by MD3's LoadingIndicator, transcribed
// verbatim (numeric literals) from androidx.compose.material3.MaterialShapes.
import {
  circlePolygon,
  cornerRounding,
  customPolygon,
  normalizePolygon,
  polygonApproxBounds,
  polygonMaxBounds,
  rotatePolygonDegrees,
  scalePolygon,
  starPolygon,
  Unrounded,
} from "./geometry.mjs";

export const buildSoftBurst = () =>
  normalizePolygon(
    customPolygon(
      [
        { x: 0.193, y: 0.277, r: cornerRounding(0.053) },
        { x: 0.176, y: 0.055, r: cornerRounding(0.053) },
      ],
      10,
    ),
  );

export const buildCookie9Sided = () =>
  normalizePolygon(
    rotatePolygonDegrees(starPolygon(9, 1, 0.8, cornerRounding(0.5), null, 0, 0), -90),
  );

export const buildPentagon = () =>
  normalizePolygon(
    customPolygon(
      [
        { x: 0.5, y: -0.009, r: cornerRounding(0.172) },
        { x: 1.03, y: 0.365, r: cornerRounding(0.164) },
        { x: 0.828, y: 0.97, r: cornerRounding(0.169) },
      ],
      1,
      0.5,
      0.5,
      true,
    ),
  );

export const buildPill = () =>
  normalizePolygon(
    customPolygon(
      [
        { x: 0.961, y: 0.039, r: cornerRounding(0.426) },
        { x: 1.001, y: 0.428, r: Unrounded },
        { x: 1.0, y: 0.609, r: cornerRounding(1.0) },
      ],
      2,
      0.5,
      0.5,
      true,
    ),
  );

export const buildSunny = () =>
  normalizePolygon(starPolygon(8, 1, 0.8, cornerRounding(0.15), null, 0, 0));

export const buildCookie4Sided = () =>
  normalizePolygon(
    customPolygon(
      [
        { x: 1.237, y: 1.236, r: cornerRounding(0.258) },
        { x: 0.5, y: 0.918, r: cornerRounding(0.233) },
      ],
      4,
    ),
  );

export const buildOval = () =>
  normalizePolygon(rotatePolygonDegrees(scalePolygon(circlePolygon(8, 1, 0, 0), 1, 0.64), -45));

export const INDETERMINATE_SEQUENCE = () => [
  buildSoftBurst(),
  buildCookie9Sided(),
  buildPentagon(),
  buildPill(),
  buildSunny(),
  buildCookie4Sided(),
  buildOval(),
];

// LoadingIndicatorTokens.kt / LoadingIndicatorDefaults
export const CONTAINER_SIZE = 48;
export const ACTIVE_INDICATOR_SIZE = 38;
export const ACTIVE_INDICATOR_SCALE = ACTIVE_INDICATOR_SIZE / CONTAINER_SIZE;

/** calculateScaleFactor(indicatorPolygons) from LoadingIndicator.kt. */
export function scaleFactorForSequence(polygons) {
  let scaleFactor = 1;
  for (const p of polygons) {
    const bounds = polygonApproxBounds(p);
    const maxBounds = polygonMaxBounds(p);
    const scaleX = (bounds.right - bounds.left) / (maxBounds.right - maxBounds.left);
    const scaleY = (bounds.bottom - bounds.top) / (maxBounds.bottom - maxBounds.top);
    scaleFactor = Math.min(scaleFactor, Math.max(scaleX, scaleY));
  }
  return scaleFactor;
}
