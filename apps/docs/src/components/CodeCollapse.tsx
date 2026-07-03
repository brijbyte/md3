"use client";
import * as React from "react";
import { Button } from "@brijbyte/md3-react/button";

// Collapsed-by-default wrapper for demo source panels: a short clipped preview
// with a fade into the code background and a centered "Show code" button;
// expanding removes the clamp entirely (full height, no inner vertical scroll),
// with a "Hide code" button below to collapse back.
export function CodeCollapse({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = React.useState(false);
  const collapsedRef = React.useRef<HTMLDivElement>(null);
  if (expanded) {
    return (
      <>
        {children}
        <div className="mt-2 flex justify-center">
          <Button
            variant="text"
            onClick={() => {
              setExpanded(false);
              // Long code puts the viewport far below the demo — bring it back.
              requestAnimationFrame(() =>
                collapsedRef.current?.scrollIntoView({ block: "nearest" }),
              );
            }}
          >
            Hide code
          </Button>
        </div>
      </>
    );
  }
  return (
    <div ref={collapsedRef} className="relative max-h-40 overflow-hidden rounded-b-large">
      {children}
      {/* pointer-events-none keeps the copy button clickable under the fade */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-linear-to-b from-transparent to-surface-container">
        <Button
          variant="elevated"
          className="pointer-events-auto"
          onClick={() => setExpanded(true)}
        >
          Show code
        </Button>
      </div>
    </div>
  );
}
