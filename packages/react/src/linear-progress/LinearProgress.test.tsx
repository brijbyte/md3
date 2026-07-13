import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { LinearProgress } from "./LinearProgress";

const raf = () => new Promise((r) => requestAnimationFrame(() => r(null)));

// Regression: the wavy geometry used to be supplied only through the CSS `d`
// property, which Safari/Firefox ignore -> the path drew nothing. Geometry must
// live on the `d` attribute so it renders in every engine.
test("wavy paths provide geometry via the d attribute", async () => {
  for (const props of [{}, { value: 50 }] as const) {
    const { container, unmount } = render(<LinearProgress wavy {...props} />);
    await raf();
    for (const path of container.querySelectorAll("path")) {
      expect(path.getAttribute("d")).toMatch(/^M/);
    }
    unmount();
  }
});

// Regression: the wavy SVG geometry ignored direction, so RTL still filled
// left-to-right. Compose rotates the whole RTL drawing 180° (a point-mirror);
// the CSS scale(-1) on the svg must reproduce that for both wavy modes.
test("wavy indicator mirrors in RTL", async () => {
  for (const props of [{}, { value: 50 }] as const) {
    const { container, unmount } = render(
      <div dir="rtl" style={{ width: 320 }}>
        <LinearProgress wavy {...props} />
      </div>,
    );
    await raf();
    const svg = container.querySelector("svg")!;
    expect(getComputedStyle(svg).transform).toBe("matrix(-1, 0, 0, -1, 0, 0)");
    unmount();
  }
});

// The determinate stop indicator is drawn at the geometric right edge; in RTL
// the mirror must land it at the visual left (the track's end).
test("wavy determinate stop indicator sits at the visual start edge in RTL", async () => {
  const { container } = render(
    <div dir="rtl" style={{ width: 320 }}>
      <LinearProgress wavy value={50} />
    </div>,
  );
  await raf();
  const svg = container.querySelector("svg")!;
  const stop = container.querySelector("circle")!;
  const offset = stop.getBoundingClientRect().left - svg.getBoundingClientRect().left;
  expect(offset).toBeLessThan(8);
});

// Pin every running animation to the same document-timeline position so the two
// indeterminate bars can be compared deterministically.
function syncAnimations(t: number) {
  for (const a of document.getAnimations()) {
    a.currentTime = t;
    a.pause();
  }
}

// Regression: the wavy indeterminate bars used to run on a JS requestAnimationFrame
// loop with their own performance.now() clock, drifting out of phase with the
// pure-CSS non-wavy bars. They must now be CSS-keyframe driven with the exact
// same head/tail envelope so both variants stay locked together.
test("wavy indeterminate is CSS-driven and shares the straight bar's envelope", async () => {
  const { container } = render(
    <div style={{ width: 320 }}>
      <LinearProgress aria-label="straight" />
      <LinearProgress aria-label="wavy" wavy />
    </div>,
  );
  await raf();
  await raf();

  const straightBars = container.querySelectorAll('span[class*="indeterminateBar"]');
  const paths = container.querySelectorAll("path");
  expect(straightBars.length).toBe(2);
  expect(paths.length).toBe(2);

  // No JS animation loop: the wavy bars must be animated by CSS keyframes.
  for (const path of paths) {
    expect(getComputedStyle(path).animationName).not.toBe("none");
  }

  syncAnimations(600);

  const rootWidth = 320;
  for (let i = 0; i < 2; i++) {
    const rect = straightBars[i].getBoundingClientRect();
    const containerRect = straightBars[i].parentElement!.getBoundingClientRect();
    const straightTail = (rect.left - containerRect.left) / rootWidth;
    const straightEnvelope = rect.width / rootWidth;

    const cs = getComputedStyle(paths[i]);
    const wavyTail = parseFloat(cs.getPropertyValue("--_tail"));
    const wavyEnvelope = parseFloat(cs.getPropertyValue("--_head")) - wavyTail;

    expect(wavyTail).toBeCloseTo(straightTail, 2);
    expect(wavyEnvelope).toBeCloseTo(straightEnvelope, 2);
  }
});
