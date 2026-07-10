import { render } from "@testing-library/react";
import { expect, test } from "vitest";
// @ts-expect-error
import "../generated/tokens.css";
import { IconButton } from "../icon-button";
import { Toolbar, ToolbarButton } from "./Toolbar";

const Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
    <path d="M0 0h24v24H0z" />
  </svg>
);

// Regression: 8px padding around 40px buttons left 12px above/below but only 8px
// beside, so the pill corner (radius 32) wasn't concentric with the button circle.
// Concentric requires corner radius = button radius + gap on both axes.
test("floating pill corner is concentric with its icon buttons", () => {
  const { getByRole } = render(
    <Toolbar variant="floating" aria-label="Actions">
      <ToolbarButton
        render={
          <IconButton aria-label="Archive">
            <Icon />
          </IconButton>
        }
      />
    </Toolbar>,
  );
  const toolbar = getByRole("toolbar").getBoundingClientRect();
  const button = getByRole("button").getBoundingClientRect();

  expect(toolbar.height).toBe(64);
  const gapLeft = button.left - toolbar.left;
  const gapTop = button.top - toolbar.top;
  expect(gapLeft).toBe(gapTop);
  // Corner-full clamps to height/2; concentric when that equals button radius + gap.
  expect(toolbar.height / 2).toBe(button.height / 2 + gapTop);
});
