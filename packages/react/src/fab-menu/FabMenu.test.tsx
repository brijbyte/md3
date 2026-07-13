import { fireEvent, render, waitFor } from "@testing-library/react";
import { expect, test } from "vitest";
// Resolves --md-sys-* so size/shape assertions see real values.
import "../generated/tokens.css";
import { FabMenu, FabMenuContent, FabMenuItem, FabMenuTrigger } from "./FabMenu";

function renderLargeFabMenu() {
  return render(
    <FabMenu>
      <FabMenuTrigger
        size="large"
        aria-label="Edit"
        icon={<svg viewBox="0 0 24 24" aria-hidden />}
      />
      <FabMenuContent>
        <FabMenuItem>One</FabMenuItem>
        <FabMenuItem>Two</FabMenuItem>
      </FabMenuContent>
    </FabMenu>,
  );
}

// Opens with mousedown only (no release) so Base UI's once-per-press document
// mouseup listener is still armed, then waits out the 350ms container morph.
async function pressAndMorph(trigger: HTMLElement) {
  fireEvent.mouseDown(trigger, { button: 0 });
  await waitFor(() => expect(document.querySelector('[role="menu"]')).not.toBeNull());
  await new Promise((resolve) => setTimeout(resolve, 450));
}

test("trigger keeps the FAB footprint while the surface morphs to 56dp", async () => {
  const { getByRole } = renderLargeFabMenu();
  const trigger = getByRole("button", { name: "Edit" });
  await pressAndMorph(trigger);

  const rect = trigger.getBoundingClientRect();
  expect(rect.width).toBe(96);
  expect(rect.height).toBe(96);

  // The morphing visual surface is the trigger's only child span.
  const surface = trigger.firstElementChild!;
  const surfaceRect = surface.getBoundingClientRect();
  expect(surfaceRect.width).toBe(56);
  expect(surfaceRect.height).toBe(56);
  // Close button shares the FAB's top-trailing corner (LTR: top-right).
  expect(surfaceRect.top).toBe(rect.top);
  expect(surfaceRect.right).toBe(rect.right);
});

// Regression: the menu opens on press and the FAB shrinks toward its
// top-trailing corner under the pointer. Base UI validates the release point
// against the trigger's rect, so a press held past the morph and released at
// the FAB's far (bottom-start) corner must not read as an outside dismissal.
test("press released at the FAB's far corner after the morph keeps the menu open", async () => {
  const { getByRole } = renderLargeFabMenu();
  const trigger = getByRole("button", { name: "Edit" });
  await pressAndMorph(trigger);

  const rect = trigger.getBoundingClientRect();
  fireEvent.mouseUp(document.body, { clientX: rect.left + 4, clientY: rect.bottom - 4 });

  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(document.querySelector('[role="menu"]')).not.toBeNull();
});

test("press released away from the FAB dismisses the menu", async () => {
  const { getByRole } = renderLargeFabMenu();
  const trigger = getByRole("button", { name: "Edit" });
  await pressAndMorph(trigger);

  const rect = trigger.getBoundingClientRect();
  fireEvent.mouseUp(document.body, { clientX: rect.right + 200, clientY: rect.bottom + 200 });

  await waitFor(() => expect(document.querySelector('[role="menu"]')).toBeNull());
});
