"use client";
import "./full-screen.css";

import { Button } from "@brijbyte/md3-react/button";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogHeadline,
  DialogClose,
} from "@brijbyte/md3-react/dialog";
import { TextField } from "@brijbyte/md3-react/text-field";
import CloseIcon from "@brijbyte/md3-icons/outlined/Close";

export default function FullScreenDialogDemo() {
  return (
    <Dialog variant="full-screen">
      <DialogTrigger render={<Button variant="filled" />}>New event</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogClose render={<IconButton aria-label="Close" variant="standard" />}>
            <CloseIcon />
          </DialogClose>
          <DialogHeadline>New event</DialogHeadline>
          <DialogClose render={<Button variant="text" />}>Save</DialogClose>
        </DialogHeader>
        <form className="demo-dialog-full-screen-form">
          <TextField label="Event title" variant="outlined" />
          <TextField label="Date" variant="outlined" defaultValue="Mon, Jul 6" />
          <div className="demo-dialog-full-screen-times">
            <TextField label="From" variant="outlined" defaultValue="10:00 AM" />
            <TextField label="To" variant="outlined" defaultValue="11:00 AM" />
          </div>
          <TextField label="Location" variant="outlined" />
        </form>
      </DialogContent>
    </Dialog>
  );
}
