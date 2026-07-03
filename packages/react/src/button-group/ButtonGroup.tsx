"use client";
import * as React from "react";
import { mergeClassName } from "../utils/mergeClassName";
import { useWidthMorph } from "./useWidthMorph";
import styles from "./ButtonGroup.module.css";

export type ButtonGroupVariant = "standard" | "connected";

export interface ButtonGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  /** MD3 button group variant. @default 'standard' */
  variant?: ButtonGroupVariant;
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(props, ref) {
    const { variant = "standard", className, onPointerDown, ...rest } = props;
    // Width morph is a standard-group behavior; connected groups morph corners only.
    const morphPointerDown = useWidthMorph(variant === "standard");

    return (
      <div
        ref={ref}
        role="group"
        // Cast: className here is a plain string, never Base UI's callback form.
        className={mergeClassName(styles.root, className) as string}
        data-variant={variant}
        onPointerDown={(event) => {
          morphPointerDown(event);
          onPointerDown?.(event);
        }}
        {...rest}
      />
    );
  },
);
