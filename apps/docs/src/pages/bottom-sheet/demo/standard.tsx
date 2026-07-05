"use client";
import "./standard.css";

import * as React from "react";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import { BottomSheet, BottomSheetContent } from "@brijbyte/md3-react/bottom-sheet";
import { Typography } from "@brijbyte/md3-react/typography";
import PlayArrowIcon from "@brijbyte/md3-icons/outlined/PlayArrow";
import PauseIcon from "@brijbyte/md3-icons/outlined/Pause";
import SkipNextIcon from "@brijbyte/md3-icons/outlined/SkipNext";

const ALBUMS = ["Cassette Futurism", "Various Artists", "Late Bloom", "Night Drive", "Analog Dust"];

export default function StandardBottomSheetDemo() {
  // `position: fixed` normally escapes to the real browser viewport — this repo's
  // `transform` on the frame below re-establishes it as the containing block, so the
  // portaled sheet (rendered into `frameRef`, not document.body) stays confined to this
  // demo's frame instead of covering the rest of the docs page.
  const frameRef = React.useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = React.useState(true);
  return (
    <div className="demo-bottom-sheet-standard" ref={frameRef}>
      <div className="demo-bottom-sheet-standard-scroller">
        <Typography variant="title-medium">Albums</Typography>
        <ul className="demo-bottom-sheet-standard-albums">
          {ALBUMS.map((album) => (
            <li key={album} className="demo-bottom-sheet-standard-album" />
          ))}
        </ul>
      </div>
      {/* Standard sheets have no trigger — they're persistently open, so `open` is
          hardcoded true here purely for the demo. */}
      <BottomSheet variant="standard" open>
        <BottomSheetContent dragHandle={false} container={frameRef}>
          <div className="demo-bottom-sheet-standard-player">
            <div className="demo-bottom-sheet-standard-art" />
            <div className="demo-bottom-sheet-standard-info">
              <Typography variant="body-large">Cassette Futurism</Typography>
              <Typography variant="body-medium" className="demo-bottom-sheet-standard-subtitle">
                Various artists
              </Typography>
            </div>
            <IconButton
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton aria-label="Skip to next">
              <SkipNextIcon />
            </IconButton>
          </div>
        </BottomSheetContent>
      </BottomSheet>
    </div>
  );
}
