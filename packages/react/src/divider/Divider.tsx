"use client";
import * as React from "react";
import { Separator } from "@base-ui/react/separator";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Divider.module.css";

export interface DividerProps extends Separator.Props {
  /** Inset both ends (16dp). Shorthand for insetStart + insetEnd. */
  inset?: boolean;
  /** Inset the leading end 16dp — e.g. to align past a list item's leading icon. */
  insetStart?: boolean;
  /** Inset the trailing end 16dp. */
  insetEnd?: boolean;
}

// 1dp line in outline-variant; wraps Base UI Separator (role="separator" with
// data-orientation). Inset variants add 16dp per MD3 list divider spacing.
export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(function Divider(props, ref) {
  const { className, inset, insetStart, insetEnd, ...rest } = props;
  return (
    <Separator
      ref={ref}
      className={mergeClassName(styles.root, className)}
      data-inset-start={inset || insetStart ? "" : undefined}
      data-inset-end={inset || insetEnd ? "" : undefined}
      {...rest}
    />
  );
});
