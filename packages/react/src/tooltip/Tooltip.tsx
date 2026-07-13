"use client";
import * as React from "react";
import { useDirection } from "@base-ui/react/direction-provider";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { mergeClassName } from "../utils/mergeClassName";
import { useLongPressOpen } from "./useLongPressOpen";
import styles from "./Tooltip.module.css";

export interface TooltipProps extends BaseTooltip.Root.Props {}

/** Shares the root's handle with its Trigger descendants so a long touch press can
    imperatively open the tooltip (Base UI's own open path is hover/focus only). */
const TooltipHandleContext = React.createContext<BaseTooltip.Handle<unknown> | null>(null);

/** MD3 plain tooltip root: state only, renders no DOM (Base UI Tooltip.Root). */
export function Tooltip(props: TooltipProps) {
  const internalHandleRef = React.useRef<BaseTooltip.Handle<unknown> | null>(null);
  if (!internalHandleRef.current) internalHandleRef.current = BaseTooltip.createHandle();
  const handle = props.handle ?? internalHandleRef.current;
  return (
    <TooltipHandleContext.Provider value={handle}>
      <BaseTooltip.Root {...props} handle={handle} />
    </TooltipHandleContext.Provider>
  );
}

export interface TooltipProviderProps extends BaseTooltip.Provider.Props {}

/** Shares open/close delay across a group of tooltips, e.g. a toolbar's icon buttons. */
export function TooltipProvider(props: TooltipProviderProps) {
  return <BaseTooltip.Provider {...props} />;
}

export interface TooltipTriggerProps extends BaseTooltip.Trigger.Props {}

/** Unstyled trigger; usually `render`s an existing control (`render={<IconButton />}`). */
export const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  function TooltipTrigger(props, ref) {
    const {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClickCapture,
      onContextMenu,
      id: idProp,
      ...rest
    } = props;
    const generatedId = React.useId();
    const triggerId = idProp ?? generatedId;
    const handle = React.useContext(TooltipHandleContext);
    // Plain tooltips are transient: a long-press-opened one self-dismisses (Compose parity).
    const longPress = useLongPressOpen<HTMLButtonElement>(
      () => handle?.open(triggerId),
      () => handle?.close(),
    );
    return (
      <BaseTooltip.Trigger
        ref={ref}
        id={triggerId}
        onPointerDown={(event) => {
          longPress.onPointerDown(event);
          onPointerDown?.(event);
        }}
        onPointerMove={(event) => {
          longPress.onPointerMove(event);
          onPointerMove?.(event);
        }}
        onPointerUp={(event) => {
          longPress.onPointerUp();
          onPointerUp?.(event);
        }}
        onPointerCancel={(event) => {
          longPress.onPointerCancel();
          onPointerCancel?.(event);
        }}
        onClickCapture={(event) => {
          if (!longPress.onClickCapture(event)) onClickCapture?.(event);
        }}
        onContextMenu={(event) => {
          longPress.onContextMenu(event);
          onContextMenu?.(event);
        }}
        {...rest}
      />
    );
  },
);

export interface TooltipContentProps extends BaseTooltip.Popup.Props {
  /** Side of the anchor to position against. @default 'top' */
  side?: BaseTooltip.Positioner.Props["side"];
  /** Alignment against the anchor. @default 'center' */
  align?: BaseTooltip.Positioner.Props["align"];
  sideOffset?: BaseTooltip.Positioner.Props["sideOffset"];
  alignOffset?: BaseTooltip.Positioner.Props["alignOffset"];
  /** Positioning anchor; defaults to the trigger. */
  anchor?: BaseTooltip.Positioner.Props["anchor"];
  /** Portal container. @default document.body */
  container?: BaseTooltip.Portal.Props["container"];
  keepMounted?: BaseTooltip.Portal.Props["keepMounted"];
  /** Escape hatch for the remaining Base UI Positioner props. */
  positionerProps?: Omit<BaseTooltip.Positioner.Props, "children">;
}

/** The tooltip surface: Base UI Portal > Positioner > Popup, MD3-styled. Non-interactive per spec. */
export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent(props, ref) {
    const {
      className,
      side,
      align,
      sideOffset,
      alignOffset,
      anchor,
      container,
      keepMounted,
      positionerProps,
      ...rest
    } = props;
    const direction = useDirection();
    return (
      <BaseTooltip.Portal container={container} keepMounted={keepMounted}>
        <BaseTooltip.Positioner
          className={styles.plainPositioner}
          side={side}
          align={align}
          sideOffset={sideOffset ?? 4}
          alignOffset={alignOffset}
          anchor={anchor}
          dir={direction === "rtl" ? "rtl" : undefined}
          {...positionerProps}
        >
          <BaseTooltip.Popup
            ref={ref}
            className={mergeClassName(styles.plainPopup, className)}
            {...rest}
          />
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    );
  },
);
