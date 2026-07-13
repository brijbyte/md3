"use client";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/split-button.css";
import "@brijbyte/md3-react/menu.css";
import * as React from "react";
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonMenu,
  type SplitButtonSize,
  type SplitButtonVariant,
} from "@brijbyte/md3-react/split-button";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@brijbyte/md3-react/menu";
import EditIcon from "@brijbyte/md3-icons/outlined/Edit";
import ArrowDownIcon from "@brijbyte/md3-icons/outlined/KeyboardArrowDown";
import DeleteIcon from "@brijbyte/md3-icons/outlined/Delete";
import DownloadIcon from "@brijbyte/md3-icons/outlined/Download";
import LinkIcon from "@brijbyte/md3-icons/outlined/Link";
import { Row } from "./row";
import { SizePicker } from "./size-picker";

const variants: SplitButtonVariant[] = ["filled", "tonal", "elevated", "outlined"];
const sizes: SplitButtonSize[] = ["xsmall", "small", "medium", "large", "xlarge"];

// SplitButtonMenu's open/spin styling keys off aria-expanded/data-popup-open, which
// Base UI's Menu.Trigger sets automatically via `render`.
function OpenableSplitButton(props: { variant?: SplitButtonVariant; size?: SplitButtonSize }) {
  return (
    <SplitButton {...props}>
      <SplitButtonAction icon={<EditIcon />}>Edit</SplitButtonAction>
      <Menu>
        <MenuTrigger render={<SplitButtonMenu aria-label="More actions" />}>
          <ArrowDownIcon />
        </MenuTrigger>
        <MenuContent>
          <MenuItem leadingIcon={<LinkIcon />}>Copy link</MenuItem>
          <MenuItem leadingIcon={<DownloadIcon />}>Download</MenuItem>
          <MenuSeparator />
          <MenuItem leadingIcon={<DeleteIcon />}>Delete</MenuItem>
        </MenuContent>
      </Menu>
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
