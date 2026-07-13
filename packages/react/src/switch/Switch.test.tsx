import { render } from "@testing-library/react";
import { expect, test } from "vitest";
// Geometry depends on the 2px track border, whose shorthand collapses without tokens.
import "../generated/tokens.css";
import { Switch } from "./Switch";

// Regression: the thumb was centered with a physical translate(-50%) plus a :dir(rtl)
// flip; bundlers lower :dir() to a :lang() list that ignores the dir attribute, so in
// RTL the checked thumb rendered outside the track. Positioning is now fully logical —
// assert the handle-center offset from the track's *start* edge in both directions.
function thumbCenterFromStart(dir: "ltr" | "rtl", checked: boolean) {
  const { container, unmount } = render(
    <div dir={dir}>
      <Switch aria-label="test" defaultChecked={checked} />
    </div>,
  );
  const root = container.querySelector<HTMLElement>('[role="switch"]')!;
  const thumb = root.querySelector("span")!;
  const rootRect = root.getBoundingClientRect();
  const thumbRect = thumb.getBoundingClientRect();
  const center = thumbRect.x + thumbRect.width / 2;
  const offset = dir === "rtl" ? rootRect.right - center : center - rootRect.x;
  unmount();
  return offset;
}

test("thumb centers at the spec offset from the track start edge in LTR and RTL", () => {
  // Spec: handle center 16px from the start edge unchecked, 36px checked.
  expect(thumbCenterFromStart("ltr", false)).toBeCloseTo(16, 0);
  expect(thumbCenterFromStart("ltr", true)).toBeCloseTo(36, 0);
  expect(thumbCenterFromStart("rtl", false)).toBeCloseTo(16, 0);
  expect(thumbCenterFromStart("rtl", true)).toBeCloseTo(36, 0);
});
