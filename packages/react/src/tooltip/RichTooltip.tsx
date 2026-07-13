"use client";
import * as React from "react";
import { useDirection } from "@base-ui/react/direction-provider";
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import { mergeClassName } from "../utils/mergeClassName";
import { useLongPressOpen } from "./useLongPressOpen";
import styles from "./Tooltip.module.css";

export interface RichTooltipProps extends BasePreviewCard.Root.Props {}

interface RichTooltipContextValue {
  handle: BasePreviewCard.Handle<unknown>;
  /** Set by RichTooltipContent: an action makes the tooltip persistent (no auto-dismiss). */
  hasActionRef: React.RefObject<boolean>;
}

/** Shares the root's handle with its Trigger descendants so a long touch press can
    imperatively open the tooltip (Base UI's own open path is hover/focus only). */
const RichTooltipContext = React.createContext<RichTooltipContextValue | null>(null);

/** MD3 rich tooltip root: state only, renders no DOM. Built on Base UI's PreviewCard —
    unlike plain tooltip, rich tooltip content is interactive and stays open while hovered. */
export function RichTooltip(props: RichTooltipProps) {
  const internalHandleRef = React.useRef<BasePreviewCard.Handle<unknown> | null>(null);
  if (!internalHandleRef.current) internalHandleRef.current = BasePreviewCard.createHandle();
  const handle = props.handle ?? internalHandleRef.current;
  const hasActionRef = React.useRef(false);
  const contextValue = React.useMemo(() => ({ handle, hasActionRef }), [handle]);
  return (
    <RichTooltipContext.Provider value={contextValue}>
      <BasePreviewCard.Root {...props} handle={handle} />
    </RichTooltipContext.Provider>
  );
}

export interface RichTooltipTriggerProps extends BasePreviewCard.Trigger.Props {}

/** Unstyled trigger; usually `render`s an existing control (`render={<IconButton />}`). */
export const RichTooltipTrigger = React.forwardRef<HTMLAnchorElement, RichTooltipTriggerProps>(
  function RichTooltipTrigger(props, ref) {
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
    const context = React.useContext(RichTooltipContext);
    // Compose parity: action-less rich tooltips are transient, with-action ones persist.
    const longPress = useLongPressOpen<HTMLAnchorElement>(
      () => context?.handle.open(triggerId),
      () => {
        if (!context?.hasActionRef.current) context?.handle.close();
      },
    );
    return (
      <BasePreviewCard.Trigger
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

export interface RichTooltipContentProps extends Omit<
  BasePreviewCard.Popup.Props,
  "children" | "title"
> {
  /** Optional subhead shown above the supporting text. */
  title?: React.ReactNode;
  /** Optional text action (e.g. a `Button variant="text"`) shown below the supporting text. */
  action?: React.ReactNode;
  /** The tooltip's supporting text. */
  children?: React.ReactNode;
  /** Side of the anchor to position against. @default 'top' */
  side?: BasePreviewCard.Positioner.Props["side"];
  /** Alignment against the anchor. @default 'center' */
  align?: BasePreviewCard.Positioner.Props["align"];
  sideOffset?: BasePreviewCard.Positioner.Props["sideOffset"];
  alignOffset?: BasePreviewCard.Positioner.Props["alignOffset"];
  /** Positioning anchor; defaults to the trigger. */
  anchor?: BasePreviewCard.Positioner.Props["anchor"];
  /** Portal container. @default document.body */
  container?: BasePreviewCard.Portal.Props["container"];
  keepMounted?: BasePreviewCard.Portal.Props["keepMounted"];
  /** Escape hatch for the remaining Base UI Positioner props. */
  positionerProps?: Omit<BasePreviewCard.Positioner.Props, "children">;
}

/** The rich tooltip surface: Base UI Portal > Positioner > Popup, MD3-styled, laid out
    as an optional subhead, supporting text, and an optional action row. */
export const RichTooltipContent = React.forwardRef<HTMLDivElement, RichTooltipContentProps>(
  function RichTooltipContent(props, ref) {
    const {
      className,
      title,
      action,
      children,
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
    // Standalone body text (no subhead/action) uses the same uniform vertical
    // padding as a plain tooltip; otherwise subhead/action get their own spacing.
    const standalone = title == null && action == null;
    const context = React.useContext(RichTooltipContext);
    React.useEffect(() => {
      if (context) context.hasActionRef.current = action != null;
    }, [context, action]);
    const direction = useDirection();
    return (
      <BasePreviewCard.Portal container={container} keepMounted={keepMounted}>
        <BasePreviewCard.Positioner
          className={styles.richPositioner}
          side={side ?? "top" /* Compose's position providers prefer above the anchor */}
          align={align}
          sideOffset={sideOffset ?? 4}
          alignOffset={alignOffset}
          anchor={anchor}
          dir={direction === "rtl" ? "rtl" : undefined}
          {...positionerProps}
        >
          <BasePreviewCard.Popup
            ref={ref}
            className={mergeClassName(styles.richPopup, className)}
            {...rest}
          >
            {title != null ? <div className={styles.subhead}>{title}</div> : null}
            <div className={styles.supportingText} data-standalone={standalone || undefined}>
              {children}
            </div>
            {action != null ? <div className={styles.action}>{action}</div> : null}
          </BasePreviewCard.Popup>
        </BasePreviewCard.Positioner>
      </BasePreviewCard.Portal>
    );
  },
);
