"use client";
import * as React from "react";
import CheckIcon from "@brijbyte/md3-icons/outlined/Check";
import LinkIcon from "@brijbyte/md3-icons/outlined/Link";

// Hover-revealed anchor on headings: copies the deep link (no navigation),
// flashing a check icon as confirmation. Parent must be a `group`.
export function HeadingAnchor({ id }: { id: string }) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <a
      href={`#${id}`}
      aria-label={copied ? "Link copied" : "Copy link to section"}
      className="ms-2 inline-flex align-middle text-xl text-on-surface-variant opacity-0 transition-opacity hover:text-primary focus-visible:opacity-100 group-hover:opacity-100"
      onClick={async (event) => {
        event.preventDefault(); // copy only — don't scroll/jump to the hash
        await navigator.clipboard.writeText(new URL(`#${id}`, window.location.href).href);
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <CheckIcon /> : <LinkIcon />}
    </a>
  );
}
