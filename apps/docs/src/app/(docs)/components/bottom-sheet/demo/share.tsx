"use client";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/chip.css";
import "@brijbyte/md3-react/bottom-sheet.css";
import "@brijbyte/md3-react/typography.css";
import "./share.css";

import { Button } from "@brijbyte/md3-react/button";
import { AssistChip } from "@brijbyte/md3-react/chip";
import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
} from "@brijbyte/md3-react/bottom-sheet";
import { Typography } from "@brijbyte/md3-react/typography";
import ContentCopyIcon from "@brijbyte/md3-icons/outlined/ContentCopy";
import NearbyIcon from "@brijbyte/md3-icons/outlined/Nearby";

const CONTACTS = ["Alejandro", "Ines", "Oli", "Carmen"];
const APPS = ["Files", "Gmail", "Meet", "Drive"];

export default function ShareBottomSheetDemo() {
  return (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="filled" />}>Share photo</BottomSheetTrigger>
      <BottomSheetContent className="demo-bottom-sheet-share">
        <div className="demo-bottom-sheet-share-chips">
          <AssistChip icon={<ContentCopyIcon />}>Copy</AssistChip>
          <AssistChip icon={<NearbyIcon />}>Nearby</AssistChip>
        </div>
        <ul className="demo-bottom-sheet-share-grid">
          {CONTACTS.map((name) => (
            <li key={name} className="demo-bottom-sheet-share-cell">
              <span className="demo-bottom-sheet-share-avatar" aria-hidden />
              <Typography variant="label-medium">{name}</Typography>
            </li>
          ))}
        </ul>
        <ul className="demo-bottom-sheet-share-grid">
          {APPS.map((name) => (
            <li key={name} className="demo-bottom-sheet-share-cell">
              <span className="demo-bottom-sheet-share-app-icon" aria-hidden />
              <Typography variant="label-medium">{name}</Typography>
            </li>
          ))}
        </ul>
      </BottomSheetContent>
    </BottomSheet>
  );
}
