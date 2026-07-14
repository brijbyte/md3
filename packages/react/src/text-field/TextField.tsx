"use client";
import * as React from "react";
import { useDirection } from "@base-ui/react/direction-provider";
import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./TextField.module.css";

export type TextFieldVariant = "filled" | "outlined";

export interface TextFieldProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "prefix" | "size" | "className"
> {
  /** MD3 text field variant. @default 'filled' */
  variant?: TextFieldVariant;
  /** Floating label shown at rest and shrunk above the input once filled/focused. */
  label?: React.ReactNode;
  /** Leading icon, 24dp per spec (never recolors in error state). */
  leadingIcon?: React.ReactNode;
  /** Trailing icon, 24dp per spec — compose with `IconButton` for a clear/toggle affordance. */
  trailingIcon?: React.ReactNode;
  /** Fixed text rendered before the input value (e.g. currency symbol). */
  prefix?: React.ReactNode;
  /** Fixed text rendered after the input value (e.g. unit). */
  suffix?: React.ReactNode;
  /** Helper text below the field; recolors to the error palette when `error` is set. */
  supportingText?: React.ReactNode;
  /** MD3 error state: error-colored label/indicator/supporting text and sets `aria-invalid`. */
  error?: boolean;
  /** Renders an auto-expanding `<textarea>` instead of a single-line `<input>`. */
  multiline?: boolean;
  /** Minimum visible rows when `multiline`. @default 1 */
  rows?: number;
  /** When native constraints (e.g. `required`) should be (re-)validated. @default 'onSubmit' */
  validationMode?: Field.Root.Props["validationMode"];
  /** Custom validation, run alongside native constraints. */
  validate?: Field.Root.Props["validate"];
  className?: string;
}

// Clicks anywhere in the container (padding, affixes, icons) focus the
// control. Composed interactive children (e.g. an IconButton toggle) still
// get their click — preventing mousedown only stops the focus move, so the
// control keeps/gains focus while the button's action fires.
const focusFromContainer = (event: React.MouseEvent<HTMLDivElement>) => {
  if (event.button !== 0) return;
  const control = event.currentTarget.querySelector<HTMLElement>("input, textarea");
  const target = event.target as HTMLElement;
  if (!control || target === control) return;
  event.preventDefault();
  control.focus();
};

export const TextField = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
  function TextField(props, ref) {
    const {
      variant = "filled",
      label,
      leadingIcon,
      trailingIcon,
      prefix,
      suffix,
      supportingText,
      error,
      multiline = false,
      rows = 1,
      validationMode,
      validate,
      className,
      disabled,
      onChange,
      ...rest
    } = props;
    // Base UI syncs the field's filled state only in a layout effect, so SSR
    // paints without data-filled and hydration animates the label to its
    // floated spot — mirror the value (via onChange when uncontrolled) so a
    // pre-filled label renders floated at once.
    const { value, defaultValue } = rest;
    const [uncontrolledFilled, setUncontrolledFilled] = React.useState(
      defaultValue != null && defaultValue !== "",
    );
    const isFilled = value !== undefined ? value != null && value !== "" : uncontrolledFilled;
    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setUncontrolledFilled(event.target.value !== "");
      onChange?.(event as React.ChangeEvent<HTMLInputElement>);
    };
    // `rows` only applies to the textarea Field.Control swaps to via `render`
    // — FieldControlProps is typed for <input> and has no `rows`, so merge
    // it in loosely rather than fighting the element union.
    const textareaProps: Record<string, unknown> = { ...rest, rows, onChange: handleChange };
    // The label's transform-origin has no logical keyword, and :dir() is off-limits
    // (bundlers lower it to :lang()) — resolve the direction in JS instead.
    const direction = useDirection();

    return (
      <Field.Root
        className={mergeClassName(styles.root, className)}
        dir={direction}
        data-variant={variant}
        data-dir={direction}
        disabled={disabled}
        invalid={error}
        validationMode={validationMode}
        validate={validate}
        {...(isFilled ? { "data-filled": "" } : null)}
      >
        <div
          className={styles.container}
          data-has-label={label != null || undefined}
          onMouseDown={focusFromContainer}
        >
          {leadingIcon ? (
            <span className={styles.icon} data-position="leading" aria-hidden>
              {leadingIcon}
            </span>
          ) : null}
          <div className={styles.content} data-trailing-icon={trailingIcon != null || undefined}>
            {label ? <Field.Label className={styles.label}>{label}</Field.Label> : null}
            <div className={styles.inputRow}>
              {prefix ? <span className={styles.affix}>{prefix}</span> : null}
              {multiline ? (
                <Field.Control
                  ref={ref as React.Ref<HTMLElement>}
                  className={styles.input}
                  render={<textarea />}
                  {...(textareaProps as Field.Control.Props)}
                />
              ) : (
                <Input
                  ref={ref as React.Ref<HTMLInputElement>}
                  className={styles.input}
                  onChange={handleChange}
                  {...rest}
                />
              )}
              {suffix ? <span className={styles.affix}>{suffix}</span> : null}
            </div>
          </div>
          {trailingIcon ? (
            <span className={styles.icon} data-position="trailing">
              {trailingIcon}
            </span>
          ) : null}
          {variant === "outlined" ? (
            <fieldset className={styles.outline} aria-hidden>
              <legend className={styles.outlineLabel}>{label}</legend>
            </fieldset>
          ) : (
            <span className={styles.indicator} aria-hidden />
          )}
        </div>
        {supportingText ? (
          <Field.Description render={<div />} className={styles.supportingText}>
            {supportingText}
          </Field.Description>
        ) : null}
      </Field.Root>
    );
  },
);
