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

// Base UI's prehydration script bails (and never retries) when it executes inside
// one of React streaming's hidden Suspense segments — offsetWidth is 0 there, so the
// indicator stays [hidden] until hydration and pops in late. This companion script
// re-runs it (a fresh element with the same text; cloneNode keeps already-started)
// once the segment goes live. Reveals are async (React batches them past
// DOMContentLoaded), so watch DOM mutations — the observer is a microtask, running
// after the reveal but before its first paint. Hydration or success disconnects.
const indicatorRetryScript =
  "(function(){var s=document.currentScript,b=s&&s.previousElementSibling,i=b&&b.previousElementSibling;" +
  "if(!i||!i.hasAttribute('hidden'))return;var l=i.closest('[role=\"tablist\"]');" +
  "if(!l||l.offsetWidth>0)return;var o=new MutationObserver(function(){" +
  "if(!i.hasAttribute('hidden')){o.disconnect();return}" +
  "if(l.offsetWidth>0){o.disconnect();var n=document.createElement('script');" +
  "n.textContent=b.textContent;b.replaceWith(n)}});" +
  "o.observe(document.documentElement,{childList:true,subtree:true});" +
  "setTimeout(function(){o.disconnect()},20000)})();";

const noopSubscribe = () => () => {};

export const TabList = React.forwardRef<HTMLDivElement, TabListProps>(function TabList(props, ref) {
  const { className, variant = "primary", activateOnFocus = true, children, ...rest } = props;
  // True on the server and during the hydration pass only — mirrors Base UI's
  // isHydrating gate so client-only mounts never execute the retry script.
  const isHydrating = React.useSyncExternalStore(
    noopSubscribe,
    () => false,
    () => true,
  );
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
      {isHydrating && (
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: indicatorRetryScript }}
        />
      )}
    </BaseTabs.List>
  );
});

export interface TabProps extends BaseTabs.Tab.Props {
  /** Icon element, sized per MD3 spec (24dp). Stacks above the label in primary tabs. */
  icon?: React.ReactNode;
  /** A Badge, anchored to the icon's top-right corner (inline after the label if no icon). */
  badge?: React.ReactNode;
}

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(function Tab(props, ref) {
  const { className, icon, badge, children, onPointerDown, onClick, ...rest } = props;
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
      onClick={(event) => {
        ripple.onClick();
        onClick?.(event);
      }}
      {...rest}
    >
      <span className={styles.stateLayer} ref={ripple.containerRef} aria-hidden />
      <span className={styles.content}>
        {icon ? (
          <span className={styles.icon}>
            {icon}
            {badge ? <span className={styles.badge}>{badge}</span> : null}
          </span>
        ) : null}
        {children}
        {!icon && badge ? <span className={styles.inlineBadge}>{badge}</span> : null}
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
