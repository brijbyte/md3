import * as React from "react";
import styles from "./Badge.module.css";

export interface BadgeProps extends React.ComponentPropsWithoutRef<"span"> {}

// Small (dot) when empty, large (numbered) when it has children — MD3's two
// badge variants. Purely presentational: no 'use client', renders server-side.
// Overflow formatting ("999+") is the consumer's, per MDC.
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  const { className, children, "aria-label": ariaLabel, ...rest } = props;
  const large = children != null;
  // Per MD3 a11y spec: a numbered badge's own visible text is what's announced
  // ("5"), so it needs no label. A dot badge has no text, so it must announce
  // as "New notification" — default it unless the consumer overrides (directly
  // or via aria-labelledby).
  const label = large
    ? ariaLabel
    : (ariaLabel ?? (rest["aria-labelledby"] ? undefined : "New notification"));
  return (
    <span
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-variant={large ? "large" : "small"}
      aria-label={label}
      {...rest}
    >
      {large ? <span className={styles.label}>{children}</span> : null}
    </span>
  );
});
