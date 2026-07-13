"use client";
import "@brijbyte/md3-react/tokens.css";
import "@brijbyte/md3-react/ripple.css";
import "@brijbyte/md3-react/icon-button.css";
import "@brijbyte/md3-react/snackbar.css";
import "./undo.css";

import * as React from "react";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import DeleteIcon from "@brijbyte/md3-icons/outlined/Delete";
import { SnackbarProvider, useSnackbar } from "@brijbyte/md3-react/snackbar";

const EMAILS = ["Quarterly report", "Team offsite photos", "Design review notes"];

function EmailList() {
  const [emails, setEmails] = React.useState(EMAILS);
  const { showSnackbar } = useSnackbar();

  function remove(index: number) {
    const email = emails[index];
    setEmails((current) => current.filter((_, i) => i !== index));
    showSnackbar({
      message: `"${email}" deleted`,
      action: {
        label: "Undo",
        onClick: () =>
          setEmails((current) => [...current.slice(0, index), email, ...current.slice(index)]),
      },
    });
  }

  return (
    <ul className="demo-snackbar-undo">
      {emails.map((email, index) => (
        <li key={email}>
          <span>{email}</span>
          <IconButton aria-label={`Delete "${email}"`} onClick={() => remove(index)}>
            <DeleteIcon />
          </IconButton>
        </li>
      ))}
      {emails.length === 0 ? <li className="demo-snackbar-undo-empty">Inbox zero.</li> : null}
    </ul>
  );
}

export default function UndoSnackbarDemo() {
  return (
    <SnackbarProvider>
      <EmailList />
    </SnackbarProvider>
  );
}
