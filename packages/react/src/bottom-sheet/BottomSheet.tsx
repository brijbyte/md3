"use client";
import * as React from "react";
import { useDirection } from "@base-ui/react/direction-provider";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./BottomSheet.module.css";

export type BottomSheetVariant = "modal" | "standard";

const BottomSheetVariantContext = React.createContext<BottomSheetVariant>("modal");

export interface BottomSheetProps extends Omit<BaseDrawer.Root.Props, "modal" | "swipeDirection"> {
  /** `modal` traps focus, locks page scroll, and shows a scrim (`BottomSheetContent`
   * renders no backdrop for `standard`, and `Drawer.Root` gets `modal={false}` — page
   * content stays interactive around the sheet). @default 'modal' */
  variant?: BottomSheetVariant;
}

// `modal`/`swipeDirection` are fixed and spread after `...props` so they can't be
// overridden even via an `as any` cast; every other Drawer.Root prop (snapPoints,
// snapPoint/defaultSnapPoint/onSnapPointChange, snapToSequentialPoints, ...) passes
// through untouched, which is what gives consumers Compose's full
// Hidden/PartiallyExpanded/Expanded model for free.
export function BottomSheet(props: BottomSheetProps) {
  const { variant = "modal", ...rest } = props;
  return (
    <BottomSheetVariantContext.Provider value={variant}>
      <BaseDrawer.Root {...rest} modal={variant === "modal"} swipeDirection="down" />
    </BottomSheetVariantContext.Provider>
  );
}

export interface BottomSheetTriggerProps extends BaseDrawer.Trigger.Props {}

/** Opens the sheet; usually `render`s an existing control (`render={<Button />}`). */
export const BottomSheetTrigger = React.forwardRef<HTMLButtonElement, BottomSheetTriggerProps>(
  function BottomSheetTrigger(props, ref) {
    return <BaseDrawer.Trigger ref={ref} {...props} />;
  },
);

export interface BottomSheetContentProps extends BaseDrawer.Popup.Props {
  /** Drag handle shown above the content. Pass `false` to omit it, or a node to replace
   * the default pill. @default true */
  dragHandle?: boolean | React.ReactNode;
  /** Portal container. @default document.body */
  container?: BaseDrawer.Portal.Props["container"];
  keepMounted?: BaseDrawer.Portal.Props["keepMounted"];
}

/** The sheet chrome: Base UI Portal > Backdrop > Viewport > Popup, MD3-styled. The
 * `standard` variant renders no `Backdrop` — page content stays visible and interactive
 * around the sheet, matching Compose's docked `BottomSheet`/`BottomSheetScaffold`. */
export const BottomSheetContent = React.forwardRef<HTMLDivElement, BottomSheetContentProps>(
  function BottomSheetContent(props, ref) {
    const { className, dragHandle = true, container, keepMounted, children, ...rest } = props;
    const variant = React.useContext(BottomSheetVariantContext);
    // The popup portals out of a scoped DirectionProvider's DOM — stamp dir
    // (rtl only) so the sheet's logical CSS follows it (see FabMenu).
    const direction = useDirection();
    return (
      <BaseDrawer.Portal container={container} keepMounted={keepMounted}>
        {variant === "modal" ? <BaseDrawer.Backdrop className={styles.backdrop} /> : null}
        <BaseDrawer.Viewport
          className={styles.viewport}
          data-variant={variant}
          dir={direction === "rtl" ? "rtl" : undefined}
        >
          <BaseDrawer.Popup
            ref={ref}
            className={mergeClassName(styles.popup, className)}
            data-variant={variant}
            {...rest}
          >
            {dragHandle !== false ? (
              <div className={styles.handleRow} aria-hidden>
                {dragHandle === true ? <span className={styles.handle} /> : dragHandle}
              </div>
            ) : null}
            {children}
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    );
  },
);

export interface BottomSheetTitleProps extends BaseDrawer.Title.Props {}

export const BottomSheetTitle = React.forwardRef<HTMLHeadingElement, BottomSheetTitleProps>(
  function BottomSheetTitle(props, ref) {
    return <BaseDrawer.Title ref={ref} {...props} />;
  },
);

export interface BottomSheetDescriptionProps extends BaseDrawer.Description.Props {}

export const BottomSheetDescription = React.forwardRef<
  HTMLParagraphElement,
  BottomSheetDescriptionProps
>(function BottomSheetDescription(props, ref) {
  return <BaseDrawer.Description ref={ref} {...props} />;
});

export interface BottomSheetCloseProps extends BaseDrawer.Close.Props {}

/** Unstyled close trigger; usually `render`s an IconButton in the sheet's header. */
export const BottomSheetClose = React.forwardRef<HTMLButtonElement, BottomSheetCloseProps>(
  function BottomSheetClose(props, ref) {
    return <BaseDrawer.Close ref={ref} {...props} />;
  },
);
