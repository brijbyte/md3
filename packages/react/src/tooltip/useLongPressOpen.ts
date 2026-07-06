"use client";
import * as React from "react";

/** Android ViewConfiguration long-press timeout, which Compose's tooltip gesture reads. */
const LONG_PRESS_MS = 400;
const MOVE_TOLERANCE_PX = 10;
/** Compose BasicTooltipDefaults.TooltipDuration — transient tooltips self-dismiss after it. */
const TOOLTIP_DURATION_MS = 1500;

/**
 * Long-press-to-open for touch/pen triggers, mirroring Compose's
 * `BasicTooltip.handleGestures`: holding a touch point calls `onLongPress`, consumes the
 * gesture (browser context menu + the trailing synthetic click, so the trigger's own
 * action doesn't also fire), then calls `onAutoDismiss` after Compose's TooltipDuration.
 */
export function useLongPressOpen<T extends HTMLElement>(
  onLongPress: () => void,
  onAutoDismiss?: () => void,
) {
  const pressTimeoutRef = React.useRef<number | undefined>(undefined);
  const dismissTimeoutRef = React.useRef<number | undefined>(undefined);
  const startRef = React.useRef<{ x: number; y: number } | null>(null);
  const firedRef = React.useRef(false);
  const onLongPressRef = React.useRef(onLongPress);
  onLongPressRef.current = onLongPress;
  const onAutoDismissRef = React.useRef(onAutoDismiss);
  onAutoDismissRef.current = onAutoDismiss;

  const clearPending = React.useCallback(() => {
    window.clearTimeout(pressTimeoutRef.current);
    pressTimeoutRef.current = undefined;
    startRef.current = null;
  }, []);

  React.useEffect(
    () => () => {
      window.clearTimeout(pressTimeoutRef.current);
      window.clearTimeout(dismissTimeoutRef.current);
    },
    [],
  );

  return React.useMemo(
    () => ({
      onPointerDown(event: React.PointerEvent<T>) {
        firedRef.current = false;
        if (event.pointerType === "mouse") return;
        startRef.current = { x: event.clientX, y: event.clientY };
        window.clearTimeout(dismissTimeoutRef.current);
        pressTimeoutRef.current = window.setTimeout(() => {
          firedRef.current = true;
          onLongPressRef.current();
          dismissTimeoutRef.current = window.setTimeout(() => {
            onAutoDismissRef.current?.();
          }, TOOLTIP_DURATION_MS);
        }, LONG_PRESS_MS);
      },
      onPointerMove(event: React.PointerEvent<T>) {
        const start = startRef.current;
        if (!start) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) clearPending();
      },
      onPointerUp() {
        // Keep firedRef so onClickCapture can swallow the click this release produces.
        clearPending();
      },
      onPointerCancel() {
        clearPending();
        firedRef.current = false;
      },
      /** Cancelling pointerup can't stop the synthetic click, so swallow it here instead.
          Returns true when the click belonged to a long press and was consumed. */
      onClickCapture(event: React.MouseEvent<T>): boolean {
        if (!firedRef.current) return false;
        firedRef.current = false;
        event.preventDefault();
        event.stopPropagation();
        return true;
      },
      /** A touch long press also raises contextmenu; consume it like Compose does. */
      onContextMenu(event: React.MouseEvent<T>) {
        if (startRef.current || firedRef.current) event.preventDefault();
      },
    }),
    [clearPending],
  );
}
