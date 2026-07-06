"use client";
import * as React from "react";

const LONG_PRESS_MS = 500;
const MOVE_TOLERANCE_PX = 10;

/**
 * Long-press-to-open for touch/pen triggers, mirroring Compose's
 * `BasicTooltip.handleGestures`: holding a touch point calls `onLongPress` and consumes
 * the pointerup so the trailing synthetic click doesn't also fire the trigger's own
 * action. A plain tap is left untouched.
 */
export function useLongPressOpen<T extends HTMLElement>(onLongPress: () => void) {
  const timeoutRef = React.useRef<number | undefined>(undefined);
  const startRef = React.useRef<{ x: number; y: number } | null>(null);
  const firedRef = React.useRef(false);
  const onLongPressRef = React.useRef(onLongPress);
  onLongPressRef.current = onLongPress;

  const clearPending = React.useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = undefined;
    startRef.current = null;
  }, []);

  return React.useMemo(
    () => ({
      onPointerDown(event: React.PointerEvent<T>) {
        if (event.pointerType === "mouse") return;
        startRef.current = { x: event.clientX, y: event.clientY };
        firedRef.current = false;
        timeoutRef.current = window.setTimeout(() => {
          firedRef.current = true;
          onLongPressRef.current();
        }, LONG_PRESS_MS);
      },
      onPointerMove(event: React.PointerEvent<T>) {
        const start = startRef.current;
        if (!start) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) clearPending();
      },
      onPointerUp(event: React.PointerEvent<T>) {
        clearPending();
        if (firedRef.current) event.preventDefault();
      },
      onPointerCancel() {
        clearPending();
        firedRef.current = false;
      },
    }),
    [clearPending],
  );
}
