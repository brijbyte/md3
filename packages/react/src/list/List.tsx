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

export interface ListItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
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
  /** Render an interactive row (state layer + ripple + focus ring). Implied by `href`. */
  interactive?: boolean;
  /** Render the row as a link. */
  href?: string;
  /** Root element. `"label"` makes the whole row activate the single control inside it
      (a Checkbox/Switch/Radio) — the control keeps focus and keyboard, no nested button. */
  component?: "li" | "label";
}

// MD3 ListItem. Non-interactive `<li>` by default; an interactive row renders a
// `<button>`/`<a>` wrapped in a bare `<li>` so list semantics survive. Line count
// (1/2/3) drives min-height (56/72/88dp), block padding (8/8/12dp), and — at three
// lines — top alignment, per Compose ListItem.
export const ListItem = React.forwardRef<HTMLElement, ListItemProps>(function ListItem(props, ref) {
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
    component,
    onPointerDown,
    onClick,
    ...rest
  } = props;

  const asLabel = component === "label";
  const isLink = href != null;
  // A label row delegates to its inner control, so it gets the interactive visuals
  // (state layer + ripple) but no button/link semantics or focus ring of its own.
  const isInteractive =
    !disabled && !asLabel && (interactive === true || isLink || onClick != null);
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
    return (
      <li
        ref={ref as React.Ref<HTMLLIElement>}
        className={rowClassName}
        aria-disabled={disabled || undefined}
        {...dataProps}
        {...rest}
      >
        {body}
      </li>
    );
  }

  const row = isLink ? (
    <a
      ref={ref as React.Ref<HTMLAnchorElement>}
      className={rowClassName}
      href={href}
      {...dataProps}
      {...handlers}
      {...rest}
    >
      {body}
    </a>
  ) : (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      className={rowClassName}
      {...dataProps}
      {...handlers}
      {...rest}
    >
      {body}
    </button>
  );

  return <li className={styles.wrapper}>{row}</li>;
});
