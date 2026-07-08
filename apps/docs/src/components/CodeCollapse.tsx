"use client";
import * as React from "react";
import { Button } from "@brijbyte/md3-react/button";

// Collapsed-by-default wrapper for demo source panels: a short clipped preview
// with a fade into the code background and a centered "Show code" button;
// expanding removes the clamp entirely (full height, no inner vertical scroll),
// with a "Hide code" button below to collapse back.
export function CodeCollapse({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = React.useState(false);

  const button = (
    <Button
      variant="tonal"
      size="xsmall"
      className={expanded ? undefined : "pointer-events-auto"}
      onClick={() => {
        if (expanded) {
          setExpanded(false);
        } else {
          setExpanded(true);
        }
      }}
    >
      {expanded ? "Hide code" : "Show code"}
    </Button>
  );

  return (
    // pointer-events-none lets the fade sit over the code without eating selection
    <div className={expanded ? "relative" : "relative max-h-40 overflow-hidden rounded-b-large"}>
      {children}
      <div
        className={`flex justify-center ${expanded ? "my-1 sticky bottom-1" : "pointer-events-none mb-2 absolute inset-0 items-end bg-linear-to-b from-transparent to-surface-container"}`}
      >
        {button}
      </div>
    </div>
  );
}
