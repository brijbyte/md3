"use client";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/snackbar.css";
import "./basic.css";

import { Button } from "@brijbyte/md3-react/button";
import { SnackbarProvider, useSnackbar } from "@brijbyte/md3-react/snackbar";
import CloseIcon from "@brijbyte/md3-icons/outlined/Close";

function noop() {}

function Triggers() {
  const { showSnackbar } = useSnackbar();

  return (
    <div className="demo-snackbar-basic">
      <Button variant="filled" onClick={() => showSnackbar("Conversation archived")}>
        Message only
      </Button>
      <Button
        variant="filled"
        onClick={() =>
          showSnackbar({
            message: "Conversation archived",
            action: { label: "Undo", onClick: noop },
          })
        }
      >
        With action
      </Button>
      <Button
        variant="filled"
        onClick={() =>
          showSnackbar({
            message: "Conversation archived",
            action: { label: "Undo", onClick: noop },
            closable: true,
          })
        }
      >
        With action & close icon
      </Button>
    </div>
  );
}

export default function BasicSnackbarDemo() {
  return (
    <SnackbarProvider closeIcon={<CloseIcon />}>
      <Triggers />
    </SnackbarProvider>
  );
}
