"use client";
import * as React from "react";
import { useRipple } from "../ripple/useRipple";
import styles from "./List.module.css";

const cx = (own: string, extra: string | undefined) => [own, extra].filter(Boolean).join(" ");

export interface ListProps extends React.ComponentPropsWithoutRef<"ul"> {}

/** MD3 list container: a `<ul role="list">` with 8dp block padding, no bullets. */
export const List = React.forwardRef<HTMLUListElement, ListProps>(function List(props, ref) {
  const { className, ...rest } = props;
  return <ul ref={ref} role="list" className={cx(styles.list, className)} {...rest} />;
});

type ListItemOwnProps<E extends React.ElementType> = {
  /** Primary text (body-large). */
  children?: React.ReactNode;
  /** Small label above the headline (label-small). */
  overline?: React.ReactNode;
  /** Secondary text below the headline (body-medium); wrapping promotes to three lines. */
  supportingText?: React.ReactNode;
  /** Leading slot — icon (24dp), avatar, image, or video. */
  leading?: React.ReactNode;
  /** Trailing slot — typically a 24dp icon. */
  trailing?: React.ReactNode;
  /** Trailing text before the trailing slot (label-small), e.g. a count or timestamp. */
  trailingSupportingText?: React.ReactNode;
  /** Force the line count; otherwise derived from overline/supportingText presence.
      Set to 3 when the supporting text is known to wrap. */
  lines?: 1 | 2 | 3;
  disabled?: boolean;
  /** Selected state for selectable lists — tints the row and sets `aria-selected`. */
  selected?: boolean;
  /** Render an interactive row (state layer + ripple + focus ring). Implied by `href`,
      `onClick`, or a custom `as`; pass `false` to opt out. */
  interactive?: boolean;
  /** Render the row as a link. */
  href?: string;
  /** Row element or component — e.g. a router `Link`. A custom component implies
      `interactive`; non-`li` rows are wrapped in a bare `<li>` so list semantics survive.
      `"label"` makes the whole row activate the single control inside it
      (a Checkbox/Switch/Radio) — the control keeps focus and keyboard, no nested button. */
  as?: E;
};

// Props of the rendered element (incl. its ref type) minus our own keys, so
// TS completion follows the `as` prop (`as={Link}` → `to`, …).
export type ListItemProps<E extends React.ElementType = "li"> = ListItemOwnProps<E> &
  Omit<React.ComponentPropsWithRef<E>, keyof ListItemOwnProps<E>>;

// Loose internal shape: the public generic signature below is the real contract.
type ListItemImplProps = ListItemOwnProps<React.ElementType> &
  Omit<React.HTMLAttributes<HTMLElement>, "children">;

// MD3 ListItem. Non-interactive `<li>` by default; an interactive row renders a
// `<button>`/`<a>` wrapped in a bare `<li>` so list semantics survive. Line count
// (1/2/3) drives min-height (56/72/88dp), block padding (8/8/12dp), and — at three
// lines — top alignment, per Compose ListItem.
export const ListItem = React.forwardRef<HTMLElement, ListItemImplProps>(
  function ListItem(props, ref) {
    const {
      className,
      children,
      overline,
      supportingText,
      leading,
      trailing,
      trailingSupportingText,
      lines,
      disabled,
      selected,
      interactive,
      href,
      as: asProp,
      onPointerDown,
      onClick,
      ...rest
    } = props;

    const asLabel = asProp === "label";
    const isLink = href != null;
    const isCustom = asProp != null && asProp !== "li" && !asLabel;
    // A label row delegates to its inner control, so it gets the interactive visuals
    // (state layer + ripple) but no button/link semantics or focus ring of its own.
    const isInteractive =
      !disabled && !asLabel && (interactive ?? (isLink || onClick != null || isCustom));
    const showStateLayer = isInteractive || (asLabel && !disabled);
    const ripple = useRipple();

    const autoLines =
      overline != null && supportingText != null
        ? 3
        : overline != null || supportingText != null
          ? 2
          : 1;
    const lineCount = lines ?? autoLines;

    const dataProps = {
      "data-lines": String(lineCount),
      "data-interactive": showStateLayer ? "" : undefined,
      "data-disabled": disabled ? "" : undefined,
      "data-selected": selected ? "" : undefined,
      // aria-selected needs a listbox/option context this doesn't establish;
      // aria-current is valid on any element and announces the chosen row.
      "aria-current": selected ? ("true" as const) : undefined,
    };

    const handlers = {
      onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
        if (!disabled) ripple.onPointerDown(event);
        onPointerDown?.(event);
      },
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        if (!disabled) ripple.onClick();
        onClick?.(event);
      },
    };

    const body = (
      <>
        {showStateLayer ? (
          <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
        ) : null}
        {leading != null ? <span className={styles.leading}>{leading}</span> : null}
        <span className={styles.body}>
          {overline != null ? <span className={styles.overline}>{overline}</span> : null}
          <span className={styles.headline}>{children}</span>
          {supportingText != null ? (
            <span className={styles.supporting}>{supportingText}</span>
          ) : null}
        </span>
        {trailingSupportingText != null || trailing != null ? (
          <span className={styles.trailing}>
            {trailingSupportingText != null ? (
              <span className={styles.trailingText}>{trailingSupportingText}</span>
            ) : null}
            {trailing}
          </span>
        ) : null}
      </>
    );

    const rowClassName = cx(styles.item, className);

    // Label row: wraps the content so a click anywhere activates the inner control.
    // The <li> keeps list semantics; the <label> is not itself a focus target.
    if (asLabel) {
      return (
        <li className={styles.wrapper}>
          <label
            ref={ref as React.Ref<HTMLLabelElement>}
            className={rowClassName}
            {...dataProps}
            {...handlers}
            {...rest}
          >
            {body}
          </label>
        </li>
      );
    }

    if (!isInteractive) {
      const Root = (asProp ?? "li") as React.ElementType;
      return (
        <Root
          ref={ref}
          className={rowClassName}
          aria-disabled={disabled || undefined}
          href={Root === "li" ? undefined : href}
          {...dataProps}
          {...rest}
        >
          {body}
        </Root>
      );
    }

    const Row = (asProp ?? (isLink ? "a" : "button")) as React.ElementType;
    const row = (
      <Row
        ref={ref}
        type={Row === "button" ? "button" : undefined}
        className={rowClassName}
        href={href}
        {...dataProps}
        {...handlers}
        {...rest}
      >
        {body}
      </Row>
    );

    return Row === "li" ? row : <li className={styles.wrapper}>{row}</li>;
  },
) as <E extends React.ElementType = "li">(props: ListItemProps<E>) => React.ReactElement;
