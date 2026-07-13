"use client";
import "./media.css";

import { Button } from "@brijbyte/md3-react/button";
import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
} from "@brijbyte/md3-react/bottom-sheet";
import { Typography } from "@brijbyte/md3-react/typography";
import PlaylistAddIcon from "@brijbyte/md3-icons/outlined/PlaylistAdd";
import AlbumIcon from "@brijbyte/md3-icons/outlined/Album";
import PersonSearchIcon from "@brijbyte/md3-icons/outlined/PersonSearch";
import BedtimeIcon from "@brijbyte/md3-icons/outlined/Bedtime";
import QueuePlayNextIcon from "@brijbyte/md3-icons/outlined/QueuePlayNext";

const ITEMS = [
  { icon: <PlaylistAddIcon />, label: "Add to Playlist…" },
  { icon: <AlbumIcon />, label: "Go to Album" },
  { icon: <PersonSearchIcon />, label: "Go to Artist" },
  { icon: <BedtimeIcon />, label: "Sleep timer" },
  { icon: <QueuePlayNextIcon />, label: "Play next in queue" },
];

export default function MediaBottomSheetDemo() {
  return (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="filled" />}>Track options</BottomSheetTrigger>
      <BottomSheetContent className="demo-bottom-sheet-media">
        <div className="demo-bottom-sheet-media-header">
          <div className="demo-bottom-sheet-media-art" />
          <div className="demo-bottom-sheet-media-titles">
            <Typography variant="body-large">Oli's Picks</Typography>
            <Typography variant="body-medium" className="demo-bottom-sheet-media-subtitle">
              Various artists
            </Typography>
          </div>
        </div>
        <div className="demo-bottom-sheet-media-divider" />
        <ul className="demo-bottom-sheet-media-list">
          {ITEMS.map((item) => (
            <li key={item.label}>
              <button type="button" className="demo-bottom-sheet-media-item">
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
