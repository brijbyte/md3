"use client";
import * as React from "react";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Toolbar.module.css";

export type ToolbarVariant = "docked" | "floating";
export type ToolbarColor = "standard" | "vibrant";

export interface ToolbarProps extends BaseToolbar.Root.Props {
  /** MD3 toolbar type. @default 'docked' */
  variant?: ToolbarVariant;
  /** Color scheme; vibrant = primary-container. @default 'standard' */
  color?: ToolbarColor;
}

// Wraps Base UI Toolbar.Root (role="toolbar", aria-orientation, roving focus
// for ToolbarButton items). Positioning is the consumer's job — floating
// toolbars sit min 16dp from screen edges per spec.
export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(props, ref) {
  const { variant = "docked", color = "standard", orientation, className, ...rest } = props;
  return (
    <BaseToolbar.Root
      ref={ref}
      className={mergeClassName(styles.root, className)}
      data-variant={variant}
      data-color={color === "vibrant" ? "vibrant" : undefined}
      // Docked toolbars are horizontal-only; orientation applies to floating.
      orientation={variant === "docked" ? "horizontal" : orientation}
      {...rest}
    />
  );
});

export interface ToolbarButtonProps extends BaseToolbar.Button.Props {}

// Unstyled roving-focus item: compose an MD3 button via `render`
// (<ToolbarButton render={<IconButton …/>} />) so the toolbar is one tab stop.
export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton(props, ref) {
    return <BaseToolbar.Button ref={ref} {...props} />;
  },
);

export interface ToolbarInputProps extends BaseToolbar.Input.Props {}

// Bare input slot (chat/search pills). Inherits the toolbar's colors and
// typography; joins the same roving tabindex as ToolbarButton items.
export const ToolbarInput = React.forwardRef<HTMLInputElement, ToolbarInputProps>(
  function ToolbarInput(props, ref) {
    const { className, ...rest } = props;
    return (
      <BaseToolbar.Input ref={ref} className={mergeClassName(styles.input, className)} {...rest} />
    );
  },
);
