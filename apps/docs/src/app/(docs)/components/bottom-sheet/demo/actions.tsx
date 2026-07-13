"use client";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/icon-button.css";
import "@brijbyte/md3-react/bottom-sheet.css";
import "@brijbyte/md3-react/typography.css";
import "./actions.css";

import { Button } from "@brijbyte/md3-react/button";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
  BottomSheetTitle,
  BottomSheetClose,
} from "@brijbyte/md3-react/bottom-sheet";
import { Typography } from "@brijbyte/md3-react/typography";
import ShareIcon from "@brijbyte/md3-icons/outlined/Share";
import LinkIcon from "@brijbyte/md3-icons/outlined/Link";
import DownloadIcon from "@brijbyte/md3-icons/outlined/Download";
import CloseIcon from "@brijbyte/md3-icons/outlined/Close";

const ACTIONS = [
  { icon: <ShareIcon />, label: "Share" },
  { icon: <LinkIcon />, label: "Copy link" },
  { icon: <DownloadIcon />, label: "Download" },
];

export default function ActionsBottomSheetDemo() {
  return (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="filled" />}>Share document</BottomSheetTrigger>
      <BottomSheetContent className="demo-bottom-sheet-actions">
        <div className="demo-bottom-sheet-actions-header">
          <BottomSheetTitle render={<Typography variant="title-large" />}>Share</BottomSheetTitle>
          <BottomSheetClose render={<IconButton aria-label="Close" variant="standard" />}>
            <CloseIcon />
          </BottomSheetClose>
        </div>
        <ul className="demo-bottom-sheet-actions-list">
          {ACTIONS.map((action) => (
            <li key={action.label}>
              <button type="button" className="demo-bottom-sheet-actions-item">
                {action.icon}
                <Typography variant="label-large">{action.label}</Typography>
              </button>
            </li>
          ))}
        </ul>
      </BottomSheetContent>
    </BottomSheet>
  );
}
