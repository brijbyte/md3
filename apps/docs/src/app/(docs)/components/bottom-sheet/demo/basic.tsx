"use client";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/bottom-sheet.css";
import "@brijbyte/md3-react/typography.css";
import "./basic.css";

import { Button } from "@brijbyte/md3-react/button";
import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
} from "@brijbyte/md3-react/bottom-sheet";
import { Typography } from "@brijbyte/md3-react/typography";

export default function BasicBottomSheetDemo() {
  return (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="filled" />}>Open sheet</BottomSheetTrigger>
      <BottomSheetContent className="demo-bottom-sheet-basic">
        <Typography variant="title-large">Add to playlist</Typography>
        <Typography variant="body-medium">
          Drag the handle down, tap outside, or press Escape to dismiss.
        </Typography>
      </BottomSheetContent>
    </BottomSheet>
  );
}
