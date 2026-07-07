// Regression tests for the value-bubble / handle-interaction behaviour hardened in this
// session. Runs under vitest + @testing-library/react in a real browser (Playwright, no
// jsdom) — see vitest.config.ts. The :focus-visible / rAF spies below predate the browser
// runner and are now belt-and-suspenders (the real browser implements them natively).
//
// Covered here (JS-observable behaviour):
//   - value bubble shows on hover, and only for the hovered thumb (per-thumb)   [hover fix]
//   - bubble shows on keyboard focus but NOT on pointer focus (no stuck tooltip)
//   - bubble opens while Base UI reports a drag via `data-dragging` — this is how a *track*
//     click (which never touches the thumb) surfaces the bubble
//   - range: only the thumb actually moving (Base UI's `activeThumbIndex`) opens its bubble
//     and gets `data-active`; the other thumb stays closed even though Base UI flags
//     `data-dragging` on every thumb
//   - an idle open bubble schedules no requestAnimationFrame (positioning is MutationObserver
//     driven, not a per-frame poll)
//
// Not covered here (pure CSS / layout — verified visually, not in jsdom): rectangly track
// corner radius, the fixed 6px handle↔track gap, the 4px focus-ring inset, and the fact that
// hover keeps the handle at 4px while focus/press narrow it to 2px.

import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Slider } from "./Slider";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// The thumb's <div> carries Base UI's `data-index`; the focusable range input lives inside it.
const thumbOf = (input: Element) => input.closest("[data-index]") as HTMLElement;

describe("Slider value bubble", () => {
  it("shows the bubble on hover and hides it on leave", async () => {
    render(<Slider defaultValue={40} aria-label="volume" />);
    const thumb = thumbOf(screen.getByRole("slider"));

    expect(screen.queryByText("40")).toBeNull();
    fireEvent.pointerEnter(thumb);
    expect(await screen.findByText("40")).toBeTruthy();

    fireEvent.pointerLeave(thumb);
    await waitFor(() => expect(screen.queryByText("40")).toBeNull());
  });

  it("shows the bubble on keyboard focus but not on pointer focus (no stuck tooltip)", async () => {
    render(<Slider defaultValue={40} aria-label="volume" />);
    const input = screen.getByRole("slider");

    // The component gates the bubble on :focus-visible (true only for keyboard focus). jsdom
    // doesn't implement it, so drive it explicitly.
    const realMatches = Element.prototype.matches;
    let focusVisible = false;
    vi.spyOn(Element.prototype, "matches").mockImplementation(function (
      this: Element,
      selector: string,
    ) {
      return selector === ":focus-visible" ? focusVisible : realMatches.call(this, selector);
    });

    // Pointer-style focus: :focus-visible is false → bubble must stay closed and not stick.
    focusVisible = false;
    fireEvent.focus(input);
    await waitFor(() => expect(screen.queryByText("40")).toBeNull());

    // Keyboard focus: :focus-visible is true → bubble opens.
    fireEvent.blur(input);
    focusVisible = true;
    fireEvent.focus(input);
    expect(await screen.findByText("40")).toBeTruthy();

    // Blur closes it.
    fireEvent.blur(input);
    await waitFor(() => expect(screen.queryByText("40")).toBeNull());
  });

  it("opens the bubble while Base UI reports a drag (data-dragging) — e.g. a track click", async () => {
    render(<Slider defaultValue={40} aria-label="volume" />);
    const thumb = thumbOf(screen.getByRole("slider"));

    expect(screen.queryByText("40")).toBeNull();

    // A track click never fires the thumb's own pointer events; Base UI instead toggles
    // `data-dragging` on the thumb, which the component mirrors via a MutationObserver.
    await act(async () => {
      thumb.setAttribute("data-dragging", "");
    });
    expect(await screen.findByText("40")).toBeTruthy();

    await act(async () => {
      thumb.removeAttribute("data-dragging");
    });
    await waitFor(() => expect(screen.queryByText("40")).toBeNull());
  });
});

describe("Slider range", () => {
  it("scopes hover to the hovered thumb", async () => {
    render(<Slider defaultValue={[20, 80]} getAriaLabel={(i) => `thumb ${i}`} />);
    const [thumbA, thumbB] = screen.getAllByRole("slider").map(thumbOf);

    fireEvent.pointerEnter(thumbB);
    expect(await screen.findByText("80")).toBeTruthy();
    expect(screen.queryByText("20")).toBeNull();

    fireEvent.pointerLeave(thumbB);
    fireEvent.pointerEnter(thumbA);
    expect(await screen.findByText("20")).toBeTruthy();
    expect(screen.queryByText("80")).toBeNull();
  });

  it("opens the bubble and marks data-active only on the thumb actually moving", async () => {
    const onValueChange = vi.fn();
    render(
      <Slider
        defaultValue={[20, 80]}
        onValueChange={onValueChange}
        getAriaLabel={(i) => `thumb ${i}`}
      />,
    );
    const inputs = screen.getAllByRole("slider");
    const [thumbA, thumbB] = inputs.map(thumbOf);

    // Move the end thumb: Base UI reports the change with activeThumbIndex === 1, which the
    // parent records so it can scope the bubble/narrowing on a range slider.
    fireEvent.change(inputs[1], { target: { value: "60" } });
    await waitFor(() => expect(onValueChange).toHaveBeenCalled());

    // Base UI flags `data-dragging` on *every* thumb during any drag (it's root-level state).
    await act(async () => {
      thumbA.setAttribute("data-dragging", "");
      thumbB.setAttribute("data-dragging", "");
    });

    // Only the active (moving) thumb should react.
    await waitFor(() => expect(thumbB.hasAttribute("data-active")).toBe(true));
    expect(thumbA.hasAttribute("data-active")).toBe(false);
    expect(screen.queryByText("60")).not.toBeNull(); // active thumb's bubble
    expect(screen.queryByText("20")).toBeNull(); // inactive thumb's bubble stays closed
  });
});

describe("Slider bubble positioning", () => {
  it("does not poll with requestAnimationFrame while an open bubble is idle", async () => {
    const raf = vi.spyOn(window, "requestAnimationFrame");
    render(<Slider defaultValue={40} aria-label="volume" />);
    const thumb = thumbOf(screen.getByRole("slider"));

    fireEvent.pointerEnter(thumb);
    await screen.findByText("40");

    // With the thumb stationary, re-anchoring is driven by a MutationObserver on the thumb's
    // style — nothing should schedule an animation frame (the old rAF loop ran at 60fps for
    // the whole time the bubble was open, flickering the DOM).
    raf.mockClear();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(raf).not.toHaveBeenCalled();
  });
});
