"use client";
import "@brijbyte/md3-react/tokens.css";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/ripple.css";
import "@brijbyte/md3-react/icon-button.css";
import "@brijbyte/md3-react/side-sheet.css";
import "@brijbyte/md3-react/switch.css";
import "@brijbyte/md3-react/typography.css";
import "./actions.css";

import { Button } from "@brijbyte/md3-react/button";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import {
  SideSheet,
  SideSheetTrigger,
  SideSheetContent,
  SideSheetTitle,
  SideSheetClose,
} from "@brijbyte/md3-react/side-sheet";
import { Switch } from "@brijbyte/md3-react/switch";
import { Typography } from "@brijbyte/md3-react/typography";
import CloseIcon from "@brijbyte/md3-icons/outlined/Close";

const SETTINGS = [
  { label: "Auto-save drafts", defaultChecked: true },
  { label: "Show line numbers", defaultChecked: true },
  { label: "Word wrap", defaultChecked: false },
  { label: "Minimap", defaultChecked: false },
];

export default function ActionsSideSheetDemo() {
  return (
    <SideSheet>
      <SideSheetTrigger render={<Button variant="filled" />}>Editor settings</SideSheetTrigger>
      <SideSheetContent className="demo-side-sheet-actions">
        <div className="demo-side-sheet-actions-header">
          <SideSheetTitle render={<Typography variant="title-large" />}>Settings</SideSheetTitle>
          <SideSheetClose render={<IconButton aria-label="Close" variant="standard" />}>
            <CloseIcon />
          </SideSheetClose>
        </div>
        <ul className="demo-side-sheet-actions-list">
          {SETTINGS.map((setting) => (
            <li key={setting.label}>
              <label className="demo-side-sheet-actions-item">
                <Typography variant="body-large">{setting.label}</Typography>
                <Switch defaultChecked={setting.defaultChecked} />
              </label>
            </li>
          ))}
        </ul>
      </SideSheetContent>
    </SideSheet>
  );
}
