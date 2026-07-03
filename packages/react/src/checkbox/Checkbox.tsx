"use client";
import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends BaseCheckbox.Root.Props {}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox(props, ref) {
    const { className, onPointerDown, ...rest } = props;
    const ripple = useRipple();

    return (
      <BaseCheckbox.Root
        ref={ref}
        className={mergeClassName(styles.root, className)}
        onPointerDown={(event) => {
          ripple.onPointerDown(event);
          onPointerDown?.(event);
        }}
        {...rest}
      >
        <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
        <span className={styles.box}>
          <BaseCheckbox.Indicator className={styles.indicator}>
            <svg viewBox="0 0 18 18" aria-hidden className={styles.checkIcon}>
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                d="M3.5 9.3 7.2 13l7.3-7.6"
              />
            </svg>
            <svg viewBox="0 0 18 18" aria-hidden className={styles.indeterminateIcon}>
              <path fill="none" stroke="currentColor" strokeWidth="2.4" d="M4 9h10" />
            </svg>
          </BaseCheckbox.Indicator>
        </span>
      </BaseCheckbox.Root>
    );
  },
);
