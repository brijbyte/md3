"use client";
import * as React from "react";
import { Tab, TabList, TabPanel, Tabs } from "@/ui/tabs";
import { Button } from "@/ui/button";
import { IconButton } from "@/ui/icon-button";
import MoonIcon from "@brijbyte/md3-icons/outlined/DarkMode";
import SunIcon from "@brijbyte/md3-icons/outlined/LightMode";
import RtlIcon from "@brijbyte/md3-icons/outlined/FormatTextdirectionRToL";
import LtrIcon from "@brijbyte/md3-icons/outlined/FormatTextdirectionLToR";
import { CopyButton } from "./CopyButton";
import { LoadingIndicator } from "@/ui/loading-indicator";
import { useDemoControls } from "./DemoControls";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/ui/tooltip";
import "./shiki.css";

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
          <IconButton
            size="xsmall"
            aria-label={dir === "ltr" ? "Switch to RTL" : "Switch to LTR"}
            onClick={toggleDir}
          >
            {dir === "ltr" ? <RtlIcon /> : <LtrIcon />}
          </IconButton>
        }
      />
      <TooltipContent>{dir === "ltr" ? "Switch to RTL" : "Switch to LTR"}</TooltipContent>
    </Tooltip>
  );
}

function loadFiles(url: string): Promise<DemoFile[]> {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`GET ${url}: ${res.status}`);
    return res.json();
  });
}

// Collapsed by default: a toolbar with a centered "Show code" button and the
// theme/direction toggles at the end (min-h-12 matches the tab strip so the
// toggles don't move when the toolbar swaps into tabs). Showing code fetches
// the highlighted sources (once — the promise is kept in state across
// hide/show) and suspends into the source tabs behind a loading indicator.
export function DemoCodeTabs({ codeUrl }: { codeUrl: string }) {
  const [promise, setPromise] = React.useState<Promise<DemoFile[]> | null>(null);
  const [expanded, setExpanded] = React.useState(false);

  function showCode() {
    setPromise(
      (prev) =>
        prev ??
        loadFiles(codeUrl).catch((error): DemoFile[] => {
          console.error("Failed to load demo sources", error);
          setPromise(null);
          setExpanded(false);
          return [];
        }),
    );
    setExpanded(true);
  }

  if (!expanded || !promise) {
    return (
      <Toolbar>
        <Button variant="tonal" size="xsmall" onClick={showCode}>
          Show code
        </Button>
      </Toolbar>
    );
  }
  return (
    <React.Suspense
      fallback={
        <Toolbar>
          <LoadingIndicator aria-label="Loading demo sources" />
        </Toolbar>
      }
    >
      <SuspendingSourceTabs promise={promise} onHide={() => setExpanded(false)} />
    </React.Suspense>
  );
}

// Collapsed/loading strip: centered content with the theme/direction toggles
// pinned at the end, where the expanded tab bar also parks them.
function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-container rounded-b-large relative flex min-h-12 items-center justify-center">
      {children}
      <div className="absolute inset-e-2 flex items-center gap-1">
        <DemoThemeButton />
        <DemoDirButton />
      </div>
    </div>
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
      {/* Toggles sit beside the tab list (not inside), so the list scrolls
          under them while they stay pinned at the end. */}
      <div className="flex items-center">
        <TabList aria-label="Demo source files" className="min-w-0 grow">
          {files.map((f) => (
            <Tab key={f.name} value={f.name} className="font-mono">
              {f.name}
            </Tab>
          ))}
        </TabList>
        <div className="me-2 ms-2 flex shrink-0 items-center gap-1">
          <DemoThemeButton />
          <DemoDirButton />
        </div>
      </div>
      <div className="relative">
        <CopyButton text={active.code} size="xsmall" className="absolute inset-e-2 top-2 z-1" />
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
