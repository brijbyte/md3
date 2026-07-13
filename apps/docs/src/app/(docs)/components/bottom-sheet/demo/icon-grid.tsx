"use client";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/bottom-sheet.css";
import "@brijbyte/md3-react/typography.css";
import "./icon-grid.css";

import { Button } from "@brijbyte/md3-react/button";
import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
} from "@brijbyte/md3-react/bottom-sheet";
import { Typography } from "@brijbyte/md3-react/typography";
import ShareIcon from "@brijbyte/md3-icons/outlined/Share";
import AddIcon from "@brijbyte/md3-icons/outlined/Add";
import DeleteIcon from "@brijbyte/md3-icons/outlined/Delete";
import ShoppingBagIcon from "@brijbyte/md3-icons/outlined/ShoppingBag";
import ArchiveIcon from "@brijbyte/md3-icons/outlined/Archive";

const ACTIONS = [
  { icon: <ShareIcon />, label: "Share" },
  { icon: <AddIcon />, label: "Add to" },
  { icon: <DeleteIcon />, label: "Trash" },
  { icon: <ShoppingBagIcon />, label: "Order prints" },
  { icon: <ArchiveIcon />, label: "Move to archive" },
];

const CONTACTS = [
  "Alejandro Ortega",
  "Oli Ortega",
  "Carmen Villanueva",
  "Ana Russo",
  "Marty Reyes",
];

export default function IconGridBottomSheetDemo() {
  return (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="filled" />}>Photo options</BottomSheetTrigger>
      <BottomSheetContent className="demo-bottom-sheet-icon-grid">
        <ul className="demo-bottom-sheet-icon-grid-actions">
          {ACTIONS.map((action) => (
            <li key={action.label}>
              <button type="button" className="demo-bottom-sheet-icon-grid-action">
                <span className="demo-bottom-sheet-icon-grid-action-icon">{action.icon}</span>
                <Typography variant="label-medium">{action.label}</Typography>
              </button>
            </li>
          ))}
        </ul>
        <div className="demo-bottom-sheet-icon-grid-divider" />
        <Typography variant="title-medium" className="demo-bottom-sheet-icon-grid-heading">
          Send
        </Typography>
        <ul className="demo-bottom-sheet-icon-grid-contacts">
          {CONTACTS.map((name) => (
            <li key={name} className="demo-bottom-sheet-icon-grid-contact">
              <span className="demo-bottom-sheet-icon-grid-avatar" aria-hidden />
              <Typography variant="label-medium">{name}</Typography>
            </li>
          ))}
        </ul>
      </BottomSheetContent>
    </BottomSheet>
  );
}
