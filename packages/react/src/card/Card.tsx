import * as React from "react";
import styles from "./Card.module.css";

export type CardVariant = "elevated" | "filled" | "outlined";

export interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  /** MD3 card variant. @default 'elevated' */
  variant?: CardVariant;
}

// Static container per md.comp.{elevated,filled,outlined}-card — content and
// padding are the consumer's. Purely presentational: no 'use client'.
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(props, ref) {
  const { className, variant = "elevated", ...rest } = props;
  return (
    <div
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-variant={variant}
      {...rest}
    />
  );
});

export interface CardMediaProps extends React.ComponentPropsWithoutRef<"div"> {}

// Flush-media wrapper: clips children and rounds whichever corners touch the
// card's edge (first/last child). Shape plumbing, not anatomy — see docs.
export const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  function CardMedia(props, ref) {
    const { className, ...rest } = props;
    return (
      <div ref={ref} className={[styles.media, className].filter(Boolean).join(" ")} {...rest} />
    );
  },
);
