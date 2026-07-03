"use client";
import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Fab.module.css";

export type FabSize = "small" | "medium" | "large";
export type FabColor = "primary" | "secondary" | "tertiary" | "surface";

export interface FabProps extends BaseButton.Props {
  /** @default 'medium' */
  size?: FabSize;
  /** Container color role. @default 'primary' */
  color?: FabColor;
  /** Lowered elevation variant (level1 resting instead of level3). */
  lowered?: boolean;
  /** The FAB icon. */
  icon: React.ReactNode;
  /** Label — renders the extended FAB (medium height only, per spec). */
  label?: React.ReactNode;
}

export const Fab = React.forwardRef<HTMLButtonElement, FabProps>(function Fab(props, ref) {
  const {
    size = "medium",
    color = "primary",
    lowered,
    icon,
    label,
    className,
    onPointerDown,
    ...rest
  } = props;
  const ripple = useRipple();

  return (
    <BaseButton
      ref={ref}
      className={mergeClassName(styles.root, className)}
      data-size={label ? "medium" : size}
      data-color={color}
      data-lowered={lowered ? "" : undefined}
      data-extended={label != null ? "" : undefined}
      onPointerDown={(event) => {
        ripple.onPointerDown(event);
        onPointerDown?.(event);
      }}
      {...rest}
    >
      <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
      <span className={styles.icon}>{icon}</span>
      {label != null ? <span className={styles.label}>{label}</span> : null}
    </BaseButton>
  );
});
