"use client";
import "./two-line.css";

import { Button } from "@brijbyte/md3-react/button";
import { SnackbarProvider, useSnackbar } from "@brijbyte/md3-react/snackbar";

function noop() {}

function Trigger() {
  const { showSnackbar } = useSnackbar();

  return (
    <Button
      variant="filled"
      onClick={() =>
        showSnackbar({
          message:
            "Your photo library is almost full. Some backups may be delayed until you free up space on this device.",
          action: { label: "Manage", onClick: noop },
        })
      }
    >
      Show two-line snackbar
    </Button>
  );
}

export default function TwoLineSnackbarDemo() {
  return (
    <SnackbarProvider>
      <Trigger />
    </SnackbarProvider>
  );
}
