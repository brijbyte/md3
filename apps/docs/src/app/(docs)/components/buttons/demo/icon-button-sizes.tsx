"use client";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/icon-button.css";
import * as React from "react";
import { IconButton, type IconButtonSize } from "@brijbyte/md3-react/icon-button";
import HeartIcon from "@brijbyte/md3-icons/outlined/Favorite";
import { Row } from "./row";
import { SizePicker } from "./size-picker";

const sizes: IconButtonSize[] = ["xsmall", "small", "medium", "large", "xlarge"];

export default function IconButtonSizesDemo() {
  const [size, setSize] = React.useState<IconButtonSize>("small");
  return (
    <>
      <SizePicker sizes={sizes} value={size} onChange={setSize} />
      <Row label="widths">
        <IconButton variant="filled" size={size} width="narrow" aria-label="Favorite">
          <HeartIcon />
        </IconButton>
        <IconButton variant="filled" size={size} aria-label="Favorite">
          <HeartIcon />
        </IconButton>
        <IconButton variant="filled" size={size} width="wide" aria-label="Favorite">
          <HeartIcon />
        </IconButton>
      </Row>
      <Row label="toggles">
        <IconButton variant="tonal" size={size} shape="square" aria-label="Favorite" toggle>
          <HeartIcon />
        </IconButton>
        <IconButton variant="outlined" size={size} aria-label="Favorite" toggle>
          <HeartIcon />
        </IconButton>
      </Row>
    </>
  );
}
