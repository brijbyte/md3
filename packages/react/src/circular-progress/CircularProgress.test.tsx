import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { CircularProgress } from "./CircularProgress";

// Regression: the wavy indicator geometry used to be supplied only through the
// CSS `d` property, which Safari/Firefox ignore -> the path drew nothing. The
// geometry must live on the `d` attribute so it renders in every engine.
// Regression: the track arc was only rendered in determinate mode, but the
// spec (Compose) draws it in indeterminate mode too, as the complement arc
// behind the sweeping indicator.
test("indeterminate renders the track", () => {
  const plain = render(<CircularProgress />);
  expect(plain.container.querySelectorAll("circle")).toHaveLength(2);
  plain.unmount();

  const wavy = render(<CircularProgress wavy />);
  expect(wavy.container.querySelectorAll("circle")).toHaveLength(1);
  expect(wavy.container.querySelector("path")).not.toBeNull();
});

test("wavy indicator provides geometry via the d attribute", () => {
  for (const props of [{}, { value: 50 }] as const) {
    const { container, unmount } = render(<CircularProgress wavy {...props} />);
    const path = container.querySelector("path");
    expect(path).not.toBeNull();
    expect(path!.getAttribute("d")).toMatch(/^M/);
    unmount();
  }
});
