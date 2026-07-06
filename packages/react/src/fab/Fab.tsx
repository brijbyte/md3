"use client";
import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import buttonStyles from "../button/Button.module.css";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Fab.module.css";

/** Baseline FAB (56dp) is the default; expressive medium/large are 80/96dp. */
export type FabSize = "medium" | "large";
/** Two families: bold tone colors and the softer *-container colors. */
export type FabColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "primary-container"
  | "secondary-container"
  | "tertiary-container";

export interface FabProps extends BaseButton.Props {
  /** Expressive size; omit for the baseline 56dp FAB. */
  size?: FabSize;
  /** Container color role. @default 'primary-container' */
  color?: FabColor;
  /** Lowered elevation variant (level1 resting instead of level3). */
  lowered?: boolean;
  /** The FAB icon. */
  icon: React.ReactNode;
  /** Label — renders the extended FAB (any size, height matches the round FAB). */
  label?: React.ReactNode;
}

export const Fab = React.forwardRef<HTMLButtonElement, FabProps>(function Fab(props, ref) {
  const {
    size,
    color = "primary-container",
    lowered,
    icon,
    label,
    className,
    onPointerDown,
    onClick,
    ...rest
  } = props;
  const ripple = useRipple();

  return (
    <BaseButton
      ref={ref}
      // Chrome comes from Button's class; styles.root holds FAB overrides.
      className={mergeClassName(`${buttonStyles.root} ${styles.root}`, className)}
      data-size={size}
      data-color={color}
      data-lowered={lowered ? "" : undefined}
      data-extended={label != null ? "" : undefined}
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
      <span className={buttonStyles.stateLayer} ref={ripple.containerRef} aria-hidden />
      <span className={buttonStyles.icon}>{icon}</span>
      {label != null ? <span className={buttonStyles.label}>{label}</span> : null}
    </BaseButton>
  );
});
