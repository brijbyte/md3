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

// Semantic default per variant, used when the consumer doesn't pass `as`.
const variantElement: Record<TypographyVariant, React.ElementType> = {
  "display-large": "h1",
  "display-medium": "h1",
  "display-small": "h1",
  "headline-large": "h2",
  "headline-medium": "h3",
  "headline-small": "h4",
  "title-large": "h5",
  "title-medium": "h6",
  "title-small": "h6",
  "body-large": "p",
  "body-medium": "p",
  "body-small": "p",
  "label-large": "span",
  "label-medium": "span",
  "label-small": "span",
};

// Purely presentational: no 'use client', renders server-side.
export const Typography = React.forwardRef<Element, TypographyImplProps>(
  function Typography(props, ref) {
    const { as, variant = "body-large", className, ...rest } = props;
    const Component = (as ?? variantElement[variant as TypographyVariant]) as React.ElementType;
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
