"use client";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/dialog.css";
import "@brijbyte/md3-react/radio.css";
import "@brijbyte/md3-react/typography.css";
import "./list.css";

import { Button } from "@brijbyte/md3-react/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeadline,
  DialogBody,
  DialogActions,
  DialogClose,
} from "@brijbyte/md3-react/dialog";
import { Radio, RadioGroup } from "@brijbyte/md3-react/radio";
import { Typography } from "@brijbyte/md3-react/typography";

const RINGTONES = [
  "None",
  "Callisto",
  "Ganymede",
  "Luna",
  "Rrrring",
  "Beats",
  "Dance party",
  "Zen too",
];

export default function ListDialogDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="tonal" />}>Phone ringtone</DialogTrigger>
      <DialogContent className="demo-dialog-list">
        <DialogHeadline>Phone ringtone</DialogHeadline>
        <DialogBody>
          <RadioGroup defaultValue="Luna" className="demo-dialog-list-group">
            {RINGTONES.map((name) => (
              <label key={name} className="demo-dialog-list-row">
                <Radio value={name} />
                <Typography variant="body-large">{name}</Typography>
              </label>
            ))}
          </RadioGroup>
        </DialogBody>
        <DialogActions>
          <DialogClose render={<Button variant="text" />}>Cancel</DialogClose>
          <DialogClose render={<Button variant="text" />}>OK</DialogClose>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
