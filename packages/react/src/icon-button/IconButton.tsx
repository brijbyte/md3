"use client";
import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Toggle } from "@base-ui/react/toggle";
import buttonStyles from "../button/Button.module.css";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./IconButton.module.css";

export type IconButtonVariant = "standard" | "filled" | "tonal" | "outlined";
export type IconButtonSize = "xsmall" | "small" | "medium" | "large" | "xlarge";
export type IconButtonWidth = "narrow" | "default" | "wide";
export type IconButtonShape = "round" | "square";

interface IconButtonBaseProps {
  /** MD3 icon button variant. @default 'standard' */
  variant?: IconButtonVariant;
  /** MD3 icon button size (md.comp.icon-button.<size> token sets). @default 'small' */
  size?: IconButtonSize;
  /** Horizontal padding variant; height/icon are unchanged. @default 'default' */
  width?: IconButtonWidth;
  /** Resting shape; toggles flip it when selected. @default 'round' */
  shape?: IconButtonShape;
  /** Accessible name — icon buttons have no visible label. */
  "aria-label": string;
}

interface IconButtonPlainProps extends IconButtonBaseProps, Omit<BaseButton.Props, "aria-label"> {
  toggle?: false;
}

interface IconButtonToggleProps extends IconButtonBaseProps, Omit<Toggle.Props, "aria-label"> {
  /** Renders a toggle icon button (aria-pressed semantics, selected styling). */
  toggle: true;
}

export type IconButtonProps = IconButtonPlainProps | IconButtonToggleProps;

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(props, ref) {
    const {
      variant = "standard",
      size = "small",
      width = "default",
      shape = "round",
      toggle,
      className,
      children,
      onPointerDown,
      ...rest
    } = props;
    const ripple = useRipple();

    const shared = {
      ref,
      // Chrome comes from Button's class; styles.root holds icon-button overrides.
      // Cast: className's state param is a Button/Toggle union; each branch narrows it.
      className: mergeClassName<any>(`${buttonStyles.root} ${styles.root}`, className) as string,
      "data-variant": variant,
      "data-size": size,
      "data-width": width,
      "data-shape": shape,
      // Selected styles key off data-pressed; mark toggles so unselected
      // filled/tonal containers can differ from the non-toggle default.
      "data-toggle": toggle ? "" : undefined,
      onPointerDown: ((event) => {
        ripple.onPointerDown(event);
        onPointerDown?.(event);
      }) as NonNullable<BaseButton.Props["onPointerDown"]>,
      children: (
        <>
          <span className={buttonStyles.stateLayer} ref={ripple.containerRef} aria-hidden />
          <span className={buttonStyles.icon}>{children}</span>
        </>
      ),
    };

    return toggle ? (
      <Toggle {...shared} {...(rest as Toggle.Props)} />
    ) : (
      <BaseButton {...shared} {...(rest as BaseButton.Props)} />
    );
  },
);
