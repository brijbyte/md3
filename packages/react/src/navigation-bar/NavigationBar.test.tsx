import { render } from "@testing-library/react";
import { expect, test } from "vitest";
// Geometry depends on the generated size/shape tokens.
import "../generated/tokens.css";
import { NavigationBar, NavigationBarItem, type NavigationBarProps } from "./NavigationBar";
import styles from "./NavigationBar.module.css";

function renderBar(props?: Partial<NavigationBarProps> & { count?: number }) {
  const { count = 3, ...rest } = props ?? {};
  const utils = render(
    <div style={{ width: 600 }}>
      <NavigationBar {...rest}>
        {Array.from({ length: count }, (_, i) => (
          <NavigationBarItem
            key={i}
            icon={<svg />}
            label={`Item ${i}`}
            active={i === 0}
            data-testid={`item-${i}`}
          />
        ))}
      </NavigationBar>
    </div>,
  );
  return { ...utils, bar: utils.container.querySelector<HTMLElement>("nav")! };
}

test("bar is 64px tall and vertical items carry a 56x32 indicator pill", () => {
  const { bar } = renderBar();
  expect(bar.getBoundingClientRect().height).toBe(64);
  const pill = bar.querySelector<HTMLElement>(`.${styles.indicator}`)!;
  const rect = pill.getBoundingClientRect();
  expect(rect.width).toBe(56);
  expect(rect.height).toBe(32);
});

test("label sits 4px below the indicator pill", () => {
  const { bar } = renderBar();
  const pill = bar.querySelector<HTMLElement>(`.${styles.indicator}`)!;
  const label = bar.querySelector<HTMLElement>(`.${styles.label}`)!;
  expect(label.getBoundingClientRect().top - pill.getBoundingClientRect().bottom).toBe(4);
});

test("start icon position lays the label inside a 40px pill", () => {
  const { container } = render(
    <NavigationBar>
      <NavigationBarItem icon={<svg />} label="News" iconPosition="start" />
    </NavigationBar>,
  );
  const pill = container.querySelector<HTMLElement>(`.${styles.indicator}`)!;
  expect(pill.getBoundingClientRect().height).toBe(40);
  expect(pill.querySelector(`.${styles.label}`)).not.toBeNull();
});

const fillOpacity = (item: HTMLElement) =>
  getComputedStyle(item.querySelector(`.${styles.indicator}`)!, "::before").opacity;

test("active item announces aria-current and shows the indicator fill", () => {
  const { getByTestId } = renderBar();
  const active = getByTestId("item-0");
  const inactive = getByTestId("item-1");
  expect(active.getAttribute("aria-current")).toBe("page");
  expect(inactive.hasAttribute("aria-current")).toBe(false);
  expect(fillOpacity(active)).toBe("1");
  expect(fillOpacity(inactive)).toBe("0");
});

test("centered arrangement insets items per item count", () => {
  // 4 items → 15% padding each side → items span 70% of the 600px bar.
  const { bar } = renderBar({ arrangement: "centered", count: 4 });
  const items = bar.querySelectorAll<HTMLElement>("button");
  const first = items[0].getBoundingClientRect();
  const last = items[items.length - 1].getBoundingClientRect();
  expect(first.left - bar.getBoundingClientRect().left).toBeCloseTo(90, 0);
  expect(last.right - first.left).toBeCloseTo(420, 0);
});
