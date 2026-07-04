import * as React from "react";
import styles from "./Typography.module.css";

export type TypographyVariant =
  | "display-large"
  | "display-medium"
  | "display-small"
  | "headline-large"
  | "headline-medium"
  | "headline-small"
  | "title-large"
  | "title-medium"
  | "title-small"
  | "body-large"
  | "body-medium"
  | "body-small"
  | "label-large"
  | "label-medium"
  | "label-small";

type TypographyOwnProps<E extends React.ElementType> = {
  /** MD3 type-scale role; styled via `data-variant`. */
  variant?: TypographyVariant;
  /** Element or component to render — pick for semantics/SEO (`as="h1"`). */
  as?: E;
};

// Props of the rendered element (incl. its ref type) minus our own keys, so
// TS completion follows the `as` prop (`as="a"` → `href`, ref of the anchor).
export type TypographyProps<E extends React.ElementType = "p"> = TypographyOwnProps<E> &
  Omit<React.ComponentPropsWithRef<E>, keyof TypographyOwnProps<E>>;

// Loose internal shape: the public generic signature below is the real contract.
type TypographyImplProps = TypographyOwnProps<React.ElementType> & {
  className?: string;
} & Record<string, unknown>;

// Purely presentational: no 'use client', renders server-side.
export const Typography = React.forwardRef<Element, TypographyImplProps>(
  function Typography(props, ref) {
    const { as, variant = "body-large", className, ...rest } = props;
    const Component = (as ?? "p") as React.ElementType;
    return (
      <Component
        ref={ref}
        className={[styles.root, className].filter(Boolean).join(" ")}
        data-variant={variant}
        {...rest}
      />
    );
  },
) as <E extends React.ElementType = "p">(props: TypographyProps<E>) => React.ReactElement;
