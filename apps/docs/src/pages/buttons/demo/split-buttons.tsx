"use client";
import "./split-buttons.css";

import * as React from "react";
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonMenu,
  type SplitButtonSize,
  type SplitButtonVariant,
} from "@brijbyte/md3-react/split-button";
import EditIcon from "@brijbyte/md3-icons/outlined/Edit";
import ArrowDownIcon from "@brijbyte/md3-icons/outlined/KeyboardArrowDown";
import { Row } from "./row";
import { SizePicker } from "./size-picker";

const variants: SplitButtonVariant[] = ["filled", "tonal", "elevated", "outlined"];
const sizes: SplitButtonSize[] = ["xsmall", "small", "medium", "large", "xlarge"];

// Menu-open styling keys off aria-expanded; a real app would get it from a
// menu trigger (e.g. Base UI Menu.Trigger via the render prop).
function OpenableSplitButton(props: { variant?: SplitButtonVariant; size?: SplitButtonSize }) {
  const [open, setOpen] = React.useState(false);
  return (
    <SplitButton {...props}>
      <SplitButtonAction icon={<EditIcon />}>Edit</SplitButtonAction>
      <SplitButtonMenu
        aria-label="More actions"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <ArrowDownIcon />
      </SplitButtonMenu>
    </SplitButton>
  );
}

export default function SplitButtonsDemo() {
  const [size, setSize] = React.useState<SplitButtonSize>("small");
  return (
    <>
      <SizePicker sizes={sizes} value={size} onChange={setSize} />
      {variants.map((variant) => (
        <Row key={variant} label={variant}>
          <OpenableSplitButton variant={variant} size={size} />
        </Row>
      ))}
      <Row label="disabled">
        <SplitButton size={size}>
          <SplitButtonAction icon={<EditIcon />} disabled>
            Edit
          </SplitButtonAction>
          <SplitButtonMenu aria-label="More actions" disabled>
            <ArrowDownIcon />
          </SplitButtonMenu>
        </SplitButton>
      </Row>
    </>
  );
}
