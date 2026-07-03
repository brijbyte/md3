"use client";
import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Toggle } from "@base-ui/react/toggle";
import { useRipple } from "../ripple/useRipple";
import styles from "./IconButton.module.css";

export type IconButtonVariant = "standard" | "filled" | "tonal" | "outlined";

interface IconButtonBaseProps {
  /** MD3 icon button variant. @default 'standard' */
  variant?: IconButtonVariant;
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
    const { variant = "standard", toggle, className, children, onPointerDown, ...rest } = props;
    const ripple = useRipple();

    const shared = {
      ref,
      className: [styles.root, className].filter(Boolean).join(" "),
      "data-variant": variant,
      // Selected styles key off data-pressed; mark toggles so unselected
      // filled/tonal containers can differ from the non-toggle default.
      "data-toggle": toggle ? "" : undefined,
      onPointerDown: ((event) => {
        ripple.onPointerDown(event);
        onPointerDown?.(event);
      }) as NonNullable<BaseButton.Props["onPointerDown"]>,
      children: (
        <>
          <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
          <span className={styles.icon}>{children}</span>
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
