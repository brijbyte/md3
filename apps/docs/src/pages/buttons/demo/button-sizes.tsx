"use client";
import "./button-sizes.css";

import * as React from "react";
import { Button, type ButtonSize } from "@brijbyte/md3-react/button";
import EditIcon from "@brijbyte/md3-icons/outlined/Edit";
import { Row } from "./row";
import { SizePicker } from "./size-picker";

const sizes: ButtonSize[] = ["xsmall", "small", "medium", "large", "xlarge"];

export default function ButtonSizesDemo() {
  const [size, setSize] = React.useState<ButtonSize>("small");
  return (
    <>
      <SizePicker sizes={sizes} value={size} onChange={setSize} />
      <Row>
        <Button size={size} icon={<EditIcon />}>
          Edit
        </Button>
        <Button size={size} variant="outlined">
          Edit
        </Button>
      </Row>
    </>
  );
}
