"use client";
import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import styles from "./Switch.module.css";

export interface SwitchProps extends BaseSwitch.Root.Props {}

// No press ripple: per MD3 spec the switch handle grows to 28px while
// pressed and shows a state layer, but no bounded ripple.
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(props, ref) {
  const { className, ...rest } = props;

  return (
    <BaseSwitch.Root
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <BaseSwitch.Thumb className={styles.thumb}>
        <span className={styles.stateLayer} aria-hidden />
      </BaseSwitch.Thumb>
    </BaseSwitch.Root>
  );
});
