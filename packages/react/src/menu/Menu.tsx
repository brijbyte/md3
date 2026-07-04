"use client";
import * as React from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Menu.module.css";

export interface MenuProps extends BaseMenu.Root.Props {}

/** MD3 menu root: state only, renders no DOM (Base UI Menu.Root). */
export function Menu(props: MenuProps) {
  return <BaseMenu.Root {...props} />;
}

// True under MenuSubmenu/ContextMenu, where MenuContent must leave side/align
// undefined so Base UI's context-aware positioning defaults apply.
const NestedMenuContext = React.createContext(false);

export interface ContextMenuProps extends BaseContextMenu.Root.Props {}

/** Right-click / long-press menu root; Base UI shares all other Menu parts with it,
    so nest a ContextMenuTrigger area plus the regular MenuContent/MenuItem family. */
export function ContextMenu(props: ContextMenuProps) {
  return (
    <NestedMenuContext.Provider value={true}>
      <BaseContextMenu.Root {...props} />
    </NestedMenuContext.Provider>
  );
}

export interface ContextMenuTriggerProps extends BaseContextMenu.Trigger.Props {}

/** Unstyled surface area that opens the context menu on secondary click / long press. */
export const ContextMenuTrigger = React.forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  function ContextMenuTrigger(props, ref) {
    return <BaseContextMenu.Trigger ref={ref} {...props} />;
  },
);

export interface MenuTriggerProps extends BaseMenu.Trigger.Props {}

/** Unstyled trigger; usually `render`s an existing control (`render={<Button />}`). */
export const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>(
  function MenuTrigger(props, ref) {
    return <BaseMenu.Trigger ref={ref} {...props} />;
  },
);

export interface MenuContentProps extends BaseMenu.Popup.Props {
  /** Side of the anchor to position against. @default 'bottom' ('inline-end' in submenus) */
  side?: BaseMenu.Positioner.Props["side"];
  /** Alignment against the anchor. @default 'start' */
  align?: BaseMenu.Positioner.Props["align"];
  sideOffset?: BaseMenu.Positioner.Props["sideOffset"];
  alignOffset?: BaseMenu.Positioner.Props["alignOffset"];
  /** Positioning anchor; defaults to the trigger. */
  anchor?: BaseMenu.Positioner.Props["anchor"];
  /** Portal container. @default document.body */
  container?: BaseMenu.Portal.Props["container"];
  keepMounted?: BaseMenu.Portal.Props["keepMounted"];
  /** Escape hatch for the remaining Base UI Positioner props. */
  positionerProps?: Omit<BaseMenu.Positioner.Props, "children">;
}

/** The menu surface: Base UI Portal > Positioner > Popup, MD3-styled. */
export const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(
  function MenuContent(props, ref) {
    const {
      className,
      side,
      align,
      sideOffset,
      alignOffset,
      anchor,
      container,
      keepMounted,
      positionerProps,
      ...rest
    } = props;
    // Nested (submenu/context) menus keep Base UI's positioning defaults —
    // submenus open beside the parent item, context menus at the pointer.
    const nested = React.useContext(NestedMenuContext);
    return (
      <BaseMenu.Portal container={container} keepMounted={keepMounted}>
        <BaseMenu.Positioner
          className={styles.positioner}
          side={side ?? (nested ? undefined : "bottom")}
          align={align ?? (nested ? undefined : "start")}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          anchor={anchor}
          {...positionerProps}
        >
          <BaseMenu.Popup ref={ref} className={mergeClassName(styles.popup, className)} {...rest} />
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    );
  },
);

interface MenuItemSlots {
  /** Leading icon element, 24dp per MD3 spec. */
  leadingIcon?: React.ReactNode;
  /** Trailing icon element, 24dp per MD3 spec. */
  trailingIcon?: React.ReactNode;
  /** Trailing supporting text, e.g. a keyboard shortcut hint. */
  trailingText?: React.ReactNode;
}

