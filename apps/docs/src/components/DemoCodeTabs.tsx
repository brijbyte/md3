"use client";
import * as React from "react";
import { Tab, TabList, TabPanel, Tabs } from "@brijbyte/md3-react/tabs";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import MoonIcon from "@brijbyte/md3-icons/outlined/DarkMode";
import SunIcon from "@brijbyte/md3-icons/outlined/LightMode";
import RtlIcon from "@brijbyte/md3-icons/outlined/FormatTextdirectionRToL";
import LtrIcon from "@brijbyte/md3-icons/outlined/FormatTextdirectionLToR";
import { CodeCollapse } from "./CodeCollapse";
import { CopyButton } from "./CopyButton";
import { useDemoControls } from "./DemoControls";
import { Tooltip, TooltipTrigger, TooltipContent } from "@brijbyte/md3-react/tooltip";

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

// Demo source tabs: one tab per file, panels hold the compile-time Shiki html.
// Controlled selection so the copy button — parked at the end of the tab row —
// always copies whichever file is active.
export function DemoCodeTabs({ files }: { files: DemoFile[] }) {
  const [value, setValue] = React.useState(files[0].name);
  const active = files.find((f) => f.name === value) ?? files[0];
  return (
    <Tabs value={value} onValueChange={(v) => setValue(v as string)}>
      <TabList variant="secondary" aria-label="Demo source files">
        {files.map((f) => (
          <Tab key={f.name} value={f.name} className="font-mono">
            {f.name}
          </Tab>
        ))}
        <div className="ms-auto me-2 flex items-center gap-1 self-center">
          <DemoThemeButton />
          <DemoDirButton />
          <CopyButton text={active.code} size="xsmall" />
        </div>
      </TabList>
      <CodeCollapse>
        {files.map((f) => (
          <TabPanel key={f.name} value={f.name} className="relative" tabIndex={-1}>
            <div
              className="text-body-medium [&>pre]:overflow-x-auto [&>pre]:bg-surface-container [&>pre]:p-4"
              dangerouslySetInnerHTML={{ __html: f.html }}
            />
          </TabPanel>
        ))}
      </CodeCollapse>
    </Tabs>
  );
}
