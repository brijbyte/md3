"use client";

import "./shiki.css";
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

// Collapsed/loading strip: the library's docked Toolbar, squeezed to the code
// area's 48dp strip with centered content and the theme/direction toggles
// pinned at the end, where the expanded tab bar also parks them.
function DemoToolbar({ children }: { children: React.ReactNode }) {
  return (
    <Toolbar
      aria-label="Demo controls"
      className="rounded-b-large relative h-auto min-h-12 justify-center px-2"
    >
      {children}
      <div className="absolute inset-e-2 flex items-center gap-1">
        <DemoThemeButton />
        <DemoDirButton />
      </div>
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
  return <DemoSourceTabs files={files} onHide={onHide} />;
}

// Demo source tabs: one tab per file, panels hold the compile-time Shiki html.
// Controlled selection so the copy button — floating over the code area —
// always copies whichever file is active. The sticky "Hide code" button below
// the code collapses back to the toolbar.
function DemoSourceTabs({ files, onHide }: { files: DemoFile[]; onHide: () => void }) {
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
        <div className="sticky bottom-1 my-1 flex justify-center">
          <Button variant="tonal" size="xsmall" onClick={onHide}>
            Hide code
          </Button>
        </div>
      </div>
    </Tabs>
  );
}
