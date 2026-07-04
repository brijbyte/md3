"use client";
import "./input-states.css";

import { InputChip } from "@brijbyte/md3-react/chip";
import EventIcon from "@brijbyte/md3-icons/outlined/Event";

function noop() {}

export default function InputChipStatesDemo() {
  return (
    <div className="demo-input-chip-states">
      <InputChip onRemove={noop}>Plain</InputChip>
      <InputChip icon={<EventIcon />} onRemove={noop}>
        With icon
      </InputChip>
      <InputChip selected onRemove={noop}>
        Selected
      </InputChip>
      <InputChip disabled onRemove={noop}>
        Disabled
      </InputChip>
    </div>
  );
}
