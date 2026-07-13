"use client";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/dialog.css";
import { Button } from "@brijbyte/md3-react/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogIcon,
  DialogHeadline,
  DialogSupportingText,
  DialogActions,
  DialogClose,
} from "@brijbyte/md3-react/dialog";
import RestartAltIcon from "@brijbyte/md3-icons/outlined/RestartAlt";

export default function HeroIconDialogDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outlined" />}>Reset settings</DialogTrigger>
      <DialogContent>
        <DialogIcon>
          <RestartAltIcon />
        </DialogIcon>
        <DialogHeadline>Reset all settings?</DialogHeadline>
        <DialogSupportingText>
          This resets display, sound, and notification preferences back to their defaults. Your data
          and downloads are not affected.
        </DialogSupportingText>
        <DialogActions>
          <DialogClose render={<Button variant="text" />}>Cancel</DialogClose>
          <DialogClose render={<Button variant="text" />}>Reset</DialogClose>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
