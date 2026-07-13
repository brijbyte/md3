"use client";
import "./basic.css";

import { Button } from "@brijbyte/md3-react/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeadline,
  DialogSupportingText,
  DialogActions,
  DialogClose,
} from "@brijbyte/md3-react/dialog";

export default function BasicDialogDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="filled" />}>Delete photos</DialogTrigger>
      <DialogContent>
        <DialogHeadline>Delete selected photos?</DialogHeadline>
        <DialogSupportingText>
          Photos will be removed from your account and all synced devices. This can&apos;t be
          undone.
        </DialogSupportingText>
        <DialogActions>
          <DialogClose render={<Button variant="text" />}>Cancel</DialogClose>
          <DialogClose render={<Button variant="text" />}>Delete</DialogClose>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
