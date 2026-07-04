"use client";
import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Button.module.css";

export type ButtonVariant = "filled" | "tonal" | "outlined" | "elevated" | "text";
export type ButtonSize = "xsmall" | "small" | "medium" | "large" | "xlarge";

export interface ButtonProps extends BaseButton.Props {
  /** MD3 common button variant. @default 'filled' */
  variant?: ButtonVariant;
  /** MD3 button size (md.comp.button.<size> token sets). @default 'small' */
  size?: ButtonSize;
  /** Leading icon element, sized per MD3 spec (20–40dp by size). */
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const {
    variant = "filled",
    size = "small",
    icon,
    className,
    children,
    onPointerDown,
    ...rest
  } = props;
  const ripple = useRipple();

  return (
    <BaseButton
      ref={ref}
      className={mergeClassName(styles.root, className)}
      data-variant={variant}
      data-size={size}
      onPointerDown={(event) => {
        ripple.onPointerDown(event);
        onPointerDown?.(event);
      }}
      {...rest}
    >
      <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{children}</span>
    </BaseButton>
  );
});
