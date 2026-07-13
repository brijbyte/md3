"use client";
import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { useDirection } from "@base-ui/react/direction-provider";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Dialog.module.css";

export type DialogVariant = "basic" | "full-screen";

const DialogVariantContext = React.createContext<DialogVariant>("basic");

export interface DialogProps extends BaseDialog.Root.Props {
  /** `basic` is the centered dialog; `full-screen` fills the viewport (compact screens)
   * with a header bar instead of an action row. @default 'basic' */
  variant?: DialogVariant;
}

export function Dialog(props: DialogProps) {
  const { variant = "basic", ...rest } = props;
  return (
    <DialogVariantContext.Provider value={variant}>
      <BaseDialog.Root {...rest} />
    </DialogVariantContext.Provider>
  );
}

export interface DialogTriggerProps extends BaseDialog.Trigger.Props {}

/** Opens the dialog; usually `render`s an existing control (`render={<Button />}`). */
export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger(props, ref) {
    return <BaseDialog.Trigger ref={ref} {...props} />;
  },
);

export interface DialogContentProps extends BaseDialog.Popup.Props {
  /** Portal container. @default document.body */
  container?: BaseDialog.Portal.Props["container"];
  keepMounted?: BaseDialog.Portal.Props["keepMounted"];
}

/** The dialog chrome: Base UI Portal > Backdrop > Viewport > Popup, MD3-styled. */
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(props, ref) {
    const { className, container, keepMounted, ...rest } = props;
    const variant = React.useContext(DialogVariantContext);
    // The popup portals out of a scoped DirectionProvider's DOM — stamp dir
    // (rtl only) so the dialog's logical CSS follows it (see FabMenu).
    const direction = useDirection();
    return (
      <BaseDialog.Portal container={container} keepMounted={keepMounted}>
        <BaseDialog.Backdrop className={styles.backdrop} />
        <BaseDialog.Viewport
          className={styles.viewport}
          data-variant={variant}
          dir={direction === "rtl" ? "rtl" : undefined}
        >
          <BaseDialog.Popup
            ref={ref}
            className={mergeClassName(styles.popup, className)}
            data-variant={variant}
            {...rest}
          />
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    );
  },
);

export interface DialogIconProps extends React.ComponentPropsWithoutRef<"span"> {}

/** Optional hero icon above the headline; its presence centers the headline below it. */
export const DialogIcon = React.forwardRef<HTMLSpanElement, DialogIconProps>(
  function DialogIcon(props, ref) {
    const { className, ...rest } = props;
    return (
      <span ref={ref} className={[styles.icon, className].filter(Boolean).join(" ")} {...rest} />
    );
  },
);

export interface DialogHeadlineProps extends BaseDialog.Title.Props {}

export const DialogHeadline = React.forwardRef<HTMLHeadingElement, DialogHeadlineProps>(
  function DialogHeadline(props, ref) {
    const { className, ...rest } = props;
    return (
      <BaseDialog.Title
        ref={ref}
        className={mergeClassName(styles.headline, className)}
        {...rest}
      />
    );
  },
);

export interface DialogSupportingTextProps extends BaseDialog.Description.Props {}

export const DialogSupportingText = React.forwardRef<
  HTMLParagraphElement,
  DialogSupportingTextProps
>(function DialogSupportingText(props, ref) {
  const { className, ...rest } = props;
  return (
    <BaseDialog.Description
      ref={ref}
      className={mergeClassName(styles.supportingText, className)}
      {...rest}
    />
  );
});

export interface DialogBodyProps extends React.ComponentPropsWithoutRef<"div"> {}

/** Scrollable middle region for content beyond supporting text (lists, forms), with the
 * MD3 dividers at its top and bottom edges. */
export const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
  function DialogBody(props, ref) {
    const { className, ...rest } = props;
    return (
      <div ref={ref} className={[styles.body, className].filter(Boolean).join(" ")} {...rest} />
    );
  },
);

export interface DialogActionsProps extends React.ComponentPropsWithoutRef<"div"> {}

/** End-aligned action row; put the dismissive action first, confirming action last. */
export const DialogActions = React.forwardRef<HTMLDivElement, DialogActionsProps>(
  function DialogActions(props, ref) {
    const { className, ...rest } = props;
    return (
      <div ref={ref} className={[styles.actions, className].filter(Boolean).join(" ")} {...rest} />
    );
  },
);

export interface DialogHeaderProps extends React.ComponentPropsWithoutRef<"div"> {}

/** Full-screen dialog top bar: close IconButton, `DialogHeadline`, confirming `Button`. */
export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader(props, ref) {
    const { className, ...rest } = props;
    return (
      <div ref={ref} className={[styles.header, className].filter(Boolean).join(" ")} {...rest} />
    );
  },
);

export interface DialogCloseProps extends BaseDialog.Close.Props {}

/** Unstyled close trigger; `render` a Button/IconButton to give it MD3 looks. */
export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  function DialogClose(props, ref) {
    return <BaseDialog.Close ref={ref} {...props} />;
  },
);
