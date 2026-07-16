"use client";

import "./shiki-theme.css";
import "./DemoCodeTabs.css";

import * as React from "react";
import { Tab, TabList, TabPanel, Tabs } from "@/ui/tabs";
import { Button } from "@/ui/button";
import { IconButton } from "@/ui/icon-button";
import { Toolbar, ToolbarButton } from "@/ui/toolbar";
import MoonIcon from "@brijbyte/md3-icons/outlined/DarkMode";
import SunIcon from "@brijbyte/md3-icons/outlined/LightMode";
import RtlIcon from "@brijbyte/md3-icons/outlined/FormatTextdirectionRToL";
import LtrIcon from "@brijbyte/md3-icons/outlined/FormatTextdirectionLToR";
import { CopyButton } from "./CopyButton";
import { Delayed } from "./Delayed";
import { LoadingIndicator } from "@/ui/loading-indicator";
import { useDemoControls } from "./DemoControls";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/ui/tooltip";

// A demo's showable sources, Shiki-highlighted at compile time by the demo
// loader (loaders/demo-loader.mjs) into a public/demo-code/*.json payload.
type DemoFile = { name: string; code: string; html: string };

// Flips the playground's color scheme. With no override yet the demo tracks the
// docs theme, so the icon pair is CSS-swapped (same trick as ThemeToggle) to
// stay hydration-safe; once overridden (client-only) state picks the icon.
function DemoThemeButton() {
  const { theme, toggleTheme } = useDemoControls();
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <ToolbarButton
            render={
              <IconButton size="xsmall" aria-label="Toggle demo theme" onClick={toggleTheme}>
                {theme === null ? (
                  <>
                    <MoonIcon className="dark:hidden" />
                    <SunIcon className="hidden dark:inline" />
                  </>
                ) : theme === "light" ? (
                  <MoonIcon />
                ) : (
                  <SunIcon />
                )}
              </IconButton>
            }
          />
        }
      />
      <TooltipContent>
        {theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      </TooltipContent>
    </Tooltip>
  );
}

function DemoDirButton() {
  const { dir, toggleDir } = useDemoControls();
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <ToolbarButton
            render={
              <IconButton
                size="xsmall"
                aria-label={dir === "ltr" ? "Switch to RTL" : "Switch to LTR"}
                onClick={toggleDir}
              >
                {dir === "ltr" ? <RtlIcon /> : <LtrIcon />}
              </IconButton>
            }
          />
        }
      />
      <TooltipContent>{dir === "ltr" ? "Switch to RTL" : "Switch to LTR"}</TooltipContent>
    </Tooltip>
  );
}

