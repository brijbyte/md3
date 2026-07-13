"use client";
import "./standard.css";

import * as React from "react";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import { BottomSheet, BottomSheetContent } from "@brijbyte/md3-react/bottom-sheet";
import { Slider } from "@brijbyte/md3-react/slider";
import { Typography } from "@brijbyte/md3-react/typography";
import PlayArrowIcon from "@brijbyte/md3-icons/outlined/PlayArrow";
import PauseIcon from "@brijbyte/md3-icons/outlined/Pause";
import SkipNextIcon from "@brijbyte/md3-icons/outlined/SkipNext";
import SkipPreviousIcon from "@brijbyte/md3-icons/outlined/SkipPrevious";

// Free-to-play demo tracks from SoundHelix (algorithmically composed, CORS-enabled).
const TRACKS = [
  {
    title: "Cassette Futurism",
    artist: "T. Schürger",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    hue: 265,
  },
  {
    title: "Night Drive",
    artist: "T. Schürger",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    hue: 210,
  },
  {
    title: "Late Bloom",
    artist: "T. Schürger",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    hue: 150,
  },
  {
    title: "Analog Dust",
    artist: "T. Schürger",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    hue: 25,
  },
  {
    title: "Signal Bloom",
    artist: "T. Schürger",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    hue: 335,
  },
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function StandardBottomSheetDemo() {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const albumRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const track = TRACKS[index];
  // Duration is only usable once metadata loads (NaN before, Infinity for open streams).
  const ready = Number.isFinite(duration) && duration > 0;

  // Play/pause the underlying element whenever the intent or track changes.
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing, index]);

  // Keep the active album tile visible — scroll only the container, never the page
  // (scrollIntoView would bubble up and scroll every ancestor). Skip the initial mount.
  const mounted = React.useRef(false);
  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const scroller = scrollerRef.current;
    const tile = albumRefs.current[index];
    if (!scroller || !tile) return;
    const tileRect = tile.getBoundingClientRect();
    const scRect = scroller.getBoundingClientRect();
    const delta = tileRect.top - scRect.top - (scroller.clientHeight - tile.clientHeight) / 2;
    scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: "smooth" });
  }, [index]);

  const skip = (delta: number) => {
    setIndex((i) => (i + delta + TRACKS.length) % TRACKS.length);
    setCurrent(0);
    setDuration(0);
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = value;
    setCurrent(value);
  };

  return (
    <div className="demo-bottom-sheet-standard" ref={frameRef}>
      <audio
        ref={audioRef}
        src={track.src}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => skip(1)}
      />
      <div className="demo-bottom-sheet-standard-scroller" ref={scrollerRef}>
        <Typography variant="title-medium">Albums</Typography>
        <ul className="demo-bottom-sheet-standard-albums">
          {TRACKS.map((t, i) => (
            <li key={t.title}>
              <button
                type="button"
                ref={(el) => {
                  albumRefs.current[i] = el;
                }}
                className="demo-bottom-sheet-standard-album"
                data-active={i === index || undefined}
                style={{
                  background: `linear-gradient(135deg, hsl(${t.hue} 55% 55%), hsl(${t.hue + 40} 60% 40%))`,
                }}
                onClick={() => {
                  setIndex(i);
                  setCurrent(0);
                  setDuration(0);
                  setPlaying(true);
                }}
              >
                <Typography variant="label-large">{t.title}</Typography>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Standard sheets have no trigger — they're persistently open, so `open` is
          hardcoded true here purely for the demo. */}
      <BottomSheet variant="standard" open>
        <BottomSheetContent dragHandle={false} container={frameRef}>
          <div className="demo-bottom-sheet-standard-player">
            <div
              className="demo-bottom-sheet-standard-art"
              style={{
                background: `linear-gradient(135deg, hsl(${track.hue} 55% 55%), hsl(${track.hue + 40} 60% 40%))`,
              }}
            />
            <div className="demo-bottom-sheet-standard-info">
              <Typography variant="body-large">{track.title}</Typography>
              <Typography variant="body-medium" className="demo-bottom-sheet-standard-subtitle">
                {track.artist}
              </Typography>
            </div>
            <IconButton aria-label="Previous track" onClick={() => skip(-1)}>
              <SkipPreviousIcon />
            </IconButton>
            <IconButton
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton aria-label="Skip to next" onClick={() => skip(1)}>
              <SkipNextIcon />
            </IconButton>
          </div>
          <div className="demo-bottom-sheet-standard-progress">
            <Typography variant="label-small" className="demo-bottom-sheet-standard-time">
              {formatTime(current)}
            </Typography>
            <Slider
              className="demo-bottom-sheet-standard-seek"
              aria-label="Seek"
              min={0}
              max={ready ? duration : 1}
              step={1}
              ticks={ready ? 30 : false}
              formatValue={formatTime}
              value={ready ? Math.min(current, duration) : 0}
              onValueChange={(v) => seek(v as number)}
            />
            <Typography variant="label-small" className="demo-bottom-sheet-standard-time">
              {formatTime(duration)}
            </Typography>
          </div>
        </BottomSheetContent>
      </BottomSheet>
    </div>
  );
}
