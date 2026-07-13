"use client";

import "./funky-theme.css";
import styles from "./funky.module.css";

import * as React from "react";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { AssistChip, FilterChip } from "@/ui/chip";
import {
  Dialog,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogHeadline,
  DialogSupportingText,
  DialogTrigger,
} from "@/ui/dialog";
import { Fab } from "@/ui/fab";
import { IconButton } from "@/ui/icon-button";
import { LinearProgress } from "@/ui/linear-progress";
import { Radio, RadioGroup } from "@/ui/radio";
import { Slider } from "@/ui/slider";
import { Switch } from "@/ui/switch";
import { Tab, TabList, TabPanel, Tabs } from "@/ui/tabs";
import { TextField } from "@/ui/text-field";
import { Typography } from "@/ui/typography";

import BoltIcon from "@brijbyte/md3-icons/outlined/Bolt";
import CelebrationIcon from "@brijbyte/md3-icons/outlined/Celebration";
import FavoriteIcon from "@brijbyte/md3-icons/outlined/Favorite";
import HeadphonesIcon from "@brijbyte/md3-icons/outlined/Headphones";
import MicIcon from "@brijbyte/md3-icons/outlined/Mic";
import ShareIcon from "@brijbyte/md3-icons/outlined/Share";
import VolumeUpIcon from "@brijbyte/md3-icons/outlined/VolumeUp";

const GENRES = ["Disco", "Funk", "Soul", "House"];

