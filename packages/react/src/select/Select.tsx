"use client";
import * as React from "react";
import { Field } from "@base-ui/react/field";
import { Select as BaseSelect } from "@base-ui/react/select";
import menuStyles from "../menu/Menu.module.css";
import { useRipple } from "../ripple/useRipple";
import textFieldStyles from "../text-field/TextField.module.css";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Select.module.css";

export type SelectVariant = "filled" | "outlined";

// SelectTrigger renders the outline fieldset (outlined) or the active
// indicator (filled) itself, so it needs the root's variant.
const SelectVariantContext = React.createContext<SelectVariant>("filled");

export interface SelectProps<
  Value = any,
  Multiple extends boolean | undefined = false,
> extends BaseSelect.Root.Props<Value, Multiple> {
  /** MD3 text field variant of the trigger. @default 'filled' */
  variant?: SelectVariant;
  /** MD3 error state: error-colored label/indicator/supporting text. */
  error?: boolean;
  /** When native constraints (e.g. `required`) should be (re-)validated. @default 'onSubmit' */
  validationMode?: Field.Root.Props["validationMode"];
  /** Custom validation, run alongside native constraints. */
  validate?: Field.Root.Props["validate"];
  className?: string;
}

/** MD3 select root: a text-field-shaped trigger opening a menu of options
    (Base UI Select inside a Base UI Field for label/validation wiring). */
export function Select<Value = any, Multiple extends boolean | undefined = false>(
  props: SelectProps<Value, Multiple>,
) {
  const {
    variant = "filled",
    error,
    validationMode,
    validate,
    className,
    disabled,
    open,
    defaultOpen,
    onOpenChange,
    value,
    defaultValue,
    onValueChange,
    ...rest
  } = props;
  // Spec: an open select shows the focused field treatment, but Base UI moves
  // focus into the popup — mirror open state onto the field's focused attr.
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const isOpen = open ?? uncontrolledOpen;
  // Base UI syncs the field's filled state only in a layout effect, so SSR
  // paints without data-filled and hydration animates the label to its floated
  // spot — mirror the value so a pre-selected label renders floated at once.
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const currentValue = value !== undefined ? value : uncontrolledValue;
  const isFilled = Array.isArray(currentValue)
    ? currentValue.length > 0
    : currentValue != null && currentValue !== "";

  return (
    <Field.Root
      className={mergeClassName(`${textFieldStyles.root} ${styles.root}`, className)}
      data-variant={variant}
      disabled={disabled}
      invalid={error}
      validationMode={validationMode}
      validate={validate}
      {...(isOpen ? { "data-focused": "" } : null)}
      {...(isFilled ? { "data-filled": "" } : null)}
    >
      <SelectVariantContext.Provider value={variant}>
        <BaseSelect.Root
          disabled={disabled}
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={(nextOpen, eventDetails) => {
            setUncontrolledOpen(nextOpen);
            onOpenChange?.(nextOpen, eventDetails);
          }}
          value={value}
          defaultValue={defaultValue}
          onValueChange={(nextValue, eventDetails) => {
            setUncontrolledValue(nextValue);
            onValueChange?.(nextValue, eventDetails);
          }}
          {...(rest as BaseSelect.Root.Props<Value, Multiple>)}
        />
      </SelectVariantContext.Provider>
    </Field.Root>
  );
}

export interface SelectTriggerProps extends BaseSelect.Trigger.Props {
  /** Floating label shown at rest and shrunk above the value once filled/open. */
  label?: React.ReactNode;
  /** Leading icon, 24dp per spec. */
  leadingIcon?: React.ReactNode;
  /** Trailing icon; defaults to the dropdown arrow (rotates while open). */
  trailingIcon?: React.ReactNode;
  /** Shown in place of the value while nothing is selected (once the label floats). */
  placeholder?: React.ReactNode;
  /** Custom value formatting (Base UI Select.Value children). */
  renderValue?: BaseSelect.Value.Props["children"];
  /** Helper text below the field; recolors to the error palette when `error` is set. */
  supportingText?: React.ReactNode;
}

/** The text-field-shaped button that opens the menu and shows the selection. */
export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger(props, ref) {
    const {
      label,
      leadingIcon,
      trailingIcon,
      placeholder,
      renderValue,
      supportingText,
      className,
      ...rest
    } = props;
    const variant = React.useContext(SelectVariantContext);
    return (
      <>
        <BaseSelect.Trigger
          ref={ref}
          className={mergeClassName(`${textFieldStyles.container} ${styles.trigger}`, className)}
          data-has-label={label != null || undefined}
          {...rest}
        >
          {leadingIcon ? (
            <span className={textFieldStyles.icon} data-position="leading" aria-hidden>
              {leadingIcon}
            </span>
          ) : null}
          <div className={textFieldStyles.content} data-trailing-icon="">
            {label ? (
              // A <span> (not <label>) — it lives inside the trigger button;
              // nativeLabel=false makes Field associate it via aria-labelledby.
              <Field.Label
                className={`${textFieldStyles.label} ${styles.label}`}
                render={<span />}
                nativeLabel={false}
              >
                {label}
              </Field.Label>
            ) : null}
            <div className={textFieldStyles.inputRow}>
              <BaseSelect.Value
                className={`${textFieldStyles.input} ${styles.value}`}
                placeholder={placeholder}
              >
                {renderValue}
              </BaseSelect.Value>
            </div>
          </div>
          <span className={textFieldStyles.icon} data-position="trailing" aria-hidden>
            <BaseSelect.Icon className={styles.dropdownIcon}>
              {trailingIcon ?? (
                // Material Symbols arrow_drop_down.
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              )}
            </BaseSelect.Icon>
          </span>
          {variant === "outlined" ? (
            <fieldset className={textFieldStyles.outline} aria-hidden>
              <legend className={textFieldStyles.outlineLabel}>{label}</legend>
            </fieldset>
          ) : (
            <span className={textFieldStyles.indicator} aria-hidden />
          )}
        </BaseSelect.Trigger>
        {supportingText ? (
          <Field.Description render={<div />} className={textFieldStyles.supportingText}>
            {supportingText}
          </Field.Description>
        ) : null}
      </>
    );
  },
);