// Shared item interior: state layer (ripple host) + leading/label/trailing slots.
function ItemBody(
  props: MenuItemSlots & {
    ripple: ReturnType<typeof useRipple>;
    children?: React.ReactNode;
  },
) {
  const { ripple, leadingIcon, trailingIcon, trailingText, children } = props;
  return (
    <>
      <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
      {leadingIcon != null ? <span className={styles.icon}>{leadingIcon}</span> : null}
      <span className={styles.label}>{children}</span>
      {trailingText != null || trailingIcon != null ? (
        <span className={styles.trailing}>
          {trailingText != null ? (
            <span className={styles.trailingText}>{trailingText}</span>
          ) : null}
          {trailingIcon != null ? <span className={styles.icon}>{trailingIcon}</span> : null}
        </span>
      ) : null}
    </>
  );
}

export interface MenuItemProps extends BaseMenu.Item.Props, MenuItemSlots {}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem(props, ref) {
    const { className, leadingIcon, trailingIcon, trailingText, children, onPointerDown, ...rest } =
      props;
    const ripple = useRipple();
    return (
      <BaseMenu.Item
        ref={ref}
        className={mergeClassName(styles.item, className)}
        onPointerDown={(event) => {
          if (!props.disabled) ripple.onPointerDown(event);
          onPointerDown?.(event);
        }}
        {...rest}
      >
        <ItemBody
          ripple={ripple}
          leadingIcon={leadingIcon}
          trailingIcon={trailingIcon}
          trailingText={trailingText}
        >
          {children}
        </ItemBody>
      </BaseMenu.Item>
    );
  },
);

export interface MenuLinkItemProps extends BaseMenu.LinkItem.Props, MenuItemSlots {}

/** Menu item rendering an anchor; use `render={<Link />}` for router links. */
export const MenuLinkItem = React.forwardRef<HTMLAnchorElement, MenuLinkItemProps>(
  function MenuLinkItem(props, ref) {
    const { className, leadingIcon, trailingIcon, trailingText, children, onPointerDown, ...rest } =
      props;
    const ripple = useRipple();
    return (
      <BaseMenu.LinkItem
        ref={ref}
        className={mergeClassName(styles.item, className)}
        onPointerDown={(event) => {
          ripple.onPointerDown(event);
          onPointerDown?.(event);
        }}
        {...rest}
      >
        <ItemBody
          ripple={ripple}
          leadingIcon={leadingIcon}
          trailingIcon={trailingIcon}
          trailingText={trailingText}
        >
          {children}
        </ItemBody>
      </BaseMenu.LinkItem>
    );
  },
);

export interface MenuCheckboxItemProps extends BaseMenu.CheckboxItem.Props, MenuItemSlots {}

/** Toggleable item; while checked the row fills with secondary-container (no checkmark, per spec). */
export const MenuCheckboxItem = React.forwardRef<HTMLDivElement, MenuCheckboxItemProps>(
  function MenuCheckboxItem(props, ref) {
    const { className, leadingIcon, trailingIcon, trailingText, children, onPointerDown, ...rest } =
      props;
    const ripple = useRipple();
    return (
      <BaseMenu.CheckboxItem
        ref={ref}
        className={mergeClassName(styles.item, className)}
        onPointerDown={(event) => {
          if (!props.disabled) ripple.onPointerDown(event);
          onPointerDown?.(event);
        }}
        {...rest}
      >
        <ItemBody
          ripple={ripple}
          leadingIcon={leadingIcon}
          trailingIcon={trailingIcon}
          trailingText={trailingText}
        >
          {children}
        </ItemBody>
      </BaseMenu.CheckboxItem>
    );
  },
);

export interface MenuRadioGroupProps extends BaseMenu.RadioGroup.Props {}

export const MenuRadioGroup = React.forwardRef<HTMLDivElement, MenuRadioGroupProps>(
  function MenuRadioGroup(props, ref) {
    return <BaseMenu.RadioGroup ref={ref} {...props} />;
  },
);

