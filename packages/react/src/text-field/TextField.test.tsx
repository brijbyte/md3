import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { TextField } from "./TextField";

const raf = () => new Promise((r) => requestAnimationFrame(() => r(null)));
const LeadingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
    <path d="M0 0h24v24H0z" />
  </svg>
);

// The outline notch is the fieldset's <legend>; the floated <label> must sit inside it.
const notchDelta = (container: HTMLElement) => {
  const label = container.querySelector("label")!;
  const legend = container.querySelector("legend")!;
  return Math.abs(label.getBoundingClientRect().left - legend.getBoundingClientRect().left);
};

// Regression: a leadingIcon shifts the resting label right of the icon, so the outline
// notch has to shift with it — otherwise the floated label struck through the border
// (~36px gap between label and notch) instead of sitting in the cut-out.
test("outlined leading-icon label sits in the outline notch", async () => {
  const { container } = render(
    <TextField variant="outlined" label="Search" leadingIcon={<LeadingIcon />} defaultValue="x" />,
  );
  await raf();
  expect(notchDelta(container)).toBeLessThan(12);
});

// Guard the no-icon case the notch shift must not touch.
test("outlined label without a leading icon still aligns with the notch", async () => {
  const { container } = render(<TextField variant="outlined" label="Search" defaultValue="x" />);
  await raf();
  expect(notchDelta(container)).toBeLessThan(12);
});
