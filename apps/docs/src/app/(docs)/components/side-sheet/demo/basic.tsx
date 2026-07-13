"use client";
import "@brijbyte/md3-react/tokens.css";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/ripple.css";
import "@brijbyte/md3-react/side-sheet.css";
import "@brijbyte/md3-react/typography.css";
import "./basic.css";

import { Button } from "@brijbyte/md3-react/button";
import { SideSheet, SideSheetTrigger, SideSheetContent } from "@brijbyte/md3-react/side-sheet";
import { Typography } from "@brijbyte/md3-react/typography";

export default function BasicSideSheetDemo() {
  return (
    <SideSheet>
      <SideSheetTrigger render={<Button variant="filled" />}>Open sheet</SideSheetTrigger>
      <SideSheetContent className="demo-side-sheet-basic">
        <Typography variant="title-large">Comments</Typography>
        <Typography variant="body-medium">
          Tap outside, press Escape, or swipe the sheet toward the edge to dismiss.
        </Typography>
      </SideSheetContent>
    </SideSheet>
  );
}
