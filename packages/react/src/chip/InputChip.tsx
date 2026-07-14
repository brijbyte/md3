"use client";
import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import buttonStyles from "../button/Button.module.css";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Chip.module.css";

export interface InputChipProps extends Omit<BaseButton.Props, "className" | "style"> {
  /** Selected state (MD3 selected input chip). @default false */
  selected?: boolean;
  /** Leading icon element, 18dp per MD3 spec. */
  icon?: React.ReactNode;
  /** Round 24dp avatar (replaces `icon`); the chip container becomes fully rounded. */
  avatar?: React.ReactNode;
  /** Renders the trailing remove button; called when it is clicked. */
  onRemove?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Accessible name for the remove button. @default 'Remove' */
  removeLabel?: string;
  /** Applied to the chip root; all other props go to the primary action button. */
  className?: string;
  style?: React.CSSProperties;
}

/**
 * MD3 input chip: user-entered content (e.g. recipients, tags). Root is a
 * non-interactive container so the primary action and remove button are
 * separate, individually focusable buttons.
 */
export const InputChip = React.forwardRef<HTMLDivElement, InputChipProps>(
  function InputChip(props, ref) {
    const {
      selected = false,
      icon,
      avatar,
      onRemove,
      removeLabel = "Remove",
      disabled,
      className,
      style,
      children,
      onPointerDown,
      onClick,
      ...rest
    } = props;
    const ripple = useRipple();
    const removeRipple = useRipple();

    return (
      <div
        ref={ref}
        // Chrome comes from Button's class; styles.root holds chip overrides.
        className={mergeClassName(`${buttonStyles.root} ${styles.root}`, className) as string}
        style={style}
        data-variant="input"
        data-selected={selected ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        data-avatar={avatar != null ? "" : undefined}
        data-has-icon={icon != null || avatar != null ? "" : undefined}
        data-removable={onRemove ? "" : undefined}
      >
        {/* Root-level state layer so hover tint and ripple span the whole chip. */}
        <span
          className={`${buttonStyles.stateLayer} ${styles.stateLayer}`}
          ref={ripple.containerRef}
          aria-hidden
        />
        <BaseButton
          className={styles.action}
          disabled={disabled}
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
          {avatar != null ? (
            <span className={styles.avatar}>{avatar}</span>
          ) : icon != null ? (
            <span className={`${buttonStyles.icon} ${styles.icon}`}>{icon}</span>
          ) : null}
          <span className={`${buttonStyles.label} ${styles.label}`}>{children}</span>
        </BaseButton>
        {onRemove ? (
          <BaseButton
            className={styles.trailing}
            disabled={disabled}
            aria-label={removeLabel}
            onClick={(event) => {
              removeRipple.onClick();
              onRemove?.(event);
            }}
            onPointerDown={removeRipple.onPointerDown}
          >
            <span
              className={styles.trailingStateLayer}
              ref={removeRipple.containerRef}
              aria-hidden
            />
            {/* Material Symbols `close` (outlined, w400). */}
            <svg className={styles.trailingIcon} viewBox="0 -960 960 960" aria-hidden>
              <path
                fill="currentColor"
                d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
              />
            </svg>
          </BaseButton>
        ) : null}
      </div>
    );
  },
);
