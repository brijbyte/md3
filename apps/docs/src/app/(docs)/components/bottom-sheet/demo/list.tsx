"use client";
import "./list.css";

import { Button } from "@brijbyte/md3-react/button";
import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
} from "@brijbyte/md3-react/bottom-sheet";
import { Typography } from "@brijbyte/md3-react/typography";
import ShareIcon from "@brijbyte/md3-icons/outlined/Share";
import LinkIcon from "@brijbyte/md3-icons/outlined/Link";
import EditIcon from "@brijbyte/md3-icons/outlined/Edit";

const ITEMS = [
  { icon: <ShareIcon />, label: "Share" },
  { icon: <LinkIcon />, label: "Get link" },
  { icon: <EditIcon />, label: "Edit name" },
];

export default function ListBottomSheetDemo() {
  return (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="filled" />}>Open menu</BottomSheetTrigger>
      <BottomSheetContent>
        <ul className="demo-bottom-sheet-list">
          {ITEMS.map((item) => (
            <li key={item.label}>
              <button type="button" className="demo-bottom-sheet-list-item">
                {item.icon}
                <Typography variant="body-large">{item.label}</Typography>
              </button>
            </li>
          ))}
        </ul>
      </BottomSheetContent>
    </BottomSheet>
  );
}
