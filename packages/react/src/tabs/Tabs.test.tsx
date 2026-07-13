import { DirectionProvider } from "@base-ui/react/direction-provider";
import { render, waitFor } from "@testing-library/react";
import { expect, test } from "vitest";
import { Tab, TabList, Tabs } from "./Tabs";
import styles from "./Tabs.module.css";

function App({ dir }: { dir: "ltr" | "rtl" }) {
  return (
    <DirectionProvider direction={dir}>
      <div dir={dir} style={{ width: 480 }}>
        <Tabs defaultValue="flights">
          <TabList>
            <Tab value="explore">Explore</Tab>
            <Tab value="trips">Trips</Tab>
            <Tab value="flights">Flights</Tab>
          </TabList>
        </Tabs>
      </div>
    </DirectionProvider>
  );
}

// Regression: a direction flip repositions tabs without resizing them, so Base
// UI's ResizeObserver-driven indicator kept its stale LTR coordinates and sat
// under empty track. It must realign under the active tab after the flip.
test("indicator realigns under the active tab after a direction flip", async () => {
  const { container, rerender } = render(<App dir="ltr" />);
  const indicator = () => container.querySelector(`.${styles.indicator}`)!;
  const activeTab = () => container.querySelector("[data-active]")!;

  const withinActiveTab = () => {
    const tabRect = activeTab().getBoundingClientRect();
    const indRect = indicator().getBoundingClientRect();
    expect(indRect.width).toBeGreaterThan(0);
    expect(indRect.left).toBeGreaterThanOrEqual(tabRect.left - 1);
    expect(indRect.right).toBeLessThanOrEqual(tabRect.right + 1);
  };

  await waitFor(withinActiveTab);
  rerender(<App dir="rtl" />);
  await waitFor(withinActiveTab);
});
