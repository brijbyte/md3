"use client";
import "./anchor-left.css";

import { Button } from "@brijbyte/md3-react/button";
import { SideSheet, SideSheetTrigger, SideSheetContent } from "@brijbyte/md3-react/side-sheet";
import { Typography } from "@brijbyte/md3-react/typography";

export default function AnchorLeftSideSheetDemo() {
  return (
    <SideSheet anchor="left">
      <SideSheetTrigger render={<Button variant="outlined" />}>Open from the left</SideSheetTrigger>
      <SideSheetContent className="demo-side-sheet-anchor-left">
        <Typography variant="title-large">Navigation</Typography>
        <Typography variant="body-medium">
          Pass <code>anchor=&quot;left&quot;</code> to flip which edge the sheet slides in from —
          the rounded corner and swipe-to-dismiss direction flip with it.
        </Typography>
      </SideSheetContent>
    </SideSheet>
  );
}