async function loadFiles(url: string): Promise<DemoFile[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url}: ${res.status}`);
  return res.json();
}

// Read synchronously: this reveal only ever mounts client-side after a click, so
// window exists and we get the real value on the first render — no effect delay
// that would let a frame of animation slip through before it resolves.
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Collapsed by default: a toolbar with a centered "Show code" button and the
// theme/direction toggles at the end (min-h-12 matches the tab strip so the
// toggles don't move when the toolbar swaps into tabs). Showing code fetches
// the highlighted sources (once — the promise is kept in state across
// hide/show) and suspends into the source tabs behind a loading indicator.
export function DemoCodeTabs({ codeUrl }: { codeUrl: string }) {
  const [promise, setPromise] = React.useState<Promise<DemoFile[]> | null>(null);
  const [expanded, setExpanded] = React.useState(false);
  // Fetch kicked off outside setState: updaters must stay pure (StrictMode
  // double-invokes them, which double-fetched); the ref dedupes across renders.
  const promiseRef = React.useRef<Promise<DemoFile[]> | null>(null);

  const showCode = React.useCallback(() => {
    if (!promiseRef.current) {
      promiseRef.current = loadFiles(codeUrl).catch((err) => {
        console.error(err);
        promiseRef.current = null;
        setPromise(null);
        setExpanded(false);
        return [];
      });
    }
    setPromise(promiseRef.current);
    setExpanded(true);
  }, [codeUrl]);

  if (!expanded || !promise) {
    return (
      <DemoToolbar>
        <ToolbarButton render={<Button variant="tonal" size="xsmall" onClick={showCode} />}>
          Show code
        </ToolbarButton>
      </DemoToolbar>
    );
  }
  return (
    <React.Suspense
      fallback={
        <DemoToolbar>
          <LoadingIndicator aria-label="Loading demo sources" />
        </DemoToolbar>
      }
    >
      <SuspendingSourceTabs promise={promise} onHide={() => setExpanded(false)} />
    </React.Suspense>
  );
}

// The section's persistent bottom strip: the library's docked Toolbar with
// centered content (the Show/Hide-code button). It stays put across the toggle
// so only the code region above it animates. The theme/direction toggles pin to
// the end while collapsed; expanded they move up into the tab bar, so the
// expanded toolbar drops them (toggles={false}).
function DemoToolbar({
  children,
  toggles = true,
}: {
  children: React.ReactNode;
  toggles?: boolean;
}) {
  return (
    <Toolbar
      aria-label="Demo controls"
      className="rounded-b-large relative h-auto min-h-12 justify-center px-2"
    >
      {children}
      {toggles && (
        <div className="absolute inset-e-2 flex items-center gap-1">
          <DemoThemeButton />
          <DemoDirButton />
        </div>
      )}
    </Toolbar>
  );
}

function SuspendingSourceTabs({
  promise,
  onHide,
}: {
  promise: Promise<DemoFile[]>;
  onHide: () => void;
}) {
  const files = React.use(promise);
  // Empty only on fetch failure, which already collapsed back to the toolbar.
  if (files.length === 0) return null;
  return <RevealingSourceTabs files={files} onHide={onHide} />;
}

// Expands the loaded source tabs into view on the emphasized curve (grid-rows
// 0fr→1fr + fade) above the persistent toolbar, collapsing the same way before
// it unmounts — the toolbar stays fixed, so nothing jumps. Overflow is clipped
// only while animating (data-clip) so the settled panel's tall code can still
// scroll the page normally.
function RevealingSourceTabs({ files, onHide }: { files: DemoFile[]; onHide: () => void }) {
  // Reduced motion: mount already-open (no 0fr→1fr flip, so no transition can
  // fire) and never clip. Otherwise mount collapsed and flip open next frame.
  const [reduced] = React.useState(prefersReducedMotion);
  const [open, setOpen] = React.useState(reduced);
  const [clipping, setClipping] = React.useState(!reduced);

  React.useEffect(() => {
    if (reduced) return;
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  const hide = () => {
    if (reduced) {
      onHide();
      return;
    }
    setClipping(true);
    setOpen(false);
  };

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget || e.propertyName !== "grid-template-rows") return;
    if (open) setClipping(false);
    else onHide();
  };

  return (
    <>
      <div
        className="demo-code-reveal"
        data-open={open}
        data-clip={clipping}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="demo-code-reveal-inner">
          <DemoSourceTabs files={files} />
        </div>
      </div>
      <DemoToolbar toggles={false}>
        <ToolbarButton render={<Button variant="tonal" size="xsmall" onClick={hide} />}>
          Hide code
        </ToolbarButton>
      </DemoToolbar>
    </>
  );
}

// Demo source tabs: one tab per file, panels hold the compile-time Shiki html.
// Controlled selection so the copy button — floating over the code area —
// always copies whichever file is active. Collapsing is driven by the toolbar's
// "Hide code" button below the code.
function DemoSourceTabs({ files }: { files: DemoFile[] }) {
  const [value, setValue] = React.useState(files[0].name);
  const active = files.find((f) => f.name === value) ?? files[0];
  return (
    <Tabs value={value} onValueChange={(v) => setValue(v as string)}>
      <div className="bg-surface flex items-center shadow-[inset_0_-1px_var(--color-outline-variant)]">
        <TabList aria-label="Demo source files" className="demo-source-tablist min-w-0 grow">
          {files.map((f) => (
            <Tab key={f.name} value={f.name} className="font-mono">
              {f.name}
            </Tab>
          ))}
        </TabList>
        <Toolbar
          aria-label="Demo controls"
          className="me-2 ms-2 h-auto shrink-0 bg-transparent p-0"
        >
          <DemoThemeButton />
          <DemoDirButton />
        </Toolbar>
      </div>
      <div className="relative">
        <CopyButton
          text={active.code}
          fileName={active.name}
          size="xsmall"
          className="absolute inset-e-2 top-2 z-1"
        />
        {files.map((f) => (
          <TabPanel key={f.name} value={f.name} className="relative" tabIndex={-1}>
            <div
              className="text-body-medium [&>pre]:overflow-x-auto [&>pre]:bg-surface-container [&>pre]:p-4"
              dangerouslySetInnerHTML={{ __html: f.html }}
            />
          </TabPanel>
        ))}
      </div>
    </Tabs>
  );
}
