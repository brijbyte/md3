// The code-showcase chrome (tabs, copy/collapse buttons) is client css that dev
// otherwise links only when the client chunks load (FOUC). Importing the source
// css modules here puts them in the server graph — linked in <head> at first
// paint, deduping with the components' own imports in build.
import "@brijbyte/md3-react/tabs/Tabs.module.css";
import "@brijbyte/md3-react/ripple/ripple.module.css";
import "@brijbyte/md3-react/button/Button.module.css";
import "@brijbyte/md3-react/icon-button/IconButton.module.css";

import * as React from "react";
import { Tab, TabList, TabPanel, Tabs } from "@brijbyte/md3-react/tabs";
import { CodeCollapse } from "./CodeCollapse";
import { CopyButton } from "./CopyButton";
import { Typography } from "@brijbyte/md3-react/typography";

// Loader for a demo's Shiki-highlighted sources, passed in by the md3:demos
// facade (see vite.config.ts); memoized there for stable promise identity.
type DemoCode = () => Promise<{ FILES: { name: string; code: string; html: string }[] }>;

// Demo source tabs: one tab per file of the standalone demo package, panels hold
// the compile-time Shiki html (see the md3:demo-code virtual module) + a copy button.
function DemoCode({ files }: { files: { name: string; code: string; html: string }[] }) {
  return (
    <Tabs defaultValue={files[0].name} className="mt-5">
      <TabList variant="primary" aria-label="Demo source files">
        {files.map((f) => (
          <Tab key={f.name} value={f.name} className="h-9.5">
            {/* File names read as code — mono beats the label-large face. */}
            <Typography as="span" variant="label-large" className="font-mono">
              {f.name}
            </Typography>
          </Tab>
        ))}
      </TabList>
      <CodeCollapse>
        {files.map((f) => (
          <TabPanel key={f.name} value={f.name} className="relative" tabIndex={-1}>
            <CopyButton text={f.code} className="absolute top-2 right-2" />
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

// Placeholder mirroring the collapsed code showcase: a tab bar with two file-name
// stubs over a preview-height code block with a few uneven "lines" of code.
function DemoCodeSkeleton() {
  return (
    <div role="progressbar" aria-label="Loading demo source" className="mt-5 animate-pulse">
      <div className="flex h-9.5 items-center gap-8 border-b border-outline-variant px-4">
        <div className="h-3.5 w-24 rounded-full bg-surface-container-high" />
        <div className="h-3.5 w-24 rounded-full bg-surface-container-high" />
      </div>
      <div className="flex h-40 flex-col gap-3 rounded-b-large bg-surface-container p-4">
        <div className="h-3 w-2/5 rounded-full bg-surface-container-high" />
        <div className="h-3 w-3/5 rounded-full bg-surface-container-high" />
        <div className="h-3 w-1/2 rounded-full bg-surface-container-high" />
        <div className="h-3 w-1/4 rounded-full bg-surface-container-high" />
        <div className="h-3 w-2/5 rounded-full bg-surface-container-high" />
      </div>
    </div>
  );
}

// Suspends on the code module inside DemoCode's own boundary, so the playground
// above never waits on it; `use` unwraps the promise kicked off in Demo's render.
function DemoCodeLoader({ code }: { code: ReturnType<DemoCode> }) {
  const { FILES } = React.use(code);
  return <DemoCode files={FILES} />;
}

// Server component rendering a standalone demo: the entry element as children,
// its code loader as a prop — both supplied by the md3:demos facade, which wraps
// every demo entry a page imports, so pages never render Demo themselves. The
// inner .demo-surface div (app.css, unlayered) severs all style inheritance from
// the docs page while --md-sys-* tokens still flow through, so demos follow the
// theme toggle.
export function Demo({ code, children }: { code: DemoCode; children: React.ReactNode }) {
  return (
    <section className="rounded-large bg-surface-container-low pt-4 my-6">
      <div className="demo-surface">
        {/* Center the demo as one block (fit-content, auto margins) so multi-row
            demos keep their internal left alignment; gap spaces stacked rows. */}
        {/* px keeps full-width (wrapping) demos off the container's rounded edge. */}
        <div className="mx-auto flex w-fit max-w-full flex-col gap-4 px-4 py-2">{children}</div>
      </div>
      <React.Suspense fallback={<DemoCodeSkeleton />}>
        <DemoCodeLoader code={code()} />
      </React.Suspense>
    </section>
  );
}
