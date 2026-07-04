"use client";
import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Button } from "../button/Button";
import buttonStyles from "../button/Button.module.css";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./SplitButton.module.css";

export type SplitButtonVariant = "filled" | "tonal" | "outlined" | "elevated";
export type SplitButtonSize = "xsmall" | "small" | "medium" | "large" | "xlarge";

// Lets the group stamp variant/size onto both halves, whose chrome is Button's CSS.
const SplitButtonContext = React.createContext<{
  variant: SplitButtonVariant;
  size: SplitButtonSize;
}>({ variant: "filled", size: "small" });

export interface SplitButtonProps extends React.ComponentPropsWithoutRef<"div"> {
  /** MD3 split button color variant (same schemes as common buttons). @default 'filled' */
  variant?: SplitButtonVariant;
  /** MD3 split button size (md.comp.split-button.<size> token sets). @default 'small' */
  size?: SplitButtonSize;
}

/** Container for a SplitButtonAction + SplitButtonMenu pair (2dp gap, fused pill). */
export const SplitButton = React.forwardRef<HTMLDivElement, SplitButtonProps>(
  function SplitButton(props, ref) {
    const { variant = "filled", size = "small", className, ...rest } = props;
    const context = React.useMemo(() => ({ variant, size }), [variant, size]);
    return (
      <SplitButtonContext.Provider value={context}>
        <div
          ref={ref}
          role="group"
          // Cast: className here is a plain string, never Base UI's callback form.
          className={mergeClassName(styles.root, className) as string}
          data-variant={variant}
          data-size={size}
          {...rest}
        />
      </SplitButtonContext.Provider>
    );
  },
);

export interface SplitButtonActionProps extends BaseButton.Props {
  /** Leading icon element, sized per MD3 spec (20–40dp by size). */
  icon?: React.ReactNode;
}

/** The leading (primary action) button: a Button with split geometry overrides. */
export const SplitButtonAction = React.forwardRef<HTMLButtonElement, SplitButtonActionProps>(
  function SplitButtonAction(props, ref) {
    const { className, ...rest } = props;
    const { variant, size } = React.useContext(SplitButtonContext);
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={mergeClassName(styles.leading, className)}
        {...rest}
      />
    );
  },
);

export interface SplitButtonMenuProps extends Omit<BaseButton.Props, "aria-label"> {
  /** Accessible name — the menu button only shows an icon. */
  "aria-label": string;
}

/** The trailing (menu) button. Children = the chevron icon; open styling (full-round
 *  morph, 180° icon spin, held state layer) keys off `aria-expanded`/`data-popup-open`,
 *  so composing a Base UI Menu.Trigger via `render` works out of the box. */
export const SplitButtonMenu = React.forwardRef<HTMLButtonElement, SplitButtonMenuProps>(
  function SplitButtonMenu(props, ref) {
    const { className, children, onPointerDown, ...rest } = props;
    const { variant, size } = React.useContext(SplitButtonContext);
    const ripple = useRipple();

    return (
      <BaseButton
        ref={ref}
        className={mergeClassName(`${buttonStyles.root} ${styles.trailing}`, className)}
        // Button's variant/size/disabled CSS keys off these attrs on the element.
        {...{ "data-variant": variant, "data-size": size }}
        onPointerDown={(event) => {
          ripple.onPointerDown(event);
          onPointerDown?.(event);
        }}
        {...rest}
      >
        <span
          className={`${buttonStyles.stateLayer} ${styles.stateLayer}`}
          ref={ripple.containerRef}
          aria-hidden
        />
        <span className={`${buttonStyles.icon} ${styles.menuIcon}`}>{children}</span>
      </BaseButton>
    );
  },
);
