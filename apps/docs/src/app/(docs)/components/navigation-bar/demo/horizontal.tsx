"use client";
import "@brijbyte/md3-react/navigation-bar.css";
import "./horizontal.css";

import { useState } from "react";
import MusicNoteIcon from "@brijbyte/md3-icons/outlined/MusicNote";
import NewsIcon from "@brijbyte/md3-icons/outlined/News";
import VideoLibraryIcon from "@brijbyte/md3-icons/outlined/VideoLibrary";
import { NavigationBar, NavigationBarItem } from "@brijbyte/md3-react/navigation-bar";

const destinations = [
  { key: "news", label: "News", icon: <NewsIcon /> },
  { key: "music", label: "Music", icon: <MusicNoteIcon /> },
  { key: "video", label: "Video", icon: <VideoLibraryIcon /> },
];

export default function NavigationBarHorizontal() {
  const [active, setActive] = useState("news");
  return (
    <NavigationBar aria-label="Main" arrangement="centered" className="demo-navigation-bar-wide">
      {destinations.map((d) => (
        <NavigationBarItem
          key={d.key}
          icon={d.icon}
          label={d.label}
          iconPosition="start"
          active={active === d.key}
          onClick={() => setActive(d.key)}
        />
      ))}
    </NavigationBar>
  );
}
