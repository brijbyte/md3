"use client";
import * as React from "react";
import { Toast } from "@base-ui/react/toast";
import styles from "./Snackbar.module.css";

export interface SnackbarData {
  closable?: boolean;
}

export interface SnackbarProviderProps {
  children?: React.ReactNode;
  /** Max snackbars displayed at once. MD3 only ever shows one. @default 1 */
  limit?: number;
  /** Default auto-dismiss delay in ms; `0` disables it. @default 4000 */
  timeout?: number;
  /** Icon for the close button (e.g. `@brijbyte/md3-icons/outlined/Close`), 24dp. */
  closeIcon?: React.ReactNode;
  /** Portal container. @default document.body */
  container?: Toast.Portal.Props["container"];
}

const SnackbarCloseIconContext = React.createContext<React.ReactNode>("×");

// MD3 shows a single snackbar at a time (new ones replace, don't stack), so
// unlike a generic toast stack this renders the current toast directly —
// no --toast-index/peek/scale stacking transform is needed.
export function SnackbarProvider(props: SnackbarProviderProps) {
  const { children, limit = 1, timeout = 4000, closeIcon, container } = props;
  return (
    <Toast.Provider limit={limit} timeout={timeout}>
      {children}
      <Toast.Portal container={container}>
        <Toast.Viewport className={styles.viewport}>
          <SnackbarCloseIconContext.Provider value={closeIcon ?? "×"}>
            <SnackbarList />
          </SnackbarCloseIconContext.Provider>
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

function SnackbarList() {
  const { toasts } = Toast.useToastManager<SnackbarData>();
  const closeIcon = React.useContext(SnackbarCloseIconContext);
  return toasts.map((toast) => (
    <Toast.Root key={toast.id} toast={toast} swipeDirection={["down"]} className={styles.root}>
      <Toast.Description className={styles.text} />
      {toast.actionProps ? <Toast.Action className={styles.action} /> : null}
      {toast.data?.closable ? (
        <Toast.Close className={styles.close} aria-label="Dismiss">
          <span className={styles.closeStateLayer} aria-hidden />
          <span className={styles.closeIcon}>{closeIcon}</span>
        </Toast.Close>
      ) : null}
    </Toast.Root>
  ));
}
