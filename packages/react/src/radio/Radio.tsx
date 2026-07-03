"use client";
import * as React from "react";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { useRipple } from "../ripple/useRipple";
import styles from "./Radio.module.css";

export interface RadioProps extends BaseRadio.Root.Props {}

export const Radio = React.forwardRef<HTMLButtonElement, RadioProps>(function Radio(props, ref) {
  const { className, onPointerDown, ...rest } = props;
  const ripple = useRipple();

  return (
    <BaseRadio.Root
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(" ")}
      onPointerDown={(event) => {
        ripple.onPointerDown(event);
        onPointerDown?.(event);
      }}
      {...rest}
    >
      <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
      <span className={styles.circle}>
        <BaseRadio.Indicator className={styles.dot} keepMounted />
      </span>
    </BaseRadio.Root>
  );
});

// Unstyled group container from Base UI (roving focus, form integration).
export { RadioGroup };
