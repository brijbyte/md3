"use client";
import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Chip.module.css";

export interface ChipProps extends BaseButton.Props {
  /** Elevated container (level1 shadow) instead of the outlined default. @default false */
  elevated?: boolean;
  /** Leading icon element, 18dp per MD3 spec. */
  icon?: React.ReactNode;
}

function createChip(variant: "assist" | "suggestion", displayName: string) {
  const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(function Chip(props, ref) {
    const { elevated = false, icon, className, children, onPointerDown, ...rest } = props;
    const ripple = useRipple();

    return (
      <BaseButton
        ref={ref}
        className={mergeClassName(styles.root, className)}
        data-variant={variant}
        data-elevated={elevated ? "" : undefined}
        data-has-icon={icon != null ? "" : undefined}
        onPointerDown={(event) => {
          ripple.onPointerDown(event);
          onPointerDown?.(event);
        }}
        {...rest}
      >
        <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
        {icon != null ? <span className={styles.icon}>{icon}</span> : null}
        <span className={styles.label}>{children}</span>
      </BaseButton>
    );
  });
  Chip.displayName = displayName;
  return Chip;
}

/** MD3 assist chip: a smart/automated action in context (button semantics). */
export const AssistChip = createChip("assist", "AssistChip");

/** MD3 suggestion chip: a dynamically generated suggestion (button semantics). */
export const SuggestionChip = createChip("suggestion", "SuggestionChip");
