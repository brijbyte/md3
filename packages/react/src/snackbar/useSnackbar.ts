"use client";
import * as React from "react";
import { Toast } from "@base-ui/react/toast";
import type { SnackbarData } from "./Snackbar";

export interface SnackbarAction {
  label: string;
  onClick?: () => void;
}

export interface ShowSnackbarOptions {
  message: React.ReactNode;
  action?: SnackbarAction;
  /** Adds a dismiss (X) icon button alongside the message/action. @default false */
  closable?: boolean;
  /** Auto-dismiss delay in ms, overriding the provider default; `0` disables it. */
  duration?: number;
}

/** Must be called under `SnackbarProvider`. */
export function useSnackbar() {
  const manager = Toast.useToastManager<SnackbarData>();

  // A plain string is shorthand for `{ message: options }`.
  const showSnackbar = React.useCallback(
    (options: string | ShowSnackbarOptions) => {
      const { message, action, closable, duration } =
        typeof options === "string" ? { message: options } : options;
      // Per MDC spec, the action (like the close button) always dismisses the
      // snackbar on click, in addition to running the consumer's callback.
      const id = manager.add({
        description: message,
        timeout: duration,
        actionProps: action
          ? {
              children: action.label,
              onClick: () => {
                action.onClick?.();
                manager.close(id);
              },
            }
          : undefined,
        data: { closable },
      });
      return id;
    },
    [manager],
  );

  return { showSnackbar, closeSnackbar: manager.close };
}
