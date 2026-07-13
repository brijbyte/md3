import { DirectionProvider } from "@base-ui/react/direction-provider";
import { render, waitFor } from "@testing-library/react";
import { expect, test } from "vitest";
import { SideSheet, SideSheetContent } from "./SideSheet";

// Regression: the offscreen slide offset was flipped by a :dir(rtl) rule; bundlers
// lower :dir() to a :lang() list that ignores the dir attribute, so the RTL sheet
// animated in from the wrong edge. The physical edge is now resolved in JS
// (data-edge) and also drives Base UI's physical swipeDirection.
async function openSheet(direction: "ltr" | "rtl") {
  render(
    <DirectionProvider direction={direction}>
      <SideSheet open>
        <SideSheetContent>content</SideSheetContent>
      </SideSheet>
    </DirectionProvider>,
  );
  await waitFor(() => expect(document.querySelector("[data-edge]")).not.toBeNull());
  return document.querySelector<HTMLElement>("[data-edge]")!;
}

test("anchor=right docks at the right edge and slides in from it in LTR", async () => {
  const popup = await openSheet("ltr");
  expect(popup.dataset.edge).toBe("right");
  expect(getComputedStyle(popup).getPropertyValue("--_offscreen-x").trim()).toBe("100%");
  const rect = popup.getBoundingClientRect();
  expect(rect.right).toBeCloseTo(window.innerWidth, 0);
});

test("anchor=right resolves to the left edge and slides in from it in RTL", async () => {
  const popup = await openSheet("rtl");
  expect(popup.dataset.edge).toBe("left");
  expect(getComputedStyle(popup).getPropertyValue("--_offscreen-x").trim()).toBe("-100%");
  const rect = popup.getBoundingClientRect();
  expect(rect.left).toBeCloseTo(0, 0);
});
