export type Cubic = readonly number[];
export type MorphPair = readonly [Cubic, Cubic];
export type Morph = readonly MorphPair[];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Bakes a Morph + t (per-control-point lerp, matching androidx.graphics.shapes'
// Morph.asCubics) into a closed SVG path `d`. Both LoadingIndicator's shape
// sequence and CircularProgress's circle<->star morph are precomputed at build
// time (see scripts/build-*-shapes.mjs) so every t=0/1 endpoint already
// closes the loop exactly — a plain lerp + Z close needs no seam-snapping.
export function morphPathD(morph: Morph, t: number): string {
  const [firstStart, firstEnd] = morph[0];
  let d = `M${lerp(firstStart[0], firstEnd[0], t)},${lerp(firstStart[1], firstEnd[1], t)}`;
  for (const [cs, ce] of morph) {
    d += `C${lerp(cs[2], ce[2], t)},${lerp(cs[3], ce[3], t)} ${lerp(cs[4], ce[4], t)},${lerp(cs[5], ce[5], t)} ${lerp(cs[6], ce[6], t)},${lerp(cs[7], ce[7], t)}`;
  }
  return `${d}Z`;
}
