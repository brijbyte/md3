import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { CircularProgress } from "./CircularProgress";

// Regression: the wavy indicator geometry used to be supplied only through the
// CSS `d` property, which Safari/Firefox ignore -> the path drew nothing. The
// geometry must live on the `d` attribute so it renders in every engine.
test("wavy indicator provides geometry via the d attribute", () => {
  for (const props of [{}, { value: 50 }] as const) {
    const { container, unmount } = render(<CircularProgress wavy {...props} />);
    const path = container.querySelector("path");
    expect(path).not.toBeNull();
    expect(path!.getAttribute("d")).toMatch(/^M/);
    unmount();
  }
});
