import * as React from "react";
import { DEMOS } from "virtual:md3-demos";

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
        <React.Suspense fallback={<DemoSkeleton />}>
          <Content />
        </React.Suspense>
      </div>
      {children != null && (
        <div className="mt-4 text-body-medium text-on-surface-variant">{children}</div>
      )}
    </section>
  );
}
