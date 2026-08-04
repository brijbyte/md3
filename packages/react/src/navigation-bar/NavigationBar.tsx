"use client";
import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./NavigationBar.module.css";

export type NavigationBarArrangement = "equal-weight" | "centered";

export interface NavigationBarProps extends React.ComponentPropsWithoutRef<"nav"> {
  /** Item distribution: equal widths (compact windows) or grouped center (medium). @default 'equal-weight' */
  arrangement?: NavigationBarArrangement;
}

export const NavigationBar = React.forwardRef<HTMLElement, NavigationBarProps>(
  function NavigationBar(props, ref) {
    const { className, arrangement = "equal-weight", ...rest } = props;
    return (
      <nav
        ref={ref}
        className={[styles.root, className].filter(Boolean).join(" ")}
        data-arrangement={arrangement === "centered" ? "centered" : undefined}
        {...rest}
      />
    );
  },
);

export type NavigationBarItemIconPosition = "top" | "start";

export interface NavigationBarItemProps extends BaseButton.Props {
  /** Destination icon (24dp). */
  icon: React.ReactNode;
  /** Text label. Omit for icon-only items. */
  label?: React.ReactNode;
  /** A Badge, anchored to the icon's top-right corner. */
  badge?: React.ReactNode;
  /** Marks this item as the current destination. */
  active?: boolean;
  /** Icon above the label (compact windows) or before it (medium). @default 'top' */
  iconPosition?: NavigationBarItemIconPosition;
}

export const NavigationBarItem = React.forwardRef<HTMLButtonElement, NavigationBarItemProps>(
  function NavigationBarItem(props, ref) {
    const {
      className,
      icon,
      label,
      badge,
      active,
      iconPosition = "top",
      onPointerDown,
      onClick,
      ...rest
    } = props;
    const ripple = useRipple();
    // Icon-only items keep the top-icon pill regardless of iconPosition.
    const horizontal = iconPosition === "start" && label != null;
    const labelSpan = label != null ? <span className={styles.label}>{label}</span> : null;

    return (
      <BaseButton
        ref={ref}
        className={mergeClassName(styles.item, className)}
        data-active={active ? "" : undefined}
        data-icon-position={horizontal ? "start" : undefined}
        aria-current={active ? "page" : undefined}
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
        <span className={styles.indicator}>
          <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
          <span className={styles.icon}>
            {icon}
            {badge ? <span className={styles.badge}>{badge}</span> : null}
          </span>
          {horizontal ? labelSpan : null}
        </span>
        {horizontal ? null : labelSpan}
      </BaseButton>
    );
  },
);
