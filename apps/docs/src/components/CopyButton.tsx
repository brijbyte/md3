"use client";
import * as React from "react";
import CheckIcon from "@brijbyte/md3-icons/outlined/Check";
import ContentCopyIcon from "@brijbyte/md3-icons/outlined/ContentCopy";
import { IconButton, type IconButtonSize } from "@brijbyte/md3-react/icon-button";

// Copies `text` to the clipboard, flashing a check icon as confirmation.
export function CopyButton({
  text,
  className,
  size,
}: {
  text: string;
  className?: string;
  size?: IconButtonSize;
}) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <IconButton
      aria-label={copied ? "Copied" : "Copy code"}
      size={size}
      className={className}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <CheckIcon /> : <ContentCopyIcon />}
    </IconButton>
  );
}