export default function ShowcaseFunky() {
  const [funk, setFunk] = React.useState(true);
  const [genres, setGenres] = React.useState(() => new Set(["Disco", "Funk"]));

  const toggleGenre = (genre: string, pressed: boolean) => {
    setGenres((current) => {
      const next = new Set(current);
      if (pressed) next.add(genre);
      else next.delete(genre);
      return next;
    });
  };

  // The stage carries the theme scope; the dialog is portalled outside it, so
  // the popup re-applies the class itself (see funky-theme.css).
  const scope = funk ? "funky" : "";

  return (
    <div className={`${scope} ${styles.stage}`}>
      <header className={styles.header}>
        <div>
          <Typography as="h1" variant="display-small">
            Funk Station
          </Typography>
          <Typography as="p" variant="body-large" className={styles.tagline}>
            The stock components, reskinned by one CSS file — system tokens set the palette, shape,
            and type; the library&apos;s stable class names take the rest. Flip the switch to
            compare with baseline MD3.
          </Typography>
        </div>
        <label className={styles.funkToggle}>
          <Typography variant="title-medium">Funk mode</Typography>
          <Switch checked={funk} onCheckedChange={setFunk} />
        </label>
      </header>

      <div className={styles.grid}>
        <Card variant="filled" className={styles.tile}>
          <Typography as="h2" variant="title-large">
            Buttons
          </Typography>
          <div className={styles.row}>
            <Button variant="filled">Play</Button>
            <Button variant="tonal">Queue</Button>
            <Button variant="elevated">Shuffle</Button>
            <Button variant="outlined">Skip</Button>
            <Button variant="text">Later</Button>
            <Button variant="filled" disabled>
              Sold out
            </Button>
          </div>
          <div className={styles.row}>
            <IconButton aria-label="Like" variant="filled">
              <FavoriteIcon />
            </IconButton>
            <IconButton aria-label="Share" variant="tonal">
              <ShareIcon />
            </IconButton>
            <IconButton aria-label="Listen" variant="outlined">
              <HeadphonesIcon />
            </IconButton>
            <IconButton aria-label="Record" toggle>
              <MicIcon />
            </IconButton>
            <Fab icon={<BoltIcon />} label="Drop the beat" color="tertiary-container" />
          </div>
        </Card>

        <Card variant="filled" className={styles.tile}>
          <Typography as="h2" variant="title-large">
            Selection
          </Typography>
          <RadioGroup defaultValue="vinyl" className={styles.stack}>
            <Typography as="label" variant="body-large" className={styles.controlLabel}>
              <Radio value="vinyl" /> Vinyl
            </Typography>
            <Typography as="label" variant="body-large" className={styles.controlLabel}>
              <Radio value="cassette" /> Cassette
            </Typography>
            <Typography as="label" variant="body-large" className={styles.controlLabel}>
              <Radio value="8track" /> 8-track
            </Typography>
          </RadioGroup>
          <Typography as="label" variant="body-large" className={styles.controlLabel}>
            <Checkbox defaultChecked /> Rhinestones
          </Typography>
          <Typography as="label" variant="body-large" className={styles.controlLabel}>
            <Checkbox /> Fog machine
          </Typography>
          <label className={`${styles.controlLabel} ${styles.spaceBetween}`}>
            <Typography variant="body-large">Mirror ball</Typography>
            <Switch defaultChecked />
          </label>
        </Card>

        <Card variant="filled" className={styles.tile}>
          <Typography as="h2" variant="title-large">
            Inputs
          </Typography>
          <div className={styles.stack}>
            <TextField variant="outlined" label="Stage name" defaultValue="Disco Stu" />
            <TextField variant="filled" label="Signature move" placeholder="The moonwalk" />
            <Slider size="m" icon={<VolumeUpIcon />} defaultValue={70} aria-label="Volume" />
          </div>
        </Card>

        <Card variant="filled" className={styles.tile}>
          <Typography as="h2" variant="title-large">
            Genres
          </Typography>
          <div className={styles.row}>
            {GENRES.map((genre) => (
              <FilterChip
                key={genre}
                pressed={genres.has(genre)}
                onPressedChange={(pressed) => toggleGenre(genre, pressed)}
              >
                {genre}
              </FilterChip>
            ))}
            <AssistChip icon={<CelebrationIcon />}>Surprise me</AssistChip>
          </div>
          <div className={styles.stack}>
            <Typography variant="label-large">Set progress</Typography>
            <LinearProgress value={70} aria-label="Set progress" />
            <Typography variant="label-large">Crowd energy</Typography>
            <LinearProgress value={85} wavy aria-label="Crowd energy" />
          </div>
        </Card>

        <Card variant="filled" className={styles.tile}>
          <Typography as="h2" variant="title-large">
            Tonight
          </Typography>
          <Tabs defaultValue="lineup" className={styles.stack}>
            <TabList aria-label="Tonight">
              <Tab value="lineup">Lineup</Tab>
              <Tab value="setlist">Setlist</Tab>
              <Tab value="crew">Crew</Tab>
            </TabList>
            <TabPanel value="lineup" className={styles.tabPanel}>
              <Typography variant="body-medium">
                Doors at nine. The Groove Collective opens, Neon Brass closes.
              </Typography>
            </TabPanel>
            <TabPanel value="setlist" className={styles.tabPanel}>
              <Typography variant="body-medium">
                Twelve tracks, two encores, one extended cowbell solo.
              </Typography>
            </TabPanel>
            <TabPanel value="crew" className={styles.tabPanel}>
              <Typography variant="body-medium">
                Two on lights, one on fog, everyone on tambourine.
              </Typography>
            </TabPanel>
          </Tabs>
          <Dialog>
            <DialogTrigger render={<Button variant="filled" />}>Book a gig</DialogTrigger>
            <DialogContent className={scope}>
              <DialogHeadline>Book Funk Station?</DialogHeadline>
              <DialogSupportingText>
                The band brings the horns and the hard shadows. You bring a dance floor and a power
                outlet.
              </DialogSupportingText>
              <DialogActions>
                <DialogClose render={<Button variant="text" />}>Not yet</DialogClose>
                <DialogClose render={<Button variant="filled" />}>Book it</DialogClose>
              </DialogActions>
            </DialogContent>
          </Dialog>
        </Card>
      </div>

      <Typography as="p" variant="body-medium" className={styles.footer}>
        How it works: the theme is a single stylesheet, <code>funky-theme.css</code>, scoped under
        one class. It overrides system tokens (<code>--md-sys-*</code>) for color, shape, and type,
        then restyles individual parts through the library&apos;s stable class names (
        <code>.md3-button-root</code>, <code>.md3-tabs-indicator</code>, …) — the library&apos;s own
        CSS lives in <code>@layer components</code>, so plain consumer rules win without specificity
        hacks.
      </Typography>
    </div>
  );
}
