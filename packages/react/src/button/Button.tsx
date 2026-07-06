"use client";
import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Toggle } from "@base-ui/react/toggle";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Button.module.css";

export type ButtonVariant = "filled" | "tonal" | "outlined" | "elevated" | "text";
export type ButtonSize = "xsmall" | "small" | "medium" | "large" | "xlarge";
export type ButtonShape = "round" | "square";

interface ButtonBaseProps {
  /** MD3 common button variant. @default 'filled' */
  variant?: ButtonVariant;
  /** MD3 button size (md.comp.button.<size> token sets). @default 'small' */
  size?: ButtonSize;
  /** Resting shape; toggles flip it when selected. @default 'round' */
  shape?: ButtonShape;
  /** Leading icon element, sized per MD3 spec (20–40dp by size). */
  icon?: React.ReactNode;
}

interface ButtonPlainProps extends ButtonBaseProps, BaseButton.Props {
  toggle?: false;
}

interface ButtonToggleProps extends ButtonBaseProps, Toggle.Props {
  /** Renders a toggle button (aria-pressed semantics, selected styling). MD3 has no text-variant toggle. */
  toggle: true;
}

export type ButtonProps = ButtonPlainProps | ButtonToggleProps;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const {
    variant = "filled",
    size = "small",
    shape = "round",
    toggle,
    icon,
    className,
    children,
    onPointerDown,
    onClick,
    ...rest
  } = props;
  const ripple = useRipple();

  const shared = {
    ref,
    // Cast: className's state param is a Button/Toggle union; each branch narrows it.
    className: mergeClassName<any>(styles.root, className) as string,
    "data-variant": variant,
    "data-size": size,
    "data-shape": shape,
    // Selected styles key off data-pressed; mark toggles so unselected
    // containers/colors can differ from the non-toggle default.
    "data-toggle": toggle ? "" : undefined,
    onPointerDown: ((event) => {
      ripple.onPointerDown(event);
      onPointerDown?.(event);
    }) as NonNullable<BaseButton.Props["onPointerDown"]>,
    onClick: ((event) => {
      ripple.onClick();
      onClick?.(event);
    }) as NonNullable<BaseButton.Props["onClick"]>,
    children: (
      <>
        <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        <span className={styles.label}>{children}</span>
      </>
    ),
  };

  return toggle ? (
    <Toggle {...shared} {...(rest as Toggle.Props)} />
  ) : (
    <BaseButton {...shared} {...(rest as BaseButton.Props)} />
  );
});
