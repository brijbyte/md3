"use client";
import "@brijbyte/md3-react/list.css";
import "./interactive.css";

import * as React from "react";
import { List, ListItem } from "@brijbyte/md3-react/list";
import WifiIcon from "@brijbyte/md3-icons/outlined/Wifi";
import BluetoothIcon from "@brijbyte/md3-icons/outlined/Bluetooth";
import NotificationsIcon from "@brijbyte/md3-icons/outlined/Notifications";
import LockIcon from "@brijbyte/md3-icons/outlined/Lock";
import ChevronRightIcon from "@brijbyte/md3-icons/outlined/ChevronRight";

const PAGES = [
  { id: "wifi", Icon: WifiIcon, label: "Wi-Fi", supporting: "TeamNet — connected" },
  { id: "bluetooth", Icon: BluetoothIcon, label: "Bluetooth", supporting: "2 devices" },
  {
    id: "notifications",
    Icon: NotificationsIcon,
    label: "Notifications",
    supporting: "Sound, vibration",
  },
];

export default function ListInteractiveDemo() {
  const [selected, setSelected] = React.useState("wifi");
  return (
    <List className="demo-list">
      {PAGES.map(({ id, Icon, label, supporting }) => (
        <ListItem
          key={id}
          leading={<Icon />}
          supportingText={supporting}
          trailing={<ChevronRightIcon />}
          selected={selected === id}
          onClick={() => setSelected(id)}
        >
          {label}
        </ListItem>
      ))}
      <ListItem
        leading={<LockIcon />}
        supportingText="Managed by your organization"
        trailing={<ChevronRightIcon />}
        interactive
        disabled
      >
        Security
      </ListItem>
    </List>
  );
}
