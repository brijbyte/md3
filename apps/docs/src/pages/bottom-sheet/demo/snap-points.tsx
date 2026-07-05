"use client";
import "./snap-points.css";

import { Button } from "@brijbyte/md3-react/button";
import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
} from "@brijbyte/md3-react/bottom-sheet";
import { Typography } from "@brijbyte/md3-react/typography";

const STOPS = Array.from({ length: 12 }, (_, i) => `Stop ${i + 1}`);

export default function SnapPointsBottomSheetDemo() {
  return (
    <BottomSheet snapPoints={[0.4, 1]} defaultSnapPoint={0.4}>
      <BottomSheetTrigger render={<Button variant="filled" />}>Show route</BottomSheetTrigger>
      <BottomSheetContent className="demo-bottom-sheet-snap-points">
        <Typography variant="title-large">Nearby stops</Typography>
        <Typography variant="body-medium">
          Drag past the halfway point to expand, or down past it to dismiss.
        </Typography>
        <ul className="demo-bottom-sheet-snap-points-list">
          {STOPS.map((stop) => (
            <li key={stop}>
              <Typography variant="body-large">{stop}</Typography>
            </li>
          ))}
        </ul>
      </BottomSheetContent>
    </BottomSheet>
  );
}
