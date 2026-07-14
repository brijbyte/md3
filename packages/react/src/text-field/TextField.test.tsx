import { DirectionProvider } from "@base-ui/react/direction-provider";
import { render } from "@testing-library/react";
import { userEvent } from "vitest/browser";
import { renderToString } from "react-dom/server";
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

// Regression: the RTL transform-origin flip used :dir(rtl), which bundlers lower to a
// :lang() list that ignores the dir attribute — the floated label kept scaling about
// its left edge and drifted toward the center, striking through the border instead of
// sitting in the notch. Direction is now resolved in JS (data-dir).
test("outlined floated label stays in the notch in RTL", async () => {
  const { container } = render(
    <div dir="rtl">
      <DirectionProvider direction="rtl">
        <TextField variant="outlined" label="Search" defaultValue="x" />
      </DirectionProvider>
    </div>,
  );
  await raf();
  expect(container.querySelector<HTMLElement>("[data-dir]")!.dataset.dir).toBe("rtl");
  const label = container.querySelector("label")!;
  const legend = container.querySelector("legend")!;
  const delta = Math.abs(
    label.getBoundingClientRect().right - legend.getBoundingClientRect().right,
  );
  expect(delta).toBeLessThan(12);
});

// Base UI only syncs the field's filled state in a layout effect, so without
// the mirrored attribute SSR paints the label resting and hydration animates
// it up. The server markup itself must already carry data-filled.
test("pre-filled field is filled in server-rendered markup", () => {
  const html = renderToString(<TextField label="Name" defaultValue="Ada" />);
  const root = new DOMParser().parseFromString(html, "text/html").body.firstElementChild!;
  expect(root.hasAttribute("data-filled")).toBe(true);
});

// The mirrored attribute must follow typing, not stick at the defaultValue.
test("clearing an uncontrolled field unfills it", async () => {
  const { container } = render(<TextField label="Name" defaultValue="Ada" />);
  const root = container.firstElementChild!;
  await raf();
  expect(root.hasAttribute("data-filled")).toBe(true);
  await userEvent.clear(container.querySelector("input")!);
  expect(root.hasAttribute("data-filled")).toBe(false);
});

test("clearing a controlled field unfills it", async () => {
  const { container, rerender } = render(
    <TextField label="Name" value="Ada" onChange={() => {}} />,
  );
  const root = container.firstElementChild!;
  await raf();
  expect(root.hasAttribute("data-filled")).toBe(true);
  rerender(<TextField label="Name" value="" onChange={() => {}} />);
  await raf();
  expect(root.hasAttribute("data-filled")).toBe(false);
});
