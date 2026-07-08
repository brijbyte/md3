"use client";
import * as React from "react";
import { Tab, TabList, TabPanel, Tabs } from "@brijbyte/md3-react/tabs";
import { CodeCollapse } from "./CodeCollapse";
import { CopyButton } from "./CopyButton";

type DemoFile = { name: string; code: string; html: string };

// Demo source tabs: one tab per file, panels hold the compile-time Shiki html.
// Controlled selection so the copy button — parked at the end of the tab row —
// always copies whichever file is active.
export function DemoCodeTabs({ files }: { files: DemoFile[] }) {
  const [value, setValue] = React.useState(files[0].name);
  const active = files.find((f) => f.name === value) ?? files[0];
  return (
    <Tabs value={value} onValueChange={(v) => setValue(v as string)} className="mt-5">
      <TabList variant="secondary" aria-label="Demo source files">
        {files.map((f) => (
          <Tab key={f.name} value={f.name} className="font-mono">
            {f.name}
          </Tab>
        ))}
        <CopyButton text={active.code} size="xsmall" className="ml-auto self-center me-2" />
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