export interface SelectContentProps extends BaseSelect.Popup.Props {
  /** Density scale: each step below 0 tightens option heights by 4px. @default 0 */
  density?: 0 | -1 | -2 | -3;
  /** Side of the trigger to position against. @default 'bottom' */
  side?: BaseSelect.Positioner.Props["side"];
  /** Alignment against the trigger. @default 'start' */
  align?: BaseSelect.Positioner.Props["align"];
  sideOffset?: BaseSelect.Positioner.Props["sideOffset"];
  alignOffset?: BaseSelect.Positioner.Props["alignOffset"];
  /** Positioning anchor; defaults to the trigger. */
  anchor?: BaseSelect.Positioner.Props["anchor"];
  /** Portal container. @default document.body */
  container?: BaseSelect.Portal.Props["container"];
  /** Escape hatch for the remaining Base UI Positioner props. */
  positionerProps?: Omit<BaseSelect.Positioner.Props, "children">;
}

/** The options menu: Base UI Portal > Positioner > Popup, styled as an MD3 menu
    that opens below the trigger and matches its width. */
export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  function SelectContent(props, ref) {
    const {
      className,
      density,
      side = "bottom",
      align = "start",
      sideOffset,
      alignOffset,
      anchor,
      container,
      positionerProps,
      ...rest
    } = props;
    return (
      <BaseSelect.Portal container={container}>
        <BaseSelect.Positioner
          className={`${menuStyles.positioner} ${styles.positioner}`}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          anchor={anchor}
          // MD3 positions the menu as a plain dropdown, never over the trigger.
          alignItemWithTrigger={false}
          {...positionerProps}
        >
          <BaseSelect.Popup
            ref={ref}
            className={mergeClassName(`${menuStyles.popup} ${styles.popup}`, className)}
            data-density={density ? density : undefined}
            {...rest}
          />
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    );
  },
);

export interface SelectItemProps extends BaseSelect.Item.Props {
  /** Leading icon element, 24dp per MD3 spec. */
  leadingIcon?: React.ReactNode;
  /** Trailing icon element, 24dp per MD3 spec. */
  trailingIcon?: React.ReactNode;
  /** Trailing supporting text. */
  trailingText?: React.ReactNode;
}

/** An option row; while selected it fills with secondary-container and shows a
    leading checkmark (menus guidelines' single/multi-select treatment). */
export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  function SelectItem(props, ref) {
    const {
      className,
      leadingIcon,
      trailingIcon,
      trailingText,
      children,
      onPointerDown,
      onClick,
      ...rest
    } = props;
    const ripple = useRipple();
    return (
      <BaseSelect.Item
        ref={ref}
        className={mergeClassName(`${menuStyles.item} ${styles.item}`, className)}
        onPointerDown={(event) => {
          if (!props.disabled) ripple.onPointerDown(event);
          onPointerDown?.(event);
        }}
        onClick={(event) => {
          if (!props.disabled) ripple.onClick();
          onClick?.(event);
        }}
        {...rest}
      >
        <span className={menuStyles.stateLayer} ref={ripple.containerRef} aria-hidden />
        <BaseSelect.ItemIndicator className={`${menuStyles.icon} ${styles.check}`} data-indicator>
          {/* Material Symbols check. */}
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </BaseSelect.ItemIndicator>
        {leadingIcon != null ? <span className={menuStyles.icon}>{leadingIcon}</span> : null}
        <BaseSelect.ItemText className={menuStyles.label}>{children}</BaseSelect.ItemText>
        {trailingText != null || trailingIcon != null ? (
          <span className={menuStyles.trailing}>
            {trailingText != null ? (
              <span className={menuStyles.trailingText}>{trailingText}</span>
            ) : null}
            {trailingIcon != null ? <span className={menuStyles.icon}>{trailingIcon}</span> : null}
          </span>
        ) : null}
      </BaseSelect.Item>
    );
  },
);

export interface SelectGroupProps extends BaseSelect.Group.Props {
  /** Optional section label rendered above the group's items. */
  label?: React.ReactNode;
}

export const SelectGroup = React.forwardRef<HTMLDivElement, SelectGroupProps>(
  function SelectGroup(props, ref) {
    const { label, children, ...rest } = props;
    return (
      <BaseSelect.Group ref={ref} {...rest}>
        {label != null ? (
          <BaseSelect.GroupLabel className={menuStyles.groupLabel}>{label}</BaseSelect.GroupLabel>
        ) : null}
        {children}
      </BaseSelect.Group>
    );
  },
);

export interface SelectSeparatorProps extends BaseSelect.Separator.Props {}

export const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  function SelectSeparator(props, ref) {
    const { className, ...rest } = props;
    return (
      <BaseSelect.Separator
        ref={ref}
        className={mergeClassName(menuStyles.separator, className)}
        {...rest}
      />
    );
  },
);