export interface MenuRadioItemProps extends BaseMenu.RadioItem.Props, MenuItemSlots {}

export const MenuRadioItem = React.forwardRef<HTMLDivElement, MenuRadioItemProps>(
  function MenuRadioItem(props, ref) {
    const { className, leadingIcon, trailingIcon, trailingText, children, onPointerDown, ...rest } =
      props;
    const ripple = useRipple();
    return (
      <BaseMenu.RadioItem
        ref={ref}
        className={mergeClassName(styles.item, className)}
        onPointerDown={(event) => {
          if (!props.disabled) ripple.onPointerDown(event);
          onPointerDown?.(event);
        }}
        {...rest}
      >
        <ItemBody
          ripple={ripple}
          leadingIcon={leadingIcon}
          trailingIcon={trailingIcon}
          trailingText={trailingText}
        >
          {children}
        </ItemBody>
      </BaseMenu.RadioItem>
    );
  },
);

export interface MenuGroupProps extends BaseMenu.Group.Props {
  /** Optional section label rendered above the group's items. */
  label?: React.ReactNode;
}

export const MenuGroup = React.forwardRef<HTMLDivElement, MenuGroupProps>(
  function MenuGroup(props, ref) {
    const { label, children, ...rest } = props;
    return (
      <BaseMenu.Group ref={ref} {...rest}>
        {label != null ? (
          <BaseMenu.GroupLabel className={styles.groupLabel}>{label}</BaseMenu.GroupLabel>
        ) : null}
        {children}
      </BaseMenu.Group>
    );
  },
);

export interface MenuSeparatorProps extends BaseMenu.Separator.Props {}

export const MenuSeparator = React.forwardRef<HTMLDivElement, MenuSeparatorProps>(
  function MenuSeparator(props, ref) {
    const { className, ...rest } = props;
    return (
      <BaseMenu.Separator
        ref={ref}
        className={mergeClassName(styles.separator, className)}
        {...rest}
      />
    );
  },
);

export interface MenuSubmenuProps extends BaseMenu.SubmenuRoot.Props {}

/** Cascading submenu root; nest a MenuSubmenuTrigger and a MenuContent inside. */
export function MenuSubmenu(props: MenuSubmenuProps) {
  return (
    <NestedMenuContext.Provider value={true}>
      <BaseMenu.SubmenuRoot {...props} />
    </NestedMenuContext.Provider>
  );
}

export interface MenuSubmenuTriggerProps extends BaseMenu.SubmenuTrigger.Props, MenuItemSlots {}

/** Item that opens a submenu; defaults to a cascading arrow_right trailing indicator. */
export const MenuSubmenuTrigger = React.forwardRef<HTMLDivElement, MenuSubmenuTriggerProps>(
  function MenuSubmenuTrigger(props, ref) {
    const { className, leadingIcon, trailingIcon, trailingText, children, onPointerDown, ...rest } =
      props;
    const ripple = useRipple();
    return (
      <BaseMenu.SubmenuTrigger
        ref={ref}
        className={mergeClassName(styles.item, className)}
        onPointerDown={(event) => {
          if (!props.disabled) ripple.onPointerDown(event);
          onPointerDown?.(event);
        }}
        {...rest}
      >
        <ItemBody
          ripple={ripple}
          leadingIcon={leadingIcon}
          trailingText={trailingText}
          trailingIcon={
            trailingIcon !== undefined ? (
              trailingIcon
            ) : (
              // Material Symbols arrow_right, per the spec's cascading indicator.
              <svg viewBox="0 0 24 24" aria-hidden fill="currentColor">
                <path d="M10 17V7l5 5-5 5Z" />
              </svg>
            )
          }
        >
          {children}
        </ItemBody>
      </BaseMenu.SubmenuTrigger>
    );
  },
);
