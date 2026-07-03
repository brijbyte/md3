import "./groups.css";

import type * as React from "react";
import { Radio, RadioGroup } from "@brijbyte/md3-react/radio";

const rowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 16,
  paddingBlock: 8,
};

const labelStyle: React.CSSProperties = {
  width: 90,
  flexShrink: 0,
  textTransform: "capitalize",
  fontFamily: "var(--md-sys-typescale-label-large-font)",
  fontSize: "var(--md-sys-typescale-label-large-size)",
  lineHeight: "var(--md-sys-typescale-label-large-line-height)",
  fontWeight: 500,
  letterSpacing: "var(--md-sys-typescale-label-large-tracking)",
  color: "var(--md-sys-color-on-surface-variant)",
};

export default function RadioGroupsDemo() {
  return (
    <>
      <div style={rowStyle}>
        <span style={labelStyle}>group</span>
        <RadioGroup defaultValue="a" style={{ display: "flex", gap: 8 }}>
          <Radio value="a" aria-label="Option A" />
          <Radio value="b" aria-label="Option B" />
          <Radio value="c" aria-label="Option C" disabled />
        </RadioGroup>
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>disabled</span>
        <RadioGroup defaultValue="a" disabled style={{ display: "flex", gap: 8 }}>
          <Radio value="a" aria-label="Disabled selected" />
          <Radio value="b" aria-label="Disabled unselected" />
        </RadioGroup>
      </div>
    </>
  );
}
