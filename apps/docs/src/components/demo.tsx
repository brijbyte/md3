import * as React from "react";
import { DemoCodeTabs } from "./DemoCodeTabs";
import { DemoControlsProvider, DemoSurface } from "./DemoControls";
import { TooltipProvider } from "@/ui/tooltip";

// A demo's showable sources, Shiki-highlighted at compile time by the demo
// loader (loaders/demo-loader.mjs) and inlined into the demo module itself.
export type DemoFile = { name: string; code: string; html: string };

// Renders a standalone demo: the entry element as children, its highlighted
// sources as a prop — both supplied by the demo loader, which wraps every
// default-exporting demo module, so pages never render Demo themselves.
// The DemoSurface's .demo-surface div (DemoControls.css, unlayered)
// severs all style inheritance from the docs page while --md-sys-* tokens
// still flow through, so demos follow the theme toggle; DemoControlsProvider
// lets the code-tab buttons override the surface's theme and text direction
// per demo (surface only — the code tabs keep following the docs theme).
export function Demo({ files, children }: { files: DemoFile[]; children: React.ReactNode }) {
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
          <DemoCodeTabs files={files} />
        </section>
      </DemoControlsProvider>
    </TooltipProvider>
  );
}
