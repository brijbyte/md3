"use client";
import "@brijbyte/md3-react/text-field.css";
import "@brijbyte/md3-react/icon-button.css";
import "./icons.css";
import * as React from "react";
import { TextField } from "@brijbyte/md3-react/text-field";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import SearchIcon from "@brijbyte/md3-icons/outlined/Search";
import CloseIcon from "@brijbyte/md3-icons/outlined/Close";
import VisibilityIcon from "@brijbyte/md3-icons/outlined/Visibility";
import VisibilityOffIcon from "@brijbyte/md3-icons/outlined/VisibilityOff";

export default function TextFieldIconsDemo() {
  const [query, setQuery] = React.useState("");
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="demo-text-field-icons">
      <TextField
        label="Search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        leadingIcon={<SearchIcon />}
        trailingIcon={
          query ? (
            <IconButton aria-label="Clear search" size="xsmall" onClick={() => setQuery("")}>
              <CloseIcon />
            </IconButton>
          ) : undefined
        }
      />
      <TextField
        variant="outlined"
        label="Password"
        type={visible ? "text" : "password"}
        trailingIcon={
          <IconButton
            aria-label={visible ? "Hide password" : "Show password"}
            size="xsmall"
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        }
      />
    </div>
  );
}
