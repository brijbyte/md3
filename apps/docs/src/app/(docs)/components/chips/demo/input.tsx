"use client";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/chip.css";
import "./input.css";

import * as React from "react";
import { InputChip } from "@brijbyte/md3-react/chip";

const RECIPIENTS = ["Ada Lovelace", "Grace Hopper", "Katherine Johnson"];

export default function InputChipsDemo() {
  const [recipients, setRecipients] = React.useState(RECIPIENTS);

  return (
    <div className="demo-input-chips">
      {recipients.map((name) => (
        <InputChip
          key={name}
          avatar={<span className="demo-input-chips-avatar">{name[0]}</span>}
          onRemove={() => setRecipients(recipients.filter((r) => r !== name))}
          removeLabel={`Remove ${name}`}
        >
          {name}
        </InputChip>
      ))}
      {recipients.length === 0 && (
        <button className="demo-input-chips-reset" onClick={() => setRecipients(RECIPIENTS)}>
          Reset
        </button>
      )}
    </div>
  );
}
