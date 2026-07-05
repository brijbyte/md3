"use client";
import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./SideSheet.module.css";

export type SideSheetVariant = "modal" | "standard";
export type SideSheetAnchor = "left" | "right";

interface SideSheetContextValue {
  variant: SideSheetVariant;
  anchor: SideSheetAnchor;
}

const SideSheetContext = React.createContext<SideSheetContextValue>({
  variant: "modal",
  anchor: "right",
});

export interface SideSheetProps extends Omit<BaseDrawer.Root.Props, "modal" | "swipeDirection"> {
  /** `modal` traps focus, locks page scroll, and shows a scrim (`SideSheetContent` renders
   * no backdrop for `standard`, and `Drawer.Root` gets `modal={false}` — page content stays
   * interactive around the sheet). @default 'modal' */
  variant?: SideSheetVariant;
  /** Which screen edge the sheet is anchored to. MD3 recommends the right edge to avoid
   * colliding with left-anchored nav components. @default 'right' */
  anchor?: SideSheetAnchor;
}

// `modal`/`swipeDirection` are fixed and spread after `...props` so they can't be
// overridden even via an `as any` cast; every other Drawer.Root prop passes through
// untouched. Swipe direction always points toward the anchored edge, so dragging the
// sheet off the side of the screen it's flush with dismisses it.
export function SideSheet(props: SideSheetProps) {
  const { variant = "modal", anchor = "right", ...rest } = props;
  const context = React.useMemo(() => ({ variant, anchor }), [variant, anchor]);
  return (
    <SideSheetContext.Provider value={context}>
      <BaseDrawer.Root {...rest} modal={variant === "modal"} swipeDirection={anchor} />
    </SideSheetContext.Provider>
  );
}

export interface SideSheetTriggerProps extends BaseDrawer.Trigger.Props {}

/** Opens the sheet; usually `render`s an existing control (`render={<Button />}`). */
export const SideSheetTrigger = React.forwardRef<HTMLButtonElement, SideSheetTriggerProps>(
  function SideSheetTrigger(props, ref) {
    return <BaseDrawer.Trigger ref={ref} {...props} />;
  },
);

export interface SideSheetContentProps extends BaseDrawer.Popup.Props {
  /** Portal container. @default document.body */
  container?: BaseDrawer.Portal.Props["container"];
  keepMounted?: BaseDrawer.Portal.Props["keepMounted"];
}

/** The sheet chrome: Base UI Portal > Backdrop > Viewport > Popup, MD3-styled. The
 * `standard` variant renders no `Backdrop` — page content stays visible and interactive
 * beside the sheet, matching a docked side sheet that coexists with the layout. */
export const SideSheetContent = React.forwardRef<HTMLDivElement, SideSheetContentProps>(
  function SideSheetContent(props, ref) {
    const { className, container, keepMounted, ...rest } = props;
    const { variant, anchor } = React.useContext(SideSheetContext);
    return (
      <BaseDrawer.Portal container={container} keepMounted={keepMounted}>
        {variant === "modal" ? <BaseDrawer.Backdrop className={styles.backdrop} /> : null}
        <BaseDrawer.Viewport
          className={styles.viewport}
          data-variant={variant}
          data-anchor={anchor}
        >
          <BaseDrawer.Popup
            ref={ref}
            className={mergeClassName(styles.popup, className)}
            data-variant={variant}
            data-anchor={anchor}
            {...rest}
          />
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    );
  },
);

export interface SideSheetTitleProps extends BaseDrawer.Title.Props {}

export const SideSheetTitle = React.forwardRef<HTMLHeadingElement, SideSheetTitleProps>(
  function SideSheetTitle(props, ref) {
    return <BaseDrawer.Title ref={ref} {...props} />;
  },
);

export interface SideSheetDescriptionProps extends BaseDrawer.Description.Props {}

export const SideSheetDescription = React.forwardRef<
  HTMLParagraphElement,
  SideSheetDescriptionProps
>(function SideSheetDescription(props, ref) {
  return <BaseDrawer.Description ref={ref} {...props} />;
});

export interface SideSheetCloseProps extends BaseDrawer.Close.Props {}

/** Unstyled close trigger; usually `render`s an IconButton in the sheet's header. */
export const SideSheetClose = React.forwardRef<HTMLButtonElement, SideSheetCloseProps>(
  function SideSheetClose(props, ref) {
    return <BaseDrawer.Close ref={ref} {...props} />;
  },
);
