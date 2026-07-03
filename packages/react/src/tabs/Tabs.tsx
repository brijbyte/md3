"use client";
import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { useRipple } from "../ripple/useRipple";
import { mergeClassName } from "../utils/mergeClassName";
import styles from "./Tabs.module.css";

export type TabsVariant = "primary" | "secondary";

export interface TabsProps extends BaseTabs.Root.Props {}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(props, ref) {
  const { className, ...rest } = props;
  return <BaseTabs.Root ref={ref} className={mergeClassName(styles.root, className)} {...rest} />;
});

export interface TabListProps extends BaseTabs.List.Props {
  /** MD3 tabs variant. @default 'primary' */
  variant?: TabsVariant;
}

export const TabList = React.forwardRef<HTMLDivElement, TabListProps>(function TabList(props, ref) {
  const { className, variant = "primary", activateOnFocus = true, children, ...rest } = props;
  return (
    <BaseTabs.List
      ref={ref}
      className={mergeClassName(styles.list, className)}
      data-variant={variant}
      activateOnFocus={activateOnFocus}
      {...rest}
    >
      {children}
      <BaseTabs.Indicator className={styles.indicator} renderBeforeHydration />
    </BaseTabs.List>
  );
});

export interface TabProps extends BaseTabs.Tab.Props {
  /** Icon element, sized per MD3 spec (24dp). Stacks above the label in primary tabs. */
  icon?: React.ReactNode;
}

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(function Tab(props, ref) {
  const { className, icon, children, onPointerDown, ...rest } = props;
  const ripple = useRipple();

  return (
    <BaseTabs.Tab
      ref={ref}
      className={mergeClassName(styles.tab, className)}
      data-stacked={icon && children != null ? "" : undefined}
      onPointerDown={(event) => {
        ripple.onPointerDown(event);
        onPointerDown?.(event);
      }}
      {...rest}
    >
      <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
      <span className={styles.content}>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        {children}
      </span>
    </BaseTabs.Tab>
  );
});

export interface TabPanelProps extends BaseTabs.Panel.Props {}

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  function TabPanel(props, ref) {
    const { className, ...rest } = props;
    return (
      <BaseTabs.Panel ref={ref} className={mergeClassName(styles.panel, className)} {...rest} />
    );
  },
);
