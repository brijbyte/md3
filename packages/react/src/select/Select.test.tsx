import { DirectionProvider } from "@base-ui/react/direction-provider";
import { render, waitFor } from "@testing-library/react";
import { userEvent } from "vitest/browser";
import { renderToString } from "react-dom/server";
import { expect, test } from "vitest";
import textFieldStyles from "../text-field/TextField.module.css";
import { Select, SelectContent, SelectItem, SelectTrigger, type SelectProps } from "./Select";

const raf = () => new Promise((r) => requestAnimationFrame(() => r(null)));

const STATES = [
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
];

function renderSelect(props: Partial<SelectProps<string>> = {}) {
  return render(
    <Select items={STATES} {...props}>
      <SelectTrigger label="State" />
      <SelectContent>
        {STATES.map((state) => (
          <SelectItem key={state.value} value={state.value}>
            {state.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>,
  );
}

// The Field integration the trigger styling relies on: a selected value must
// mark the field root data-filled (floats the label) and show the item label.
test("selected value fills the field and renders the item label", async () => {
  const { container } = renderSelect({ defaultValue: "CA" });
  await raf();
  const root = container.firstElementChild!;
  expect(root.hasAttribute("data-filled")).toBe(true);
  expect(container.querySelector("button")!.textContent).toContain("California");
});

// Base UI only syncs the field's filled state in a layout effect, so without
// the mirrored attribute SSR paints the label resting and hydration animates
// it up. The server markup itself must already carry data-filled.
test("pre-selected value is filled in server-rendered markup", () => {
  const html = renderToString(
    <Select items={STATES} defaultValue="CA">
      <SelectTrigger label="State" />
    </Select>,
  );
  const root = new DOMParser().parseFromString(html, "text/html").body.firstElementChild!;
  expect(root.hasAttribute("data-filled")).toBe(true);
});

// The mirrored attribute must track a controlled value, not stick at mount.
test("clearing a controlled value unfills the field", async () => {
  const { container, rerender } = renderSelect({ value: "CA" });
  await raf();
  const root = container.firstElementChild!;
  expect(root.hasAttribute("data-filled")).toBe(true);
  rerender(
    <Select items={STATES} value={null}>
      <SelectTrigger label="State" />
      <SelectContent>
        {STATES.map((state) => (
          <SelectItem key={state.value} value={state.value}>
            {state.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>,
  );
  await raf();
  expect(root.hasAttribute("data-filled")).toBe(false);
});

test("empty select is not filled", async () => {
  const { container } = renderSelect();
  await raf();
  expect(container.firstElementChild!.hasAttribute("data-filled")).toBe(false);
});

// Spec: an open select shows the focused field treatment even though focus
// moves into the popup, and the menu drops below the trigger (never over it).
test("opening focuses the field and positions the menu below the trigger", async () => {
  const { container } = renderSelect({ defaultValue: "CO" });
  const trigger = container.querySelector("button")!;
  await userEvent.click(trigger);
  const listbox = await waitFor(() => {
    const popup = document.querySelector("[role='listbox']");
    expect(popup).not.toBeNull();
    return popup as HTMLElement;
  });
  expect(container.firstElementChild!.hasAttribute("data-focused")).toBe(true);
  await raf();
  expect(listbox.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    trigger.getBoundingClientRect().bottom,
  );
  // Selected row carries the checkmark indicator (guidelines' treatment).
  const selected = document.querySelector("[role='option'][data-selected]")!;
  expect(selected.textContent).toContain("Colorado");
  expect(selected.querySelector("svg")).not.toBeNull();
});

// The selection checkmark must not count as a leading icon for the menu's
// mixed-icon alignment rule, or unselected rows would shift on every change.
test("check indicator does not indent the unselected options", async () => {
  const { container } = renderSelect({ defaultValue: "CO" });
  await userEvent.click(container.querySelector("button")!);
  await waitFor(() => {
    expect(document.querySelector("[role='option'][data-selected]")).not.toBeNull();
  });
  const unselected = document.querySelector("[role='option']:not([data-selected])")!;
  expect(getComputedStyle(unselected).paddingInlineStart).toBe("12px");
});

test("choosing an option updates the value and closes the menu", async () => {
  const { container } = renderSelect();
  const trigger = container.querySelector("button")!;
  await userEvent.click(trigger);
  const option = await waitFor(() => {
    const item = [...document.querySelectorAll("[role='option']")].find(
      (el) => el.textContent === "Connecticut",
    );
    expect(item).not.toBeUndefined();
    return item as HTMLElement;
  });
  await userEvent.click(option);
  // The popup can stay mounted after close — assert via the trigger state.
  await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
  expect(trigger.textContent).toContain("Connecticut");
  // Close returns focus to the trigger, so the field stays focused.
  expect(document.activeElement).toBe(trigger);
});

// Same regression TextField guards: the floated label must sit inside the
// outline notch (the fieldset legend), here with the label as a span.
test("outlined trigger label sits in the outline notch", async () => {
  const { container } = renderSelect({ variant: "outlined", defaultValue: "CA" });
  await raf();
  const label = container.querySelector(`.${textFieldStyles.label}`)!;
  const legend = container.querySelector("legend")!;
  expect(
    Math.abs(label.getBoundingClientRect().left - legend.getBoundingClientRect().left),
  ).toBeLessThan(12);
});

// Regression: the popup portals to document.body, outside a scoped
// DirectionProvider's DOM — without the stamped dir it rendered LTR in RTL apps.
test("popup follows a scoped DirectionProvider's rtl direction", async () => {
  const { container } = render(
    <DirectionProvider direction="rtl">
      <Select items={STATES}>
        <SelectTrigger label="State" />
        <SelectContent>
          {STATES.map((state) => (
            <SelectItem key={state.value} value={state.value}>
              {state.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </DirectionProvider>,
  );
  await userEvent.click(container.querySelector("button")!);
  const popup = await waitFor(() => {
    const el = document.querySelector('[role="listbox"]');
    expect(el).not.toBeNull();
    return el as HTMLElement;
  });
  expect(getComputedStyle(popup).direction).toBe("rtl");
});
