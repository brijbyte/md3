"use client";
import * as React from "react";
import { useDirection } from "@base-ui/react/direction-provider";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import buttonStyles from "../button/Button.module.css";
import type { FabSize } from "../fab/Fab";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./FabMenu.module.css";

/** The three FAB menu color sets (m3 spec): applied to close button + items alike. */
export type FabMenuColor = "primary" | "secondary" | "tertiary";

const FabMenuColorContext = React.createContext<FabMenuColor>("primary");

export interface FabMenuProps extends BaseMenu.Root.Props {
  /** Color set for the toggle FAB and menu items. @default 'primary' */
  color?: FabMenuColor;
}

/** MD3 FAB menu root: state only, renders no DOM (Base UI Menu.Root). */
export function FabMenu(props: FabMenuProps) {
  const { color = "primary", ...rest } = props;
  return (
    <FabMenuColorContext.Provider value={color}>
      <BaseMenu.Root {...rest} />
    </FabMenuColorContext.Provider>
  );
}

// Material Symbols close, per the spec's default close-button glyph.
function CloseIcon() {
  return (
    <svg viewBox="0 -960 960 960" aria-hidden fill="currentColor">
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
  );
}

export interface FabMenuTriggerProps extends BaseMenu.Trigger.Props {
  /** Expressive FAB size while closed; omit for the baseline 56dp FAB. */
  size?: FabSize;
  /** The FAB icon shown while closed. */
  icon: React.ReactNode;
  /** Icon shown while open. @default Material Symbols close */
  closeIcon?: React.ReactNode;
}

/** Toggle FAB: morphs into the 56dp close button while the menu is open.
    The button itself keeps the closed FAB's footprint the whole time — it's the
    press target and the popup anchor, so layout never shifts and a press that
    outlives the morph still releases inside the trigger (Base UI validates the
    release point against the trigger rect). Only the inner surface morphs,
    anchored to the shared top-trailing corner, per spec. */
export const FabMenuTrigger = React.forwardRef<HTMLButtonElement, FabMenuTriggerProps>(
  function FabMenuTrigger(props, ref) {
    const { size, icon, closeIcon, className, onPointerDown, onClick, ...rest } = props;
    const color = React.useContext(FabMenuColorContext);
    const ripple = useRipple();
    return (
      <BaseMenu.Trigger
        ref={ref}
        // Chrome comes from Button's class (state layer, focus ring, touch target).
        className={mergeClassName(`${buttonStyles.root} ${styles.trigger}`, className)}
        data-size={size}
        data-color={color}
        onPointerDown={(event) => {
          ripple.onPointerDown(event);
          onPointerDown?.(event);
        }}
        onClick={(event) => {
          ripple.onClick();
          onClick?.(event);
        }}
        {...rest}
      >
        <span className={styles.surface}>
          <span className={buttonStyles.stateLayer} ref={ripple.containerRef} aria-hidden />
          <span className={`${buttonStyles.icon} ${styles.fabIcon}`}>{icon}</span>
          <span className={`${buttonStyles.icon} ${styles.closeIcon}`}>
            {closeIcon ?? <CloseIcon />}
          </span>
        </span>
      </BaseMenu.Trigger>
    );
  },
);

export interface FabMenuContentProps extends BaseMenu.Popup.Props {
  /** Which FAB edge the items align to. @default 'end' (the spec's trailing edge) */
  align?: "start" | "end";
  /** Portal container. @default document.body */
  container?: BaseMenu.Portal.Props["container"];
  keepMounted?: BaseMenu.Portal.Props["keepMounted"];
  /** Escape hatch for the remaining Base UI Positioner props. */
  positionerProps?: Omit<BaseMenu.Positioner.Props, "children">;
}

// Popup padding that keeps item shadows/focus rings out of the scroll clip;
// the position offsets below compensate so items still sit 8px above the FAB,
// flush with its trailing edge.
const POPUP_PADDING = 16;
const ITEMS_FAB_GAP = 8;

/** The portalled column of items, opening upward from the FAB (Base UI
    Portal > Positioner > Popup). The popup itself is an invisible scroll
    container; each item carries its own pill surface. */
export const FabMenuContent = React.forwardRef<HTMLDivElement, FabMenuContentProps>(
  function FabMenuContent(props, ref) {
    const { className, align = "end", container, keepMounted, positionerProps, ...rest } = props;
    const color = React.useContext(FabMenuColorContext);
    // The popup portals to document.body, which may not share a scoped
    // DirectionProvider's direction. Stamping dir on the positioner makes both
    // the floating-ui math (it reads the floating element's computed direction)
    // and the popup's logical CSS follow the provider. Only rtl is stamped so a
    // document-level dir="rtl" without a provider keeps working via inheritance.
    const direction = useDirection();
    return (
      <BaseMenu.Portal container={container} keepMounted={keepMounted}>
        <BaseMenu.Positioner
          className={styles.positioner}
          side="top"
          align={align}
          sideOffset={ITEMS_FAB_GAP - POPUP_PADDING}
          alignOffset={-POPUP_PADDING}
          dir={direction === "rtl" ? "rtl" : undefined}
          {...positionerProps}
        >
          <BaseMenu.Popup
            ref={ref}
            className={mergeClassName(styles.popup, className)}
            data-color={color}
            {...rest}
          />
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    );
  },
);

export interface FabMenuItemProps extends BaseMenu.Item.Props {
  /** Leading icon, 24dp. The spec recommends one on every item. */
  icon?: React.ReactNode;
}

/** A pill-shaped action; label text is required by the spec, icons recommended. */
export const FabMenuItem = React.forwardRef<HTMLDivElement, FabMenuItemProps>(
  function FabMenuItem(props, ref) {
    const { className, icon, children, onPointerDown, onClick, ...rest } = props;
    const ripple = useRipple();
    return (
      <BaseMenu.Item
        ref={ref}
        className={mergeClassName(styles.item, className)}
        onPointerDown={(event) => {
          if (!props.disabled) ripple.onPointerDown(event);
          onPointerDown?.(event);
        }}
        onClick={(event) => {
          if (!props.disabled) ripple.onClick();
          onClick?.(event);
        }}
        {...rest}
      >
        <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
        {icon != null ? <span className={styles.icon}>{icon}</span> : null}
        <span className={styles.label}>{children}</span>
      </BaseMenu.Item>
    );
  },
);
