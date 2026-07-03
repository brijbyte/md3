import * as React from "react";
import { Tab, TabList, TabPanel, Tabs } from "@brijbyte/md3-react/tabs";
import { DEMOS } from "virtual:md3-demos";
import { CodeCollapse } from "./CodeCollapse";
import { CopyButton } from "./CopyButton";

// The code-showcase chrome (tabs, copy/collapse buttons) is client css that dev
// otherwise links only when the client chunks load (FOUC). Importing the source
// css modules here puts them in the server graph — linked in <head> at first
// paint, deduping with the components' own imports in build.
import "@brijbyte/md3-react/tabs/Tabs.module.css";
import "@brijbyte/md3-react/ripple/ripple.module.css";
import "@brijbyte/md3-react/button/Button.module.css";
import "@brijbyte/md3-react/icon-button/IconButton.module.css";

// Server component rendering a standalone demo from the registry (see the
// md3:demos plugin). `of` is "<page>/<export>"; a heading renders only when
// `title` is passed (the demo package's description stays available in the
// registry as metadata). Children render as a caption below the playground.
// The inner .demo-surface div (app.css, unlayered) severs all style
// inheritance from the docs page while --md-sys-* tokens still flow through,
// so demos follow the theme toggle.
// Placeholder row while a demo's chunk loads. Rendered inside .demo-surface:
// `all: initial` only severs inheritance at the boundary, so utility classes on
// descendants still apply. Sized to a typical single-row demo to minimize shift.
function DemoSkeleton() {
  return (
    <div
      role="progressbar"
      aria-label="Loading demo"
      className="flex min-h-10 animate-pulse flex-wrap items-center gap-4"
    >
      <div className="h-10 w-28 rounded-full bg-surface-container-high" />
      <div className="h-10 w-28 rounded-full bg-surface-container-high" />
      <div className="size-10 rounded-full bg-surface-container-high" />
    </div>
  );
}

// Demo source tabs: one tab per file of the standalone demo package, panels hold
// the compile-time Shiki html (see the md3:demo-code virtual module) + a copy button.
// Token colors are classes (not inline vars); `css` carries the demo's class rules
// as a hoistable style, deduped by content-hashed href.
function DemoCode({
  files,
  css,
  cssHref,
}: {
  files: { name: string; code: string; html: string }[];
  css: string;
  cssHref: string;
}) {
  return (
    <Tabs defaultValue={files[0].name} className="mt-5">
      {css && (
        <style href={cssHref} precedence="md3-shiki">
          {css}
        </style>
      )}
      <TabList variant="primary" aria-label="Demo source files" className="rounded-t-md">
        {files.map((f) => (
          <Tab key={f.name} value={f.name}>
            {f.name}
          </Tab>
        ))}
      </TabList>
      <CodeCollapse>
        {files.map((f) => (
          <TabPanel key={f.name} value={f.name} className="relative">
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
      <div className="flex h-12 items-center gap-8 border-b border-outline-variant px-4">
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
function DemoCodeLoader({ code }: { code: ReturnType<(typeof DEMOS)[string]["code"]> }) {
  const { FILES, CSS, CSS_HREF } = React.use(code);
  return <DemoCode files={FILES} css={CSS} cssHref={CSS_HREF} />;
}

export function Demo({
  of,
  title,
  children,
}: {
  of: string;
  title?: string;
  children?: React.ReactNode;
}) {
  const entry = DEMOS[of];
  if (!entry) throw new Error(`Unknown demo "${of}" — is it in its package.json exports?`);
  const Content = React.lazy(entry.load);
  return (
    <section className="my-6 rounded-extra-large bg-surface-container-low px-7 pt-6 pb-7">
      {title && <h2 className="mb-4 font-brand text-title-large">{title}</h2>}
      <div className="demo-surface">
        {/* Center the demo as one block (fit-content, auto margins) so multi-row
            demos keep their internal left alignment; gap spaces stacked rows. */}
        <div className="mx-auto flex w-fit max-w-full flex-col gap-4 py-2">
          <React.Suspense fallback={<DemoSkeleton />}>
            <Content />
          </React.Suspense>
        </div>
      </div>
      {children != null && (
        <div className="mt-4 text-body-medium text-on-surface-variant">{children}</div>
      )}
      <React.Suspense fallback={<DemoCodeSkeleton />}>
        <DemoCodeLoader code={entry.code()} />
      </React.Suspense>
    </section>
  );
}
