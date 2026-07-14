import { DirectionProvider } from "@base-ui/react/direction-provider";
import { render, waitFor } from "@testing-library/react";
import { page } from "vitest/browser";
import * as React from "react";
import { expect, test } from "vitest";
import { SnackbarProvider } from "./Snackbar";
import styles from "./Snackbar.module.css";
import { useSnackbar } from "./useSnackbar";

function ShowOnMount({ message }: { message: string }) {
  const { showSnackbar } = useSnackbar();
  // Guarded: showSnackbar's identity changes with the toast list, so an
  // effect keyed on it would re-add the toast forever.
  const shown = React.useRef(false);
  React.useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    showSnackbar(message);
  }, [showSnackbar, message]);
  return null;
}

async function shownSnackbar(direction: "ltr" | "rtl", message: string) {
  render(
    <DirectionProvider direction={direction}>
      <SnackbarProvider>
        <ShowOnMount message={message} />
      </SnackbarProvider>
    </DirectionProvider>,
  );
  return await waitFor(() => {
    const el = [...document.querySelectorAll(`.${styles.root}`)].find((root) =>
      root.textContent?.includes(message),
    );
    expect(el).not.toBeUndefined();
    return el as HTMLElement;
  });
}

// Regression: the viewport portals to document.body, outside a scoped
// DirectionProvider's DOM, and the card centered with a physical
// translateX(-50%) — in RTL it stayed anchored bottom-left (and would
// mis-center on compact). Wide screens anchor to the leading edge:
// 8px from the left in LTR, 8px from the right in RTL.
test("anchors to the leading edge per direction on wide viewports", async () => {
  await page.viewport(800, 600);
  const ltr = await shownSnackbar("ltr", "saved ltr");
  expect(ltr.getBoundingClientRect().left).toBeCloseTo(8, 0);

  const rtl = await shownSnackbar("rtl", "saved rtl");
  expect(window.innerWidth - rtl.getBoundingClientRect().right).toBeCloseTo(8, 0);
});

// Compact screens: full-width card, centered regardless of direction.
test("stays centered on compact viewports in RTL", async () => {
  await page.viewport(400, 600);
  const root = await shownSnackbar("rtl", "saved compact");
  const rect = root.getBoundingClientRect();
  expect(rect.left).toBeCloseTo(8, 0);
  expect(window.innerWidth - rect.right).toBeCloseTo(8, 0);
});
