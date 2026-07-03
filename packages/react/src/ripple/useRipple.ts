"use client";
import * as React from "react";

// Constants and behavior mirror material-web's ripple
// (ripple/internal/ripple.ts): grow from press point to center over 450ms,
// hold while pressed (min 225ms), fade out 375ms on release; touch waits
// 150ms to distinguish taps from scrolls.
const PRESS_GROW_MS = 450;
const MINIMUM_PRESS_MS = 225;
const INITIAL_ORIGIN_SCALE = 0.2;
const PADDING = 10;
const SOFT_EDGE_MINIMUM_SIZE = 75;
const SOFT_EDGE_CONTAINER_RATIO = 0.35;
const TOUCH_DELAY_MS = 150;
const EASING_STANDARD = "cubic-bezier(0.2, 0, 0, 1)";

export function useRipple() {
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const rippleRef = React.useRef<HTMLSpanElement | null>(null);
  const growAnimation = React.useRef<Animation | null>(null);

  const startPress = React.useCallback((x: number, y: number) => {
    const container = containerRef.current;
    if (!container) return;

    let ripple = rippleRef.current;
    if (!ripple) {
      ripple = document.createElement("span");
      ripple.className = "md3-ripple";
      container.appendChild(ripple);
      rippleRef.current = ripple;
    }

    const rect = container.getBoundingClientRect();
    const maxDim = Math.max(rect.width, rect.height);
    const softEdgeSize = Math.max(SOFT_EDGE_CONTAINER_RATIO * maxDim, SOFT_EDGE_MINIMUM_SIZE);
    const initialSize = Math.floor(maxDim * INITIAL_ORIGIN_SCALE);
    const maxRadius = Math.hypot(rect.width, rect.height) + PADDING;
    const scale = (maxRadius + softEdgeSize) / initialSize;

    const startX = x - rect.left - initialSize / 2;
    const startY = y - rect.top - initialSize / 2;
    const endX = (rect.width - initialSize) / 2;
    const endY = (rect.height - initialSize) / 2;

    // Snapshot the state color so the fade-out keeps the pressed color even
    // after :active clears (checkbox/radio flip their pressed color).
    ripple.style.color = getComputedStyle(container).color;
    ripple.style.width = `${initialSize}px`;
    ripple.style.height = `${initialSize}px`;

    growAnimation.current?.cancel();
    growAnimation.current = ripple.animate(
      {
        transform: [
          `translate(${startX}px, ${startY}px) scale(1)`,
          `translate(${endX}px, ${endY}px) scale(${scale})`,
        ],
      },
      {
        duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : PRESS_GROW_MS,
        easing: EASING_STANDARD,
        fill: "forwards",
      },
    );
    ripple.dataset.pressed = "";
  }, []);

  const endPress = React.useCallback(() => {
    const played = Number(growAnimation.current?.currentTime ?? Infinity);
    setTimeout(
      () => {
        delete rippleRef.current?.dataset.pressed;
      },
      Math.max(MINIMUM_PRESS_MS - played, 0),
    );
  }, []);

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      if (event.button !== 0 && event.pointerType !== "touch") return;
      const { clientX, clientY, pointerType } = event;
      const release = new AbortController();

      if (pointerType !== "touch") {
        startPress(clientX, clientY);
        const end = () => {
          endPress();
          release.abort();
        };
        window.addEventListener("pointerup", end, { signal: release.signal });
        window.addEventListener("pointercancel", end, { signal: release.signal });
        return;
      }

      // Touch: wait to see if this is a tap or a scroll.
      let started = false;
      const delay = setTimeout(() => {
        started = true;
        startPress(clientX, clientY);
      }, TOUCH_DELAY_MS);
      window.addEventListener(
        "pointerup",
        () => {
          if (!started) {
            // Quick tap: play the full press then release.
            clearTimeout(delay);
            startPress(clientX, clientY);
          }
          endPress();
          release.abort();
        },
        { signal: release.signal },
      );
      window.addEventListener(
        "pointercancel",
        () => {
          // Scroll/swipe: suppress the ripple entirely.
          clearTimeout(delay);
          if (started) endPress();
          release.abort();
        },
        { signal: release.signal },
      );
    },
    [startPress, endPress],
  );

  return { containerRef, onPointerDown };
}
