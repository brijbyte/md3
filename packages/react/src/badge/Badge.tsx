import * as React from "react";
import styles from "./Badge.module.css";

export interface BadgeProps extends React.ComponentPropsWithoutRef<"span"> {}

// Small (dot) when empty, large (numbered) when it has children — MD3's two
// badge variants. Purely presentational: no 'use client', renders server-side.
// Overflow formatting ("999+") is the consumer's, per MDC.
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  const { className, children, ...rest } = props;
  const large = children != null;
  return (
    <span
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-variant={large ? "large" : "small"}
      {...rest}
    >
      {large ? <span className={styles.label}>{children}</span> : null}
    </span>
  );
});
