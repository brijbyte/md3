"use client";
import * as React from "react";
import { Toggle } from "@base-ui/react/toggle";
import buttonStyles from "../button/Button.module.css";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Chip.module.css";

export interface FilterChipProps extends Toggle.Props {
  /** Elevated container (level1 shadow) instead of the outlined default. @default false */
  elevated?: boolean;
  /** Leading icon element, 18dp; replaced by the checkmark while selected. */
  icon?: React.ReactNode;
}

/** MD3 filter chip: a toggleable filter (aria-pressed semantics, checkmark when selected). */
export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  function FilterChip(props, ref) {
    const { elevated = false, icon, className, children, onPointerDown, onClick, ...rest } = props;
    const ripple = useRipple();

    return (
      <Toggle
        ref={ref}
        // Chrome comes from Button's class; styles.root holds chip overrides.
        className={mergeClassName(`${buttonStyles.root} ${styles.root}`, className)}
        data-variant="filter"
        data-elevated={elevated ? "" : undefined}
        data-has-icon={icon != null ? "" : undefined}
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
        <span
          className={`${buttonStyles.stateLayer} ${styles.stateLayer}`}
          ref={ripple.containerRef}
          aria-hidden
        />
        {/* Selected checkmark (material-web's path); CSS swaps it with the leading icon. */}
        <span className={`${buttonStyles.icon} ${styles.icon} ${styles.checkmark}`} aria-hidden>
          <svg viewBox="0 0 18 18">
            <path
              fill="currentColor"
              d="M6.75012 12.1274L3.62262 8.99988L2.55762 10.0574L6.75012 14.2499L15.7501 5.24988L14.6926 4.19238L6.75012 12.1274Z"
            />
          </svg>
        </span>
        {icon != null ? (
          <span className={`${buttonStyles.icon} ${styles.icon} ${styles.leading}`}>{icon}</span>
        ) : null}
        <span className={`${buttonStyles.label} ${styles.label}`}>{children}</span>
      </Toggle>
    );
  },
);
