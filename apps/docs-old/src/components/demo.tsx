// The code-showcase chrome (tabs, copy/collapse buttons) is client css that dev
// otherwise links only when the client chunks load (FOUC). Importing the source
// css modules here puts them in the server graph — linked in <head> at first
// paint, deduping with the components' own imports in build.
import "@brijbyte/md3-react/tabs/Tabs.module.css";
import "@brijbyte/md3-react/ripple/ripple.module.css";
import "@brijbyte/md3-react/button/Button.module.css";
import "@brijbyte/md3-react/icon-button/IconButton.module.css";

import * as React from "react";
import { DemoCodeTabs } from "./DemoCodeTabs";
import { DemoControlsProvider, DemoSurface } from "./DemoControls";
import { TooltipProvider } from "@brijbyte/md3-react/tooltip";

// Loader for a demo's Shiki-highlighted sources, passed in by the md3:demos
// facade (see vite.config.ts); memoized there for stable promise identity.
type DemoCode = () => Promise<{ FILES: { name: string; code: string; html: string }[] }>;

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

// Suspends on the code module inside DemoCodeTabs' own boundary, so the playground
// above never waits on it; `use` unwraps the promise kicked off in Demo's render.
function DemoCodeLoader({ code }: { code: ReturnType<DemoCode> }) {
  const { FILES } = React.use(code);
  return <DemoCodeTabs files={FILES} />;
}

// Server component rendering a standalone demo: the entry element as children,
// its code loader as a prop — both supplied by the md3:demos facade, which wraps
// every demo entry a page imports, so pages never render Demo themselves. The
// DemoSurface's .demo-surface div (app.css, unlayered) severs all style
// inheritance from the docs page while --md-sys-* tokens still flow through, so
// demos follow the theme toggle; DemoControlsProvider lets the code-tab buttons
// override the surface's theme and text direction per demo (surface only — the
// code tabs keep following the docs theme).
export function Demo({ code, children }: { code: DemoCode; children: React.ReactNode }) {
  return (
    <TooltipProvider delay={500}>
      <DemoControlsProvider>
        <section className="rounded-large bg-surface-container-low my-6">
          <DemoSurface>
            {/* Center the demo as one block (fit-content, auto margins) so multi-row
              demos keep their internal start alignment; gap spaces stacked rows. */}
            {/* px keeps full-width (wrapping) demos off the container's rounded edge. */}
            <div className="mx-auto flex w-fit max-w-full flex-col gap-4 px-4 py-2">{children}</div>
          </DemoSurface>
          <React.Suspense fallback={<DemoCodeSkeleton />}>
            <DemoCodeLoader code={code()} />
          </React.Suspense>
        </section>
      </DemoControlsProvider>
    </TooltipProvider>
  );
}
