"use client";
import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import type { CardVariant } from "./Card";
import styles from "./Card.module.css";

export interface ActionableCardProps extends BaseButton.Props {
  /** MD3 card variant. @default 'elevated' */
  variant?: CardVariant;
}

// Clickable/focusable card (Compose's Card(onClick)): Card's container plus the
// md.comp.*-card state tokens. Defaults to a div[role=button] so the card can
// hold rich (non-phrasing) content; pass render/nativeButton for <a>/<button>.
export const ActionableCard = React.forwardRef<HTMLElement, ActionableCardProps>(
  function ActionableCard(props, ref) {
    const {
      variant = "elevated",
      className,
      children,
      onPointerDown,
      onClick,
      render,
      nativeButton = false,
      ...rest
    } = props;
    const ripple = useRipple();

    const shared: BaseButton.Props & Record<`data-${string}`, string> = {
      // Cast: Base UI types the ref to its default <button>; ours is div/render.
      ref: ref as React.Ref<HTMLButtonElement>,
      render: render ?? <div />,
      nativeButton,
      className: mergeClassName(styles.root, className),
      "data-variant": variant,
      "data-actionable": "",
      onPointerDown: (event) => {
        ripple.onPointerDown(event);
        onPointerDown?.(event);
      },
      onClick: (event) => {
        ripple.onClick();
        onClick?.(event);
      },
      children: (
        <>
          <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
          {children}
        </>
      ),
    };

    return <BaseButton {...shared} {...rest} />;
  },
);
