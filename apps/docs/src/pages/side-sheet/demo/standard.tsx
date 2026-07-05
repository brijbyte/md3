"use client";
import "./standard.css";

import * as React from "react";
import { SideSheet, SideSheetContent } from "@brijbyte/md3-react/side-sheet";
import { Typography } from "@brijbyte/md3-react/typography";

const FILES = ["Q1 report.pdf", "Budget draft.xlsx", "Roadmap.fig", "Notes.md", "Assets.zip"];

export default function StandardSideSheetDemo() {
  // `position: fixed` normally escapes to the real browser viewport — this repo's
  // `transform` on the frame below re-establishes it as the containing block, so the
  // portaled sheet (rendered into `frameRef`, not document.body) stays confined to this
  // demo's frame instead of covering the rest of the docs page.
  const frameRef = React.useRef<HTMLDivElement>(null);
  return (
    <div className="demo-side-sheet-standard" ref={frameRef}>
      <div className="demo-side-sheet-standard-scroller">
        <Typography variant="title-medium">Files</Typography>
        <ul className="demo-side-sheet-standard-files">
          {FILES.map((file) => (
            <li key={file} className="demo-side-sheet-standard-file">
              <Typography variant="body-large">{file}</Typography>
            </li>
          ))}
        </ul>
      </div>
      {/* Standard sheets have no trigger — they're persistently open, so `open` is
          hardcoded true here purely for the demo. */}
      <SideSheet variant="standard" open>
        <SideSheetContent className="demo-side-sheet-standard-content" container={frameRef}>
          <div className="demo-side-sheet-standard-panel">
            <Typography variant="title-medium">Q1 report.pdf</Typography>
            <Typography variant="body-medium" className="demo-side-sheet-standard-meta">
              2.4 MB · Modified 2 days ago
            </Typography>
            <div className="demo-side-sheet-standard-preview" aria-hidden />
          </div>
        </SideSheetContent>
      </SideSheet>
    </div>
  );
}
